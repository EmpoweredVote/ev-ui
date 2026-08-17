/**
 * Regression guard for the radar chart's animated polygons.
 *
 * react-spring interpolates a string by extracting its numbers and requires
 * that count — its "arity" — to match on both ends of the animation. A
 * polygon's arity is 2x the spoke count, so changing the spoke count mid-flight
 * makes the old and new values un-interpolable. A DECREASE throws
 * `The arity of each "output" value must be equal`; going from no spokes to
 * some throws `Cannot animate between _AnimatedValue and _AnimatedString`.
 *
 * This shipped once (22 crashes over 14 sessions on essentials /results and
 * /politician/*) and the guard that was supposed to prevent it looked correct:
 * a `countChanged` flag, `immediate`/`reset` on the spring, and a swap to a
 * static <polygon>. It could not work, because a spring declared in the parent
 * updates on every render regardless of what the parent renders — so the throw
 * happened underneath the static fallback — and because the change detector
 * compared a spoke count floored at 1, which hid the 0 -> 1 case.
 *
 * The fix keys each spring by spoke count so React remounts it at the new
 * arity. If someone later hoists `useSpring` back into the parent, or drops the
 * key, these tests fail.
 *
 * Note: react-spring raises this from inside its scheduleProps promise chain
 * (_merge -> _start -> AnimatedString.reset), so it arrives as an unhandled
 * rejection rather than a render-phase throw. Asserting on render alone would
 * miss it entirely — hence the process-level capture below.
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import RadarChartCore from "./RadarChartCore.jsx";

const TOPICS = Array.from({ length: 12 }, (_, i) => ({
  short_title: `T${i}`,
  stances: Array.from({ length: 5 }, (_, s) => s),
}));

const dataWith = (n) =>
  Object.fromEntries(Array.from({ length: n }, (_, i) => [`T${i}`, (i % 5) + 1]));

const USER_POLYGON_FILL = "rgba(124, 107, 158, 0.4)";

afterEach(cleanup);

/** Render at `from` spokes, rerender at `to`, and collect every error raised. */
async function transition(from, to, extraProps = {}) {
  const errors = [];
  const onRejection = (r) => errors.push(r?.message ?? String(r));
  const onError = (e) => errors.push(e?.error?.message ?? e?.message ?? String(e));

  process.on("unhandledRejection", onRejection);
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  try {
    const view = render(
      <svg>
        <RadarChartCore topics={TOPICS} data={dataWith(from)} {...extraProps} />
      </svg>,
    );
    view.rerender(
      <svg>
        <RadarChartCore topics={TOPICS} data={dataWith(to)} {...extraProps} />
      </svg>,
    );
    // Let react-spring's promise chain and frame loop run.
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 10));
    }
  } catch (e) {
    errors.push(e.message);
  } finally {
    process.off("unhandledRejection", onRejection);
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  }
  return errors;
}

describe("RadarChartCore spoke-count transitions", () => {
  // Decreases are what actually threw in production: react-spring only
  // validates indices present in the first value, so an increase silently
  // drops the extra points instead of erroring.
  const CASES = [
    ["12 -> 5 spokes (decrease)", 12, 5],
    ["8 -> 3 spokes (decrease)", 8, 3],
    ["5 -> 1 spoke (decrease)", 5, 1],
    ["1 -> 0 spokes (emptied)", 1, 0],
    ["0 -> 1 spoke (first load)", 0, 1],
    ["0 -> 8 spokes (first load)", 0, 8],
    ["5 -> 8 spokes (increase)", 5, 8],
  ];

  for (const [label, from, to] of CASES) {
    it(`raises nothing on ${label}`, async () => {
      expect(await transition(from, to)).toEqual([]);
    });
  }

  it("raises nothing on a decrease while compare data is present", async () => {
    expect(await transition(12, 5, { compareData: dataWith(12) })).toEqual([]);
  });

  it("keeps the polygon in step with the current spoke count", async () => {
    const { container, rerender } = render(
      <svg>
        <RadarChartCore topics={TOPICS} data={dataWith(8)} />
      </svg>,
    );
    // The chart also draws its grid rings as <polygon>; select the data
    // polygon by fill so the grid can't satisfy the assertion instead.
    const dataPolygon = () =>
      [...container.querySelectorAll("polygon")].find(
        (p) => p.style.fill === USER_POLYGON_FILL,
      );
    const pointCount = () =>
      dataPolygon()?.getAttribute("points")?.trim().split(/\s+/).length;

    expect(pointCount()).toBe(8);

    rerender(
      <svg>
        <RadarChartCore topics={TOPICS} data={dataWith(5)} />
      </svg>,
    );
    expect(pointCount()).toBe(5);

    rerender(
      <svg>
        <RadarChartCore topics={TOPICS} data={dataWith(0)} />
      </svg>,
    );
    expect(dataPolygon()).toBeUndefined();
  });
});
