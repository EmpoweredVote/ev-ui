# @empoweredvote/ev-ui

Shared React component library for the [Empowered Vote](https://empowered.vote) civic engagement platform. Used across CompassV2, essentials, read-rank, civic-spaces, and other Empowered Vote apps.

[![npm version](https://img.shields.io/npm/v/@empoweredvote/ev-ui.svg)](https://www.npmjs.com/package/@empoweredvote/ev-ui)

## Installation

```bash
npm install @empoweredvote/ev-ui
```

The package is on public npm — no auth or `.npmrc` configuration required.

### Peer dependencies

```bash
npm install react react-dom @react-spring/web
```

Supported versions: React 17+, `@react-spring/web` 9+.

## Usage

```jsx
import { RadarChartCore, PoliticianCard, SiteHeader } from '@empoweredvote/ev-ui';
import { BallotIcon, CompassIcon } from '@empoweredvote/ev-ui';
```

### Design tokens

Design tokens (colors, spacing, typography) are exported separately and can be used directly or via the Tailwind preset:

```js
// tailwind.config.js
import evPreset from '@empoweredvote/ev-ui/tailwind-preset';

export default {
  presets: [evPreset],
  // your config
};
```

Direct token import:
```js
import { colors, spacing } from '@empoweredvote/ev-ui/tokens';
```

## Components

### Charts
- **`RadarChartCore`** — Interactive radar/spider chart with animated transitions, dual dataset overlays (e.g., your compass vs. a politician's), clickable spokes for inversion, and dynamic label wrapping.

### Politician Display
- **`PoliticianCard`** — Politician summary card with photo, title, district
- **`PoliticianProfile`** — Full profile page with contact, bio, legislative record
- **`CommitteeTable`** — Committee memberships and leadership roles
- **`LegislativeInlineSummary`**, **`LegislativeRecord`** — Bill/vote history
- **`JudicialScorecard`**, **`JudicialRecordDetail`** — Judicial record display
- **`SocialLinks`** — Social media icon links
- **`IssueTags`** — Topic/issue tag pills
- **`StanceAccordion`** — Collapsible stance list by topic

### Layout
- **`SiteHeader`** — Top nav bar with `defaultNavItems`, `defaultCtaButton` helpers
- **`Header`** — Simpler page header
- **`FilterSidebar`** — Filterable sidebar for results pages
- **`CategorySection`**, **`SubGroupSection`**, **`GovernmentBodySection`** — Grouped content sections

### Forms
- **`AuthForm`** — Login/signup form

### Icons
- **`BallotIcon`**, **`CompassIcon`**, **`BranchIcon`**

### Hooks
- **`useMediaQuery(query)`** — Responsive breakpoint hook

## Releasing

This package uses an **automated publish-and-fan-out pipeline**:

```bash
npm version patch    # or minor / major
git push origin main --follow-tags
```

That's it. The tag push triggers `.github/workflows/publish.yml` which:

1. Publishes to npm using **OIDC trusted publishing** (no `NPM_TOKEN` — provenance attestations auto-generated)
2. Fires `repository_dispatch` to every consumer repo
3. Each consumer opens a PR bumping the dependency
4. Patch/minor bumps auto-merge after build-check passes
5. Render auto-deploys each consumer on merge

See [`README-AUTOBUMP.md`](./README-AUTOBUMP.md) for full pipeline details, how to add a new consumer, and debugging tips.

## Development

```bash
npm install
npm run build       # tsup produces ESM + CJS bundles to dist/
```

## Design System Viewer

Design tokens are also rendered to a design system preview page deployed to GitHub Pages whenever `design-system/` or `src/tokens.js` changes on `main`. See `.github/workflows/deploy-design-system.yml`.

## License

Internal / Empowered Vote organization. See repository for details.
