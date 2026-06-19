# Feedback Menu Item + Header Logo Fix — Design

**Date:** 2026-06-19
**Repos:** `ev-ui` (shared component library), `CompassV2` (consuming app)

## Problem

1. **Feedback reporting is hard to reach / broken on compass.** The compass profile dropdown
   already has a "Feedback" item, but it links to `https://feedback.empowered.vote` — a dead
   subdomain that is *not* the live feedback page (`https://empowered.vote/feedback`, which logs
   issues to Linear via the backend). The link also carries no context (no `?feature=` / `?url=`),
   and it only appears for logged-in users, so anonymous users cannot report anything.

2. **Header logo points to the login page.** `Header`'s default `logoHref` is
   `https://login.empowered.vote/profile`. Compass (and every other app) does not override it, so
   clicking the Empowered Vote logo sends users to a login/profile page instead of the main site.

## Goals

- Put a working "Feedback" link in the compass profile dropdown, visible to everyone, that opens
  the real feedback page pre-tagged with the current tool and page URL.
- Make the header logo return users to `https://empowered.vote`.
- Make both fixes reusable across all EV apps via the shared `ev-ui` library, not one-off patches.

## Non-Goals

- Building any new feedback UI, form, or Linear integration — the feedback page and backend already
  exist in `ev-landing` / `backend`.
- Touching other consuming apps (essentials, civic-spaces, Civic-Trivia) in this change. The shared
  helper makes adding Feedback to those trivial later, but they are out of scope here.
- Changing the existing desktop `FeedbackButton` pill behavior (compass doesn't use it; its
  `secondaryAction` slot is the dark-mode toggle).

## Design

### Part A — `ev-ui` (shared library)

All three changes ship in one version bump.

**A1. Logo default** — `src/Header.jsx`
- Change the `logoHref` default prop from `https://login.empowered.vote/profile` to
  `https://empowered.vote`.
- No other logo logic changes. Apps that pass an explicit `logoHref` are unaffected; apps that
  rely on the default (all of them today) get the corrected target.

**A2. Feedback base URL default** — `src/FeedbackButton.jsx`
- Change `FEEDBACK_BASE_DEFAULT` from `https://alpha.empowered.vote/feedback` to
  `https://empowered.vote/feedback`.
- Add `'empowered.vote': 'landing'` to `HOST_FEATURE_MAP` (the alpha and onrender entries stay for
  preview/staging detection).

**A3. Export `getFeedbackUrl()` helper** — `src/FeedbackButton.jsx` + `src/index.js`
- Promote the existing private `buildHref({ baseUrl, feature, includeUrl })` to an exported function
  `getFeedbackUrl({ feature, baseUrl, includeUrl } = {})` that:
  - defaults `baseUrl` to `FEEDBACK_BASE_DEFAULT`,
  - defaults `feature` to `detectFeature()`,
  - defaults `includeUrl` to `true` (appends `?url=<window.location.href>`).
- `FeedbackButton` is refactored to call `getFeedbackUrl(...)` internally (no behavior change to the
  pill).
- Re-export `getFeedbackUrl` (and keep `detectFeature`) from `src/index.js`.
- Rationale: a profile-menu Feedback link needs the *same* feature/URL-tagging logic as the pill,
  and the `?url=` value is dynamic (`window.location.href`), so it cannot be a static string. The
  helper is the single source of truth shared by the pill and any menu item.

**A4. Version bump + publish** — `npm version patch` (per the existing release pipeline), publish to
npm so consuming apps can pick it up.

### Part B — `CompassV2`

**B1. Use the helper for the Feedback profile item** — `src/components/Layout.jsx`
- Import `getFeedbackUrl` from `@empoweredvote/ev-ui`.
- Replace the logged-in `profileItems` Feedback entry
  `{ label: "Feedback", href: "https://feedback.empowered.vote" }`
  with `{ label: "Feedback", href: getFeedbackUrl() }`
  → resolves to `https://empowered.vote/feedback?feature=compass&url=<current page>`.

**B2. Show Feedback to logged-out users** — `src/components/Layout.jsx`
- Add `{ label: "Feedback", href: getFeedbackUrl() }` to the logged-out `profileMenu.items` branch
  (currently only `Sign in` + `EV Financials`).

**B3. Bump dependency** — update `@empoweredvote/ev-ui` to the version published in A4.

**Logo:** no compass code change. The corrected default from A1 takes effect once compass picks up
the new ev-ui version (compass does not pass `logoHref`).

## Data Flow (Feedback)

1. User opens the profile dropdown (desktop) or hamburger menu (mobile — profile items render
   inside it).
2. Clicks "Feedback" → `getFeedbackUrl()` returns
   `https://empowered.vote/feedback?feature=compass&url=<page>`.
3. The ev-landing feedback page reads `?feature` and `?url` to prefill the form, submits to the
   backend, which creates a Linear issue tagged with the originating tool and URL.

## Verification

- **ev-ui:** `getFeedbackUrl()` returns the expected URL for a known host (feature detected) and a
  caller-supplied `feature`; `FeedbackButton` pill still renders the same href as before (now on the
  prod base URL); `index.js` exports `getFeedbackUrl`. Build the package.
- **CompassV2:** run the app; logged-out and logged-in profile menus both show "Feedback"; clicking
  it opens `empowered.vote/feedback` with `feature=compass` and the current `url`; the logo links to
  `https://empowered.vote`.

## Risks

- Changing the shared `logoHref` default affects **all** consuming apps. This is intended — none
  override it today, and the login page is the wrong destination for a public logo. Any app that
  *wants* the profile page can pass `logoHref` explicitly.
