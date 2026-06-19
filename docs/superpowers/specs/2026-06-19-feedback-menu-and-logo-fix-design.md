# Feedback Menu Item + Header Logo Fix — Design

**Date:** 2026-06-19
**Repos:** `ev-ui` (shared component library) + consuming apps: `CompassV2`, `essentials`,
`read-rank`. (`treasury-tracker` is deferred to a separate effort — see Follow-up.)

## Problem

1. **Feedback reporting is inconsistent or broken across apps.** Every EV app should expose a
   working "Feedback" link in its profile dropdown that opens the live feedback page
   (`https://empowered.vote/feedback`, which logs issues to Linear via the backend), pre-tagged with
   the originating tool and page URL. Today:
   - **compass** has a Feedback item, but it links to the dead `https://feedback.empowered.vote`,
     carries no `?feature=`/`?url=` context, and only shows when logged in.
   - **essentials** has a Feedback item (both states) but points at the **alpha** domain
     (`alpha.empowered.vote/feedback`) via its own local URL builder.
   - **read-rank** has **no** Feedback item at all.
   - **treasury-tracker** also has no Feedback item and a broken logo, but it sits on a very old
     ev-ui (`^0.2.0`) and is deferred to a separate effort (see Follow-up).

2. **Header logo points to the login page on some apps.** `Header`'s default `logoHref` is
   `https://login.empowered.vote/profile`. compass and treasury-tracker do not override it, so
   clicking the Empowered Vote logo sends users to a login/profile page instead of the main site.
   (essentials and read-rank already pass `logoHref="https://empowered.vote"` explicitly.)

## Current state per app

| App | ev-ui version | Header | Logo | Feedback item |
|---|---|---|---|---|
| compass (CompassV2) | `^0.9.0` | raw `Header` | broken (inherits default) | yes, dead URL, logged-in only |
| essentials | `^0.9.4` | raw `Header` | ✅ explicit | yes (both states), alpha URL |
| read-rank | `^0.9.4` | raw `Header` | ✅ explicit | none |
| treasury-tracker | `^0.2.0` ⚠️ | raw `Header` via local `AppHeader` wrapper | broken (inherits default) | none — **deferred** |

## Goals

- Put a working "Feedback" link in the profile dropdown of compass, essentials, and read-rank —
  visible to everyone (logged-in *and* logged-out) — that opens the real feedback page pre-tagged
  with the current tool and page URL.
- All four apps build that URL via the shared `getFeedbackUrl()` helper from `ev-ui` (single source
  of truth for feature detection + URL tagging) — replacing compass's dead link and essentials'
  local alpha builder.
- Make the header logo return users to `https://empowered.vote` everywhere.

## Non-Goals

- Building any new feedback UI, form, or Linear integration — the feedback page and backend already
  exist in `ev-landing` / `backend`.
- Touching apps beyond the four named (e.g. civic-spaces, Civic-Trivia). The shared helper makes
  adding Feedback to those trivial later, but they are out of scope here.
- Changing the existing desktop `FeedbackButton` pill behavior (these apps use `secondaryAction` for
  a theme toggle, not the pill).

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

### Part B — consuming apps

Common pattern for every app: bump `@empoweredvote/ev-ui` to the version published in A4, import
`getFeedbackUrl`, and add `{ label: "Feedback", href: getFeedbackUrl() }` to **both** the logged-in
and logged-out profile-menu branches. `getFeedbackUrl()` auto-detects the feature from the hostname
(`feature=compass|essentials|readrank|treasury`) and appends the current `url`.

**B1. CompassV2** — `src/components/Layout.jsx`
- Replace the dead logged-in Feedback entry `{ label: "Feedback", href: "https://feedback.empowered.vote" }`
  with `{ label: "Feedback", href: getFeedbackUrl() }`.
- Add the same item to the logged-out branch (currently `Sign in` + `EV Financials`).
- Logo: no code change — inherits the corrected A1 default (compass passes no `logoHref`).

**B2. essentials** — `src/components/Layout.jsx`
- Replace the local `buildFeedbackUrl()` (alpha) usage with `getFeedbackUrl()`; remove the now-dead
  local builder. The existing shared `feedbackItem` already appears in both states.
- Logo: already correct (`logoHref="https://empowered.vote"`), no change.

**B3. read-rank** — `src/App.tsx`
- Add `{ label: "Feedback", href: getFeedbackUrl() }` to the logged-in branch (`Clear Read & Rank`,
  `Sign out`) and the logged-out branch (`Sign in`).
- Logo: already correct, no change.

## Follow-up (separate effort) — treasury-tracker

Out of scope for this spec. treasury-tracker is on ev-ui `^0.2.0` and needs an upgrade to the latest
published version before it can use `getFeedbackUrl()` and inherit the logo fix — an 8-minor-version
jump with real breaking-change risk across its `Header`/`AppHeader` usage and other ev-ui imports.
That upgrade, the Feedback profile item (both menu branches), and the logo verification will be
handled as their own tracked task with dedicated smoke-testing, decoupled from this change.

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
- **Each consuming app (compass, essentials, read-rank):** run it; logged-out *and* logged-in
  profile menus both show "Feedback"; clicking it opens `empowered.vote/feedback` with the correct
  `feature=<slug>` and current `url`; the logo links to `https://empowered.vote`.

## Risks

- Changing the shared `logoHref` default affects **all** consuming apps. This is intended — apps
  that override it (essentials, read-rank) are unaffected; the rest get the corrected target. Any
  app that *wants* the profile page can pass `logoHref` explicitly.
