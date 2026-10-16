import { describe, expect, test, vi } from "vitest";
import { liveApiProxy, warnIfAbsoluteApiUrl, LIVE_API_ORIGIN } from "./liveApiProxy.mjs";

describe("liveApiProxy", () => {
  test("defaults to the live API", () => {
    expect(liveApiProxy()["/api"].target).toBe(LIVE_API_ORIGIN);
  });

  test("override wins", () => {
    expect(liveApiProxy({ target: "http://localhost:3000" })["/api"].target).toBe(
      "http://localhost:3000",
    );
  });

  test("empty override falls back to the live API", () => {
    expect(liveApiProxy({ target: "" })["/api"].target).toBe(LIVE_API_ORIGIN);
  });

  test("strips Origin", () => {
    const removed = [];
    const handlers = {};
    liveApiProxy()["/api"].configure({ on: (e, fn) => (handlers[e] = fn) });
    handlers.proxyReq({ removeHeader: (h) => removed.push(h) });
    expect(removed).toEqual(["origin"]);
  });
});

describe("warnIfAbsoluteApiUrl", () => {
  test("warns on absolute VITE_API_URL", () => {
    const log = vi.fn();
    expect(warnIfAbsoluteApiUrl({ VITE_API_URL: "https://api.empowered.vote" }, log)).toBe(true);
    expect(log.mock.calls[0][0]).toMatch(/VITE_API_URL.*unset it for local dev/);
  });

  test("warns differently when VITE_API_URL points at a local backend", () => {
    for (const v of ["http://localhost:3000", "http://127.0.0.1:5050", "http://[::1]:3000", "http://0.0.0.0:3000"]) {
      const log = vi.fn();
      expect(warnIfAbsoluteApiUrl({ VITE_API_URL: v }, log)).toBe(true);
      expect(log.mock.calls[0][0]).toMatch(/local backend.*unset it to use live data/);
    }
  });

  test("silent when unset, blank or relative", () => {
    for (const v of [undefined, "", "  ", "/api"]) {
      expect(warnIfAbsoluteApiUrl({ VITE_API_URL: v }, vi.fn())).toBe(false);
    }
  });
});
