# design-sync notes — @empoweredvote/ev-ui

Repo-specific gotchas for future syncs. Append as you learn more.

## Shape & discovery
- **JS-only package** (`tsup.config.js` has `dts: false`, source is `.jsx`). Ships **no `.d.ts`**, so package-shape discovery finds zero exports → `[ZERO_MATCH]` unless driven by config.
  - Fix in place: `componentSrcMap` pins all 27 exported components (from `src/index.js`) + the 3 icon fns (`BallotIcon`/`CompassIcon`/`BranchIcon` → `src/icons.js`). 30 total.
  - Consequence: emitted `<Name>.d.ts` prop contracts are synthesized from `.jsx` signatures + JSDoc (weak/`any`), not real types. `[DTS_REACT]` (@types/react absent) is harmless here — JS components don't use React utility types.
- Build: `npm run build` (tsup) → `dist/index.mjs`. Rebuild before converter when src changes (dist was stale on first sync).

## Styling model — IMPORTANT
- Components are **styled inline from `src/tokens.js`** (colors/fonts/spacing/radius/shadows baked into JS). The `.ev-*` classNames (`ev-politician-card`, `ev-compass-button`, …) are behavior hooks, not the source of styling. A few `.ev-*` layout classes are defined only in **consuming apps** (e.g. `essentials/src/index.css`), NOT in this package.
- Therefore the bundle is **self-styling**: `[CSS_RUNTIME]` / empty `_ds_bundle.css` is **expected and correct** — do NOT chase it, do NOT set `cfg.cssEntry` to a Tailwind build. Previews render faithfully from the bundle alone.

## Fonts
- `tokens.js fonts.primary = "'Manrope', sans-serif"` (Manrope-only DS; Inter is an essentials-app choice, not ev-ui).
- Manrope shipped self-contained: `.design-sync/fonts/manrope.css` + `manrope-{400,500,600,700,800}.woff2` (latin), copied from `@fontsource/manrope`. Wired via `cfg.extraFonts`. Durable/committed so re-sync works on a fresh clone with no extra dep. Chosen woff2-local (not Google Fonts @import) so Manrope survives Artifact CSP in designs the agent builds.

## Known render warns (triaged — re-syncs check against this list)
- `BallotIcon` / `CompassIcon` (`[RENDER_THIN]`): BENIGN. Both have authored previews (`.design-sync/previews/*.tsx`) that render icon rows at 16–48px in teal/coral/gray — confirmed via screenshot. The thin heuristic only fires because the cells contain SVG-only content with no text runs; the icons paint correctly. Do NOT rework.
- `AuthForm`: the brand logo renders as a broken `<img>` (component points at an external/app-served logo asset not bundled). Cosmetic; floor render otherwise fine.

## Authored previews (the only 4 — floor-cards-everywhere scope)
User chose floor-cards-everywhere; the other 26 components ship functional floor / self-rendered cards. Minimal previews authored ONLY to clear blank/thin renders (never ship a visibly broken card):
- `BallotIcon`, `CompassIcon`: Colors + Sizes cells. `BranchIcon`: Branches cell (exec/legis/judicial/default). `GovernmentBodySection`: Federal + Local cells (composed with SubGroupSection + PoliticianCard, real EV example data). All graded `good`.
- The remaining 26 are unauthored — authorable incrementally on any later sync (grades/authored files carry forward).

## Usage-example source for authoring previews
- The **`essentials` app** (`../essentials/src/`) imports and uses these components with real props/data shapes — the primary composition source (§4.2 "curate before invent"). `ev-ui/design-system/index.html` is a primitives style-guide (`.ev-btn`/`.ev-input`/…) that does NOT match the React components' classes — not a usage source for these components.

## Re-sync risks
- `componentSrcMap` is hand-maintained from `src/index.js` exports — a component added/removed upstream won't appear/disappear until the map is updated. On re-sync, diff `src/index.js` exports against the map.
- Manrope woff2 are copied bytes; if the brand font changes upstream, re-copy from `@fontsource/manrope`.
- Prop contracts are synthesized (JS, no types) — treat `<Name>.d.ts` as best-effort, not authoritative.
