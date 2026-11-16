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

describe("PoliticianProfile tier badge and term row hooks", () => {
  // essentials restyles these two elements in light mode. Before they had classes it
  // found them by matching the serialised inline style, which stops matching the
  // moment a colour or a layout value here changes — silently, with no failing test
  // on either side. These hooks are the contract that replaces that.
  const serving = {
    ...politician,
    term_start: "2023-06-15",
    term_end: "2027-06-15",
    total_years_in_office: 3,
  };

  it.each([
    ["LOCAL_EXEC", "local", "LOCAL"],
    ["STATE_UPPER", "state", "STATE"],
    ["NATIONAL_LOWER", "federal", "FEDERAL"],
  ])("marks a %s badge as data-tier=%s", (districtType, dataTier, label) => {
    const { container } = render(
      <PoliticianProfile politician={{ ...serving, district_type: districtType }} />,
    );
    const badge = container.querySelector(".ev-tier-badge");
    expect(badge).not.toBeNull();
    expect(badge.getAttribute("data-tier")).toBe(dataTier);
    expect(badge.textContent).toBe(label);
  });

  it("renders no tier badge when there is no district type", () => {
    const { container } = render(<PoliticianProfile politician={serving} />);
    expect(container.querySelector(".ev-tier-badge")).toBeNull();
  });

  it("classes the term row and both of its items", () => {
    const { container } = render(<PoliticianProfile politician={serving} />);
    const row = container.querySelector(".ev-term-row");
    expect(row).not.toBeNull();
    // essentials' rule is `.ev-term-row > span`, so the items must stay direct children.
    expect(row.querySelectorAll(":scope > span.ev-term-row__item")).toHaveLength(2);
    expect(row.querySelector(":scope > .ev-term-row__item--term").textContent).toMatch(/2023/);
    expect(row.querySelector(":scope > .ev-term-row__item--years").textContent).toMatch(
      /3 years in office/,
    );
  });

  it("renders no term row without a term or years in office", () => {
    const { container } = render(<PoliticianProfile politician={politician} />);
    expect(container.querySelector(".ev-term-row")).toBeNull();
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
