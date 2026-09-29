/**
 * Guards the distinction between "we have not found a portrait" and "a portrait exists and its
 * publisher has reserved it".
 *
 * These two look identical in the data — both have no image URL — and before this change they
 * rendered identically too, as the initials avatar. That avatar is a claim: it says the seat has
 * no face because the work is unfinished. For South Dakota's 105 legislators that claim is
 * false; the Legislative Research Council told us on 2026-09-29 that permission rests with each
 * member, so the portrait was found and may not be shown.
 *
 * The failure this pins is silent. If someone drops the `portraitRestricted` branch, or reorders
 * it below the initials fallback, nothing throws and no test that merely renders a card notices
 * — the page just quietly goes back to blaming us for somebody else's decision. So each test
 * asserts on which of the two placeholders appeared, never merely that something rendered.
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import React from "react";
import PoliticianCard from "./PoliticianCard.jsx";

afterEach(cleanup);

const NAME = "Al Novstrup";

describe("PoliticianCard portrait placeholders", () => {
  it("renders INITIALS when there is no photo and nothing blocks one", () => {
    const { container } = render(
      <PoliticianCard name={NAME} title="South Dakota House of Representatives" />
    );
    expect(screen.getByText("AN")).toBeTruthy();
    expect(container.querySelector("svg circle")).toBeNull();
  });

  it("renders the FIGURE, not initials, when the portrait is restricted", () => {
    const { container } = render(
      <PoliticianCard
        name={NAME}
        title="South Dakota House of Representatives"
        portraitRestricted
      />
    );
    // The whole point: the initials must be GONE, not merely accompanied by a figure.
    expect(screen.queryByText("AN")).toBeNull();
    expect(container.querySelector("svg circle")).toBeTruthy();
  });

  it("describes the restriction to a screen reader instead of announcing a portrait", () => {
    render(
      <PoliticianCard
        name={NAME}
        title="South Dakota House of Representatives"
        portraitRestricted
      />
    );
    const img = screen.getByRole("img");
    expect(img.getAttribute("aria-label")).toContain(NAME);
    expect(img.getAttribute("aria-label")).toMatch(/reserved/i);
    // It must not claim to BE the person's portrait.
    expect(img.getAttribute("aria-label")).not.toMatch(/^Al Novstrup portrait$/);
  });

  it("prefers a real photograph over the restriction, so a granted portrait just appears", () => {
    // A member who grants permission gets an imageSrc. Nothing else about the record changes
    // in that moment, so the flag may still be set on the row when the photo arrives. The photo
    // must win, or granting permission would have no visible effect.
    const { container } = render(
      <PoliticianCard
        name={NAME}
        title="South Dakota House of Representatives"
        imageSrc="https://example.test/al.jpg"
        portraitRestricted
      />
    );
    expect(container.querySelector("img")).toBeTruthy();
    expect(container.querySelector("svg circle")).toBeNull();
    expect(screen.queryByText("AN")).toBeNull();
  });

  it("falls back to the FIGURE, never to initials, when a restricted card's image 404s", () => {
    // imgError sends the card down the placeholder path. A restricted person must not land on
    // initials there either — that is the same wrong claim by a different route.
    const { container } = render(
      <PoliticianCard
        name={NAME}
        title="South Dakota House of Representatives"
        imageSrc="https://example.test/missing.jpg"
        portraitRestricted
      />
    );
    //
    // ⚠ This test was written first with `img.dispatchEvent(new Event("error"))` and it PASSED
    // against a deliberately broken component. A raw DOM event never reaches React's synthetic
    // onError, so the <img> simply stayed on screen and "initials are absent" was true for the
    // wrong reason. fireEvent goes through React's handler. The tamper run is what caught it.
    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    fireEvent.error(img);

    // The image is gone, and what replaced it is the figure — not the initials.
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg circle")).toBeTruthy();
    expect(screen.queryByText("AN")).toBeNull();
  });
});
