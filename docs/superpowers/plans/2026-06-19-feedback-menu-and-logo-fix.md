# Feedback Menu Item + Header Logo Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a working "Feedback" profile-menu item (logged-in and logged-out) to compass, essentials, and read-rank that opens `https://empowered.vote/feedback` pre-tagged with the tool and page URL, and fix the header logo to point at `https://empowered.vote`.

**Architecture:** Make the shared changes in `ev-ui` (logo default, feedback base URL, and a new exported `getFeedbackUrl()` helper), publish a new version, then update each consuming app to depend on it and call `getFeedbackUrl()` in its profile menu.

**Tech Stack:** React (JSX/TSX), `tsup` (ev-ui build), npm workspaces per repo. `ev-ui` has no test framework; verification is build + a node check against built `dist` + runtime checks in apps.

**Repos & paths:**
- `ev-ui`: `/Users/chrisandrews/Documents/GitHub/ev-ui`
- `CompassV2`: `/Users/chrisandrews/Documents/GitHub/CompassV2`
- `essentials`: `/Users/chrisandrews/Documents/GitHub/essentials`
- `read-rank`: `/Users/chrisandrews/Documents/GitHub/read-rank`

**Reference spec:** `docs/superpowers/specs/2026-06-19-feedback-menu-and-logo-fix-design.md`

**treasury-tracker is OUT OF SCOPE** (deferred — needs an ev-ui 0.2→latest upgrade first).

**Ordering:** ev-ui (Tasks 1–4) must be published before the app tasks (5–7), because the apps depend on the newly-published `getFeedbackUrl`.

---

## Task 1: ev-ui — `getFeedbackUrl()` helper + prod base URL

**Files:**
- Modify: `/Users/chrisandrews/Documents/GitHub/ev-ui/src/FeedbackButton.jsx`

- [ ] **Step 1: Point the default feedback base URL at production**

In `src/FeedbackButton.jsx`, change the constant (currently line 21):

```js
const FEEDBACK_BASE_DEFAULT = 'https://empowered.vote/feedback';
```

- [ ] **Step 2: Add the production host to the feature map**

In `HOST_FEATURE_MAP` (currently lines 25–35), add an entry for the bare production domain so feedback opened from the landing site is tagged `landing`. Add this line alongside the existing `alpha`/`onrender` entries:

```js
  'empowered.vote': 'landing',
```

- [ ] **Step 3: Replace the private `buildHref` with an exported `getFeedbackUrl`**

Delete the existing `buildHref` function (currently lines 58–66) and replace it with:

```js
/**
 * Build the canonical feedback URL.
 * @param {Object} [opts]
 * @param {string} [opts.feature] - explicit feature slug (skips auto-detect)
 * @param {string} [opts.baseUrl] - feedback form URL (default: empowered.vote/feedback)
 * @param {boolean} [opts.includeUrl] - append current href as ?url= (default: true)
 * @returns {string}
 */
export function getFeedbackUrl({ feature, baseUrl = FEEDBACK_BASE_DEFAULT, includeUrl = true } = {}) {
  const resolvedFeature = feature ?? detectFeature();
  const params = new URLSearchParams();
  if (resolvedFeature) params.set('feature', resolvedFeature);
  if (includeUrl && typeof window !== 'undefined') {
    params.set('url', window.location.href);
  }
  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}
```

- [ ] **Step 4: Make `FeedbackButton` use the helper**

In the `FeedbackButton` component body (currently lines 77–78), replace:

```js
  const feature = featureProp ?? detectFeature();
  const href = buildHref({ baseUrl, feature, includeUrl });
```

with:

```js
  const href = getFeedbackUrl({ feature: featureProp, baseUrl, includeUrl });
```

(Behavior is unchanged: `featureProp` undefined still falls through to `detectFeature()` inside the helper.)

- [ ] **Step 5: Commit**

```bash
cd /Users/chrisandrews/Documents/GitHub/ev-ui
git add src/FeedbackButton.jsx
git commit -m "feat(FeedbackButton): export getFeedbackUrl helper, default to prod feedback URL"
```

---

## Task 2: ev-ui — export `getFeedbackUrl` from the package entry

**Files:**
- Modify: `/Users/chrisandrews/Documents/GitHub/ev-ui/src/index.js`

- [ ] **Step 1: Re-export the helper**

In `src/index.js`, change the Feedback export block (currently line 50) to also export the helper:

```js
// Feedback
export { default as FeedbackButton, getFeedbackUrl, detectFeature } from './FeedbackButton.jsx';
```

- [ ] **Step 2: Commit**

```bash
cd /Users/chrisandrews/Documents/GitHub/ev-ui
git add src/index.js
git commit -m "feat(ev-ui): export getFeedbackUrl and detectFeature"
```

---

## Task 3: ev-ui — fix the default logo target

**Files:**
- Modify: `/Users/chrisandrews/Documents/GitHub/ev-ui/src/Header.jsx`

- [ ] **Step 1: Change the default `logoHref`**

In `src/Header.jsx`, change the prop default (currently line 23) from the login page to the main site:

```js
  logoHref = 'https://empowered.vote',
```

- [ ] **Step 2: Commit**

```bash
cd /Users/chrisandrews/Documents/GitHub/ev-ui
git add src/Header.jsx
git commit -m "fix(Header): default logoHref to empowered.vote instead of login page"
```

---

## Task 4: ev-ui — build, verify, version bump, publish

**Files:**
- Modify: `/Users/chrisandrews/Documents/GitHub/ev-ui/package.json` (version, via `npm version`)

- [ ] **Step 1: Build the package**

```bash
cd /Users/chrisandrews/Documents/GitHub/ev-ui
npm run build
```

Expected: `tsup` completes with no errors and writes `dist/index.mjs` + `dist/index.js`.

- [ ] **Step 2: Verify the helper against the built output**

Run this node check (uses `includeUrl: false` and an explicit feature so it never touches `window`):

```bash
cd /Users/chrisandrews/Documents/GitHub/ev-ui
node --input-type=module -e "import { getFeedbackUrl } from './dist/index.mjs'; const u = getFeedbackUrl({ feature: 'compass', includeUrl: false }); console.log(u); if (u !== 'https://empowered.vote/feedback?feature=compass') { throw new Error('unexpected: ' + u); } console.log('OK');"
```

Expected output:
```
https://empowered.vote/feedback?feature=compass
OK
```

- [ ] **Step 3: Set the new version ABOVE the currently-published latest**

The local `package.json` may lag the published version, so do not blindly `npm version patch`. Determine the published latest and bump from it:

```bash
cd /Users/chrisandrews/Documents/GitHub/ev-ui
npm view @empoweredvote/ev-ui version
```

Note the value (e.g. `0.9.4`). Set the new version to the next patch above it (e.g. `0.9.5`), which also creates a git commit + tag:

```bash
npm version 0.9.5   # replace with (published-latest + 1 patch)
```

Expected: prints `v0.9.5`, updates `package.json`, creates commit + tag `v0.9.5`.

- [ ] **Step 4: Publish (CONFIRM WITH USER FIRST — outward action)**

Publishing is public and hard to reverse. Confirm with the user before running, and check whether the repo's release pipeline auto-publishes on tag push (if so, just push the tag instead).

```bash
cd /Users/chrisandrews/Documents/GitHub/ev-ui
npm publish              # if publishing manually
git push --follow-tags   # if a CI pipeline publishes on tag
```

Expected: `@empoweredvote/ev-ui@<new version>` available on npm. Confirm with:

```bash
npm view @empoweredvote/ev-ui version
```

shows the new version.

---

## Task 5: CompassV2 — fix Feedback link + show it logged-out

**Files:**
- Modify: `/Users/chrisandrews/Documents/GitHub/CompassV2/src/components/Layout.jsx`
- Modify: `/Users/chrisandrews/Documents/GitHub/CompassV2/package.json` (dependency bump)

- [ ] **Step 1: Upgrade the ev-ui dependency**

```bash
cd /Users/chrisandrews/Documents/GitHub/CompassV2
npm install @empoweredvote/ev-ui@latest --save
```

Expected: `package.json` `@empoweredvote/ev-ui` now references the version published in Task 4.

- [ ] **Step 2: Import the helper**

In `src/components/Layout.jsx`, change the ev-ui import (currently line 2):

```js
import { Header, evContext, getFeedbackUrl } from "@empoweredvote/ev-ui";
```

- [ ] **Step 3: Replace the dead Feedback link (logged-in menu)**

In `profileItems` (currently line 258), replace:

```js
    { label: "Feedback", href: "https://feedback.empowered.vote" },
```

with:

```js
    { label: "Feedback", href: getFeedbackUrl() },
```

- [ ] **Step 4: Add Feedback to the logged-out menu**

In the `profileMenu` prop's logged-out branch (currently lines 295–298), add the Feedback item so the array becomes:

```js
              : { label: null, items: [
                  { label: "Sign in", onClick: () => navigate("/login") },
                  { label: "Feedback", href: getFeedbackUrl() },
                  { label: "EV Financials", onClick: () => { window.location.href = 'https://financials.empowered.vote'; } },
                ] }
```

- [ ] **Step 5: Verify in the running app**

```bash
cd /Users/chrisandrews/Documents/GitHub/CompassV2
npm run dev
```

Confirm: app builds with no console errors; the profile dropdown (and the hamburger menu on mobile) shows "Feedback" both signed-in and signed-out; clicking it opens `https://empowered.vote/feedback?feature=compass&url=<current page>`; the EV logo links to `https://empowered.vote`.

- [ ] **Step 6: Commit**

```bash
cd /Users/chrisandrews/Documents/GitHub/CompassV2
git add src/components/Layout.jsx package.json package-lock.json
git commit -m "fix(header): point Feedback at empowered.vote/feedback via getFeedbackUrl, show logged-out"
```

---

## Task 6: essentials — switch local feedback builder to `getFeedbackUrl()`

**Files:**
- Modify: `/Users/chrisandrews/Documents/GitHub/essentials/src/components/Layout.jsx`
- Modify: `/Users/chrisandrews/Documents/GitHub/essentials/package.json` (dependency bump)

- [ ] **Step 1: Upgrade the ev-ui dependency**

```bash
cd /Users/chrisandrews/Documents/GitHub/essentials
npm install @empoweredvote/ev-ui@latest --save
```

- [ ] **Step 2: Import the helper**

In `src/components/Layout.jsx`, add `getFeedbackUrl` to the ev-ui import (currently line 1):

```js
import { Header, getFeedbackUrl } from "@empoweredvote/ev-ui";
```

- [ ] **Step 3: Delete the local `buildFeedbackUrl` (alpha) function**

Remove the local builder (currently lines 7–9):

```js
function buildFeedbackUrl() {
  return `https://alpha.empowered.vote/feedback?feature=essentials&url=${encodeURIComponent(window.location.href)}`;
}
```

- [ ] **Step 4: Point the Feedback item at the helper**

In the `feedbackItem` definition (currently lines 15–18), replace the `onClick` to use the helper:

```js
const feedbackItem = {
  label: "Feedback",
  onClick: () => window.open(getFeedbackUrl(), '_blank', 'noopener,noreferrer'),
};
```

(`getFeedbackUrl()` auto-detects `feature=essentials` from `essentials.empowered.vote`. The item already appears in both logged-in and logged-out menus, so no menu-structure change is needed.)

- [ ] **Step 5: Verify in the running app**

```bash
cd /Users/chrisandrews/Documents/GitHub/essentials
npm run dev
```

Confirm: no console errors; the Feedback item (both states) now opens `https://empowered.vote/feedback?feature=essentials&url=<current page>` in a new tab; logo still points to `https://empowered.vote`.

- [ ] **Step 6: Commit**

```bash
cd /Users/chrisandrews/Documents/GitHub/essentials
git add src/components/Layout.jsx package.json package-lock.json
git commit -m "fix(header): use ev-ui getFeedbackUrl (prod) for Feedback link"
```

---

## Task 7: read-rank — add the Feedback item to both menus

**Files:**
- Modify: `/Users/chrisandrews/Documents/GitHub/read-rank/src/App.tsx`
- Modify: `/Users/chrisandrews/Documents/GitHub/read-rank/package.json` (dependency bump)

- [ ] **Step 1: Upgrade the ev-ui dependency**

```bash
cd /Users/chrisandrews/Documents/GitHub/read-rank
npm install @empoweredvote/ev-ui@latest --save
```

- [ ] **Step 2: Import the helper**

In `src/App.tsx`, add `getFeedbackUrl` to the ev-ui import (currently line 3):

```tsx
import { Header, getFeedbackUrl } from '@empoweredvote/ev-ui';
```

- [ ] **Step 3: Add Feedback to both profile-menu branches**

Replace the `profileMenu` definition (currently lines 77–87) with:

```tsx
  const profileMenu = loading
    ? undefined
    : isLoggedIn
      ? {
          label: userName || 'Account',
          items: [
            { label: 'Clear Read & Rank', onClick: handleClearReadRank },
            { label: 'Feedback', href: getFeedbackUrl() },
            { label: 'Sign out', onClick: logout },
          ],
        }
      : { label: 'Account', items: [
          { label: 'Sign in', href: `${AUTH_HUB_URL}/login?redirect=${encodeURIComponent(window.location.href)}` },
          { label: 'Feedback', href: getFeedbackUrl() },
        ] };
```

- [ ] **Step 4: Verify in the running app**

```bash
cd /Users/chrisandrews/Documents/GitHub/read-rank
npm run dev
```

Confirm: TypeScript compiles with no errors; the profile dropdown shows "Feedback" both signed-in and signed-out; clicking it opens `https://empowered.vote/feedback?feature=readrank&url=<current page>`; logo points to `https://empowered.vote`.

- [ ] **Step 5: Commit**

```bash
cd /Users/chrisandrews/Documents/GitHub/read-rank
git add src/App.tsx package.json package-lock.json
git commit -m "feat(header): add Feedback profile item (both states) via getFeedbackUrl"
```

---

## Done criteria

- [ ] ev-ui published with `getFeedbackUrl`, prod feedback default, and corrected `logoHref`.
- [ ] compass, essentials, read-rank each depend on the new ev-ui version.
- [ ] All three show a working "Feedback" item in the profile dropdown (and mobile hamburger) when logged in AND logged out, opening `empowered.vote/feedback` tagged with the correct `feature` + `url`.
- [ ] The header logo links to `https://empowered.vote` in all three.
- [ ] treasury-tracker tracked separately (deferred).
