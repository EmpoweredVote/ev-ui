/**
 * Guards the promise that makes the contact-badge and brand-mark work shippable:
 * that it changes nothing for a consumer who does not ask for it.
 *
 * `ev-ui` publishes to six apps — CompassV2, essentials, read-rank, civic-spaces,
 * treasury-tracker and empowered-badges — and each one's bump PR auto-merges for a
 * patch or minor release once its `build` check passes. That check proves the app
 * still compiles; nothing in it looks at the page. So a restyle that arrives on by
 * default reaches five products that never reviewed it, and the first person to
 * notice is a reader. The flags exist for exactly that reason, and a default that
 * silently flips is the failure worth pinning.
 *
 * The second group pins a bug the first version of this work shipped with. The rule
 * for dropping the box around the filled LinkedIn tile keyed on `link.label ===
 * "LinkedIn"`, but a LinkedIn URL arriving through `extraLinks` is labelled by
 * title-casing the detected platform, which yields "Linkedin" — same link, different
 * string, no match. Keying on the platform instead fixes it, and only a test that
 * supplies the URL *through extraLinks* can tell the two paths apart: pass it as the
 * `linkedin` prop and the broken version looks correct.
 */
import { describe, it, expect, afterEach, beforeAll } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import PoliticianProfile from "./PoliticianProfile.jsx";
import SocialLinks from "./SocialLinks.jsx";
import PlaceholderRadar from "./PlaceholderRadar.jsx";

// jsdom ships no matchMedia, and PoliticianProfile reaches for it through
// useMediaQuery on first render. Report "does not match" so the component takes
// its desktop branch; none of these assertions depend on the breakpoint.
beforeAll(() => {
  if (typeof window.matchMedia !== "function") {
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    });
  }
});

afterEach(cleanup);

const politician = {
  full_name: "Jane Doe",
  addresses: [{ contact_type: "office", street: "1 Main St", city: "Springfield", state: "IL", zip: "62701" }],
  contacts: [{ contact_type: "office", phone: "555-0100", email: "jane@example.gov" }],
};

describe("PoliticianProfile contact presentation", () => {
  it("renders no contact badges unless asked", () => {
    const { container } = render(<PoliticianProfile politician={politician} />);
    expect(container.querySelectorAll(".ev-contact-badge")).toHaveLength(0);
  });

  it("renders contact badges under the opt-in", () => {
    const { container } = render(<PoliticianProfile politician={politician} contactBadges />);
    const badges = container.querySelectorAll(".ev-contact-badge");
    expect(badges.length).toBeGreaterThan(0);
    // The kind modifier is what lets a consumer restyle one badge on its own.
    expect(container.querySelector(".ev-contact-badge--heading")).not.toBeNull();
    expect(container.querySelector(".ev-contact-badge--phone")).not.toBeNull();
  });

  it("emits the styling hooks whether or not the flags are set", () => {
    // These classnames carry no styling of their own; they exist so a consumer can
    // reach the elements. They must not be conditional on the opt-ins, or an app
    // styling them has to turn the badges on to get a seam it is not asking for.
    const { container } = render(<PoliticianProfile politician={politician} />);
    expect(container.querySelector(".ev-role-line")).not.toBeNull();
    expect(container.querySelector(".ev-contact-label")).not.toBeNull();
    expect(container.querySelector(".ev-contact-divider")).not.toBeNull();
  });
});

describe("SocialLinks brand marks", () => {
  const linkedinUrl = "https://www.linkedin.com/in/jane-doe";

  it("keeps the outlined box by default", () => {
    const { container } = render(<SocialLinks linkedin={linkedinUrl} />);
    const link = container.querySelector('a[aria-label="LinkedIn"]');
    expect(link).not.toBeNull();
    // Asserting on borderStyle, not the `border` shorthand: jsdom serializes
    // `border: none` back as "medium", which matches neither input string.
    expect(link.style.borderStyle).toBe("solid");
  });

  it("drops the box for the filled mark under brandMarks", () => {
    const { container } = render(<SocialLinks linkedin={linkedinUrl} brandMarks />);
    const link = container.querySelector('a[aria-label="LinkedIn"]');
    expect(link.style.borderStyle).toBe("none");
  });

  it("treats a LinkedIn URL arriving via extraLinks the same as the linkedin prop", () => {
    // The regression. This link's label is "Linkedin", not "LinkedIn".
    const { container } = render(<SocialLinks extraLinks={[linkedinUrl]} brandMarks />);
    const link = container.querySelector('a[aria-label="Linkedin"]');
    expect(link).not.toBeNull();
    expect(link.style.borderStyle).toBe("none");
  });
});

describe("PlaceholderRadar contrast", () => {
  it("leaves the light-theme stroke alone by default", () => {
    const { container } = render(<PlaceholderRadar size={100} />);
    // gray-200 — the original pairing.
    expect(container.querySelector("polygon").getAttribute("stroke")).toBe("#D3D7DE");
  });

  it("deepens the light-theme stroke under highContrast", () => {
    const { container } = render(<PlaceholderRadar size={100} highContrast />);
    expect(container.querySelector("polygon").getAttribute("stroke")).not.toBe("#E5E7EB");
  });
});
