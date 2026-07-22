# Building with @empoweredvote/ev-ui

Empowered Vote's React component library for civic / voter-information UIs (politician cards, political-compass radar charts, legislative & judicial records, election views). Every component here is real and imported from `@empoweredvote/ev-ui`.

## Setup — no provider needed

Components are **self-contained**: they style themselves with inline styles derived from the design tokens, so there is **no ThemeProvider, no CSS reset, and no wrapper to mount**. Import a component and render it. The brand typeface **Manrope** ships with this design system (`fonts.primary`); text renders in Manrope automatically. (`evContext` / `useEvContextPromotion` exist for cross-subdomain guest→authed state — runtime only, irrelevant to building screens.)

```jsx
import { PoliticianCard } from '@empoweredvote/ev-ui';

<PoliticianCard
  name="Isabel Piedmont-Smith"
  title="Council Member, District 5"
  subtitle="Common Council"
  onClick={() => {}}
/>
```

## Styling idiom — tokens, not classes

This is **not** a utility-class or CSS-class system. Do **not** write Tailwind classes for EV colors, and do **not** invent `.ev-*` class names — the `ev-politician-card` / `ev-compass-button` classes on rendered output are internal behavior hooks, not a styling API.

For **your own layout glue** around these components (wrappers, grids, headings), style with **inline styles using the exported design tokens**, imported from the package:

```jsx
import { colors, spacing, fonts, fontSizes, fontWeights, borderRadius, shadows } from '@empoweredvote/ev-ui';
```

Real token names (all verified in the build):

| Token group | Key names (examples) |
|---|---|
| `colors` | `evCoral` #FF5740, `evMutedBlue` / `evTeal` #00657C, `evLightBlue` #59B0C4, `evYellow` #FED12E, `bgLight` #F0F8FA, `bgWhite`, `textPrimary` #00657C, `textSecondary` #4A5568, `textMuted` #718096, `textWhite`, `borderLight` #E2EBEF, `borderMedium`, `error`/`success`/`warning`/`info` (+ `…Light`) |
| `fonts` | `primary` = `'Manrope', sans-serif`, `fallback` |
| `fontWeights` | `regular` 400, `medium` 500, `semibold` 600, `bold` 700, `extrabold` 800 |
| `fontSizes` | `xs` 12 → `sm` 14 → `base` 16 → `lg` 18 → `xl` 20 → `2xl` 24 → `3xl` 30 → `4xl` 36 → `5xl` 48 |
| `spacing` | `1` 4px, `2` 8px, `3` 12px, `4` 16px, `5` 20px, `6` 24px, `8` 32px (px scale) |
| `borderRadius` | `sm` 4, `md` 8, `lg` 10, `xl` 12, `2xl` 16, `full` |
| others | `shadows`, `tierColors` (`federal`/`state`/`local` → `{bg,accent,text}`), `pillars`, `dataVizPalette`, `breakpoints`, `zIndex`, `duration`, `easing` |

Brand blue is `evMutedBlue`/`evTeal` (#00657C) — headings, primary UI. Coral (#FF5740) is the accent (badges, primary buttons). Prefer `textSecondary`/`textMuted` for body text (the raw brand hues are not all AA on white; `accessibleText` holds AA-safe variants).

## Where the truth lives

- Palette / spacing / type: the `tokens` exports above — importable directly from `@empoweredvote/ev-ui` (e.g. `import { colors, spacing } from '@empoweredvote/ev-ui'`) alongside the components.
- Per-component API + usage: each component's `<Name>.prompt.md` and `<Name>.d.ts`. Note props are synthesized from JS source (this package ships no TypeScript types), so treat `.d.ts` as a best-effort guide and confirm against `.prompt.md`.

## Idiomatic composition

Compound civic views nest naturally — `GovernmentBodySection` › `SubGroupSection` › `PoliticianCard`:

```jsx
import { GovernmentBodySection, SubGroupSection, PoliticianCard, colors, fonts, spacing } from '@empoweredvote/ev-ui';

<div style={{ fontFamily: fonts.primary, padding: spacing[6], background: colors.bgLight }}>
  <GovernmentBodySection title="City of Bloomington" tier="local" websiteUrl="https://bloomington.in.gov">
    <SubGroupSection title="Bloomington Common Council">
      <PoliticianCard name="Isabel Piedmont-Smith" title="Council Member, District 5" subtitle="Common Council" />
      <PoliticianCard name="Sydney Zulich" title="Council Member, At-Large" subtitle="Common Council" />
    </SubGroupSection>
  </GovernmentBodySection>
</div>
```
