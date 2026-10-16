# Designer Live Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In every Empowered Vote frontend, `npm install && npm run dev` shows live public data with no keys, and Claude is told to use that data instead of inventing it.

**Architecture:** Each frontend's dev server proxies `/api/*` to the live API, so the browser never meets the API's CORS allow-list. A Claude Code plugin in `ev-ui` carries one `ev-designer` skill (rules + public route index); each frontend enables it through `.claude/settings.json` and points to it from `CLAUDE.md`.

**Tech Stack:** Vite 6/7 dev-server proxy, Next.js `rewrites()` (dev only), Claude Code plugin marketplace (`.claude-plugin/marketplace.json`), Markdown.

**Spec:** `docs/superpowers/specs/2026-10-16-designer-live-data-design.md` (this repo).

## Global Constraints

- Live API origin for every proxy: `https://accounts-api.empowered.vote` (matches essentials and CompassV2 today).
- Local-backend override variable, same name everywhere: `VITE_API_PROXY_TARGET` (Vite repos), `EV_API_PROXY_TARGET` (On the Record).
- In development, `VITE_API_URL` must be **unset or empty** so code falls back to the relative `/api`. Production builds keep setting it.
- No secret, key or token is added to any file. Before each commit, check the staged diff for secrets; `.env` stays ignored.
- No production behavior changes: every proxy/rewrite is dev-server only.
- Mock data lives only in `src/mocks/` (On the Record: `web/src/mocks/`), one file per stand-in route, first line `// Stands in for: GET /api/<route> — not yet served by the API`.
- Each repo is changed in its **own worktree and branch** (`git worktree add -b designer-live-data ../<repo>-designer-live-data origin/<default>`), committed with an explicit pathspec, and opened as its own PR. Keep each repo's existing remote as is.

## Review Focus

1. **A designer has an old `.env` with an absolute `VITE_API_URL`.** The app then calls the live API directly and CORS blocks it — the exact failure we are fixing. Expected: the dev server prints a one-line warning naming the variable. Pinned by `warnIfAbsoluteApiUrl` tests in Task 1.
2. **POST requests in dev** (e.g. essentials `browse/by-area`) carry an `Origin` header. Expected: the proxy strips it, so the backend treats the call as same-origin. Pinned by the POST curl check in Tasks 2–4.
3. **Not signed in on localhost.** Session cookies belong to the live domain, so `/api/auth/session` returns signed-out. Expected: public screens still render real data. Pinned by the "signed-out main screen" check in Tasks 2–5.
4. **Live API down or a route 404s.** Expected: Claude reports the failure and does not substitute invented data. Pinned by the skill text in Task 6.
5. **A mock file left in place after the route ships.** Expected: the PR checkbox and the `Stands in for:` header make it findable with `grep -rn "Stands in for" src/mocks`. Pinned by Task 7's PR template.

---

### Task 1: Shared dev-proxy helper in ev-ui

One small helper so four repos do not each copy the proxy block.

**Files:**
- Create: `src/dev/liveApiProxy.js` (ev-ui)
- Modify: `package.json` (ev-ui) — add export `"./dev": "./dist/dev/liveApiProxy.js"` and the tsup entry
- Test: `src/dev/liveApiProxy.test.js`

**Interfaces:**
- Produces:
  - `LIVE_API_ORIGIN = 'https://accounts-api.empowered.vote'`
  - `liveApiProxy({ target?: string }): Record<string, ProxyOptions>` — returns `{ '/api': { target, changeOrigin: true, secure: true, configure } }`; `target` defaults to `LIVE_API_ORIGIN`; `configure` removes the `origin` header on every `proxyReq`.
  - `warnIfAbsoluteApiUrl(env: Record<string,string>, log = console.warn): boolean` — when `env.VITE_API_URL` is set and is not a `localhost`/`127.0.0.1` URL, logs one line containing `VITE_API_URL` and `unset it for local dev`, returns `true`; otherwise returns `false`.

- [ ] **Step 1: Write the failing tests**

```js
import { liveApiProxy, warnIfAbsoluteApiUrl, LIVE_API_ORIGIN } from './liveApiProxy.js'
test('defaults to the live API', () => {
  expect(liveApiProxy()['/api'].target).toBe(LIVE_API_ORIGIN)
})
test('override wins', () => {
  expect(liveApiProxy({ target: 'http://localhost:3000' })['/api'].target).toBe('http://localhost:3000')
})
test('strips Origin', () => {
  const removed = []; const handlers = {}
  liveApiProxy()['/api'].configure({ on: (e, fn) => (handlers[e] = fn) })
  handlers.proxyReq({ removeHeader: (h) => removed.push(h) })
  expect(removed).toEqual(['origin'])
})
test('warns on absolute VITE_API_URL', () => {
  const log = vi.fn()
  expect(warnIfAbsoluteApiUrl({ VITE_API_URL: 'https://api.empowered.vote' }, log)).toBe(true)
  expect(log.mock.calls[0][0]).toMatch(/VITE_API_URL.*unset it for local dev/)
})
test('silent when unset, empty or localhost', () => {
  for (const v of [undefined, '', 'http://localhost:3000'])
    expect(warnIfAbsoluteApiUrl({ VITE_API_URL: v }, vi.fn())).toBe(false)
})
```

- [ ] **Step 2: Run** `npx vitest run src/dev/liveApiProxy.test.js` — Expected: FAIL, module not found.
- [ ] **Step 3: Implement the three exports** in `src/dev/liveApiProxy.js`. Pure Node, no Vite import (types only in JSDoc).
- [ ] **Step 4: Run** the same command — Expected: 5 passed. Then `npm run build` — Expected: `dist/dev/liveApiProxy.js` exists.
- [ ] **Step 5: Commit**

```bash
git commit -m "feat(dev): liveApiProxy helper for frontends' dev servers" -- src/dev package.json tsup.config.js
```

Release follows the repo's existing publish workflow; later tasks need the published version number.

---

### Task 2: read-rank uses the live API by default

**Files:**
- Modify: `vite.config.ts` (read-rank) — add `...liveApiProxy({ target: env.VITE_API_PROXY_TARGET })` beside the existing `/auth` entry; call `warnIfAbsoluteApiUrl(env)` (use `loadEnv(mode, process.cwd(), '')`)
- Modify: `.env.example` — `VITE_API_URL=` (empty) with comment: "Leave empty for local dev; the dev server proxies /api to the live API. Set VITE_API_PROXY_TARGET=http://localhost:3000 to use a local backend."
- Modify: `package.json` — bump `@empoweredvote/ev-ui` to the Task 1 release

**Interfaces:**
- Consumes: `liveApiProxy`, `warnIfAbsoluteApiUrl` from `@empoweredvote/ev-ui/dev`

- [ ] **Step 1: Baseline** — fresh worktree, no `.env*`, `npm run dev`; then `curl -s -o /dev/null -w "%{http_code}" localhost:5173/api/health` — Expected: not 200 (proves the gap).
- [ ] **Step 2: Make the three changes above.**
- [ ] **Step 3: Verify GET** — same curl — Expected: `200`. Then fetch one real data route the app calls in `src/data/api.ts` and confirm JSON with real names.
- [ ] **Step 4: Verify POST** — `curl -s -X POST -H "Origin: http://localhost:5173" -H "Content-Type: application/json" -d '{}' localhost:5173/api/<a POST route from src/data/api.ts>` — Expected: the API's normal response for that body (not a CORS or 500 error).
- [ ] **Step 5: Verify signed-out screen** — open the app in a browser; the race list shows live races with no console CORS errors.
- [ ] **Step 6: Verify warning** — `VITE_API_URL=https://api.empowered.vote npm run dev` prints the `VITE_API_URL … unset it for local dev` line.
- [ ] **Step 7:** `npm test` passes; commit `-- vite.config.ts .env.example package.json package-lock.json`.

---

### Task 3: treasury-tracker uses the live API by default

**Files:**
- Modify: `vite.config.ts` (treasury-tracker) — replace the inline `/api` block with `liveApiProxy({ target: env.VITE_API_PROXY_TARGET })`; drop the `env.VITE_API_URL || 'http://localhost:5050'` fallback; add `warnIfAbsoluteApiUrl(env)`. (`src/data/dataLoader.ts` already uses `/api` in dev — no change.)
- Modify: `.env.example` — add the same `VITE_API_URL=` / `VITE_API_PROXY_TARGET` comment block as Task 2 (target example `http://localhost:5050`)
- Modify: `package.json` — ev-ui bump

- [ ] **Step 1: Baseline** as Task 2 Step 1 with `/api/treasury/cities?datasets=summary` — Expected: fails (nothing on 5050).
- [ ] **Step 2: Make the changes.**
- [ ] **Step 3: Verify** the same URL returns `200` JSON listing real cities.
- [ ] **Step 4: Verify signed-out screen** — city list and one city budget render with live numbers.
- [ ] **Step 5:** `npm test` passes; commit with explicit pathspec.

---

### Task 4: essentials uses the shared helper and a dev-safe `.env.example`

Essentials already proxies, but its `.env.example` sets `VITE_API_URL=https://api.empowered.vote`, which skips the proxy in dev.

**Files:**
- Modify: `vite.config.js` (essentials) — replace the inline `/api` block (lines ~40–56) with `liveApiProxy({ target: env.VITE_API_PROXY_TARGET })`; add `warnIfAbsoluteApiUrl(env)`
- Modify: `.env.example` — `VITE_API_URL=` (empty) + the Task 2 comment
- Modify: `package.json` — ev-ui bump

- [ ] **Step 1: Make the changes.**
- [ ] **Step 2: Verify** — no `.env`, `npm run dev`; `curl` `/api/health` → `200`; POST check as Task 2 Step 4 against a `browse/by-area` call — Expected: normal response.
- [ ] **Step 3: Verify signed-out screen** — address lookup shows live officials.
- [ ] **Step 4:** `npm test` passes; commit with explicit pathspec.

---

### Task 5: On the Record search works in dev

`web/next.config.ts` uses `output: "export"`, which does not allow rewrites in a build, so the rewrite is added **only when `NODE_ENV === 'development'`**.

**Files:**
- Modify: `web/next.config.ts` — when development, add `async rewrites() { return [{ source: '/api/:path*', destination: \`${process.env.EV_API_PROXY_TARGET ?? 'https://accounts-api.empowered.vote'}/api/:path*\` }] }`
- Modify: `web/app/search/SearchView.tsx:13` — `const API_BASE = process.env.NODE_ENV === 'development' ? '' : (process.env.NEXT_PUBLIC_EV_ACCOUNTS_URL ?? '').replace(/\/$/, '')`
- Modify: `web/.env.local.example` — comment explaining `EV_API_PROXY_TARGET`

- [ ] **Step 1: Baseline** — `npm run dev` in `web/`, open `/search`, type a name — Expected: CORS error in console.
- [ ] **Step 2: Make the changes.**
- [ ] **Step 3: Verify** — same search returns live results, no console errors.
- [ ] **Step 4: Verify the build is unchanged** — `npm run build` succeeds with no rewrites warning.
- [ ] **Step 5:** `npm test` passes; commit with explicit pathspec.

---

### Task 6: `ev-designer` plugin and skill in ev-ui

**Files:**
- Create: `.claude-plugin/marketplace.json` — marketplace `empoweredvote`, one plugin `ev-designer`, source `./plugins/ev-designer`
- Create: `plugins/ev-designer/.claude-plugin/plugin.json`
- Create: `plugins/ev-designer/skills/ev-designer/SKILL.md`
- Create: `plugins/ev-designer/skills/ev-designer/public-api-routes.md`

**Interfaces:**
- Produces: marketplace name `empoweredvote`, plugin id `ev-designer@empoweredvote`, skill name `ev-designer`.

- [ ] **Step 1: Write `SKILL.md`.** Frontmatter `name: ev-designer`; description triggers on building or changing UI screens, components, or pages in an Empowered Vote frontend. Body, in this order:
  1. Data comes from the API through the repo's API helper (named in that repo's `CLAUDE.md`). Never type real-looking names, numbers, dates, quotes or IDs into components.
  2. Run the dev server with no `VITE_API_URL`; `/api` reaches live public data. If requests fail, say so and stop — do not replace failed data with invented data.
  3. Before inventing anything, check `public-api-routes.md`.
  4. Missing-data rule: the three steps from spec §2.3, verbatim, including the `Stands in for:` header and the PR section name **"Data this needs from the API."**
  5. Signed-in screens show signed-out state locally; design the signed-out state from live data and put any signed-in sample in `src/mocks/` under the same rule.
- [ ] **Step 2: Build `public-api-routes.md`.** Collect every path the five frontends fetch: `grep -rhoE "\\$\\{(API_BASE|AUTH_BASE)\\}/[a-zA-Z0-9_/-]+" <repo>/src` across essentials, read-rank, treasury-tracker, CompassV2, on-the-record/web. Keep only GET routes that answer `200` from `https://accounts-api.empowered.vote` without a cookie. For each: path, one-line purpose, which app uses it, and a trimmed sample response (≤ 15 lines) taken from the live call. Header line: "Hand-kept. Regenerate when a frontend adds a route."
- [ ] **Step 3: Verify the plugin loads** — in a scratch directory, `claude plugin marketplace add ./` from the worktree, `claude plugin install ev-designer@empoweredvote`, start `claude` and confirm `ev-designer` appears in the skills list.
- [ ] **Step 4: Verify the skill steers Claude** — in a read-rank worktree with Task 2 merged, ask Claude "add a card showing the next three races." Expected: it fetches through `src/data/api.ts` and writes no hardcoded race names.
- [ ] **Step 5: Commit** `-- .claude-plugin plugins`.

---

### Task 7: Wire every frontend to the skill

Repeat in essentials, read-rank, treasury-tracker, CompassV2, on-the-record (each its own worktree/PR; may ride on the Task 2–5 branch for that repo).

**Files (per repo):**
- Create or modify: `.claude/settings.json` — add
  ```json
  { "extraKnownMarketplaces": { "empoweredvote": { "source": { "source": "github", "repo": "EmpoweredVote/ev-ui" } } },
    "enabledPlugins": { "ev-designer@empoweredvote": true } }
  ```
  merging with any existing keys.
- Create or modify: `CLAUDE.md` — a "Designing screens" section of ≤ 4 lines: use the `ev-designer` skill; the API helper here is `<path>`; mocks go in `src/mocks/`.
  API helper per repo: essentials — the `API_BASE` pattern in `src/components/CampaignFinance/hooks/useCampaignFinance.js`; read-rank — `src/data/api.ts`; treasury-tracker — `src/data/dataLoader.ts`; CompassV2 — `src/lib/auth.js` (`API_BASE`); on-the-record — `web/app/search/SearchView.tsx` (`API_BASE`).
- Create: `src/mocks/README.md` (OTR: `web/src/mocks/README.md`) — the missing-data rule in three lines.
- Create or modify: `.github/pull_request_template.md` — add a **"Data this needs from the API"** heading and the checkbox `- [ ] All data comes from the API or from \`src/mocks/\` (listed above).`

- [ ] **Step 1: Make the four file changes.**
- [ ] **Step 2: Verify** — fresh clone of the branch, start `claude` in it: it offers to install the `empoweredvote` marketplace / `ev-designer` plugin; after accepting, the skill is listed.
- [ ] **Step 3: Verify** — open the PR and confirm the template text appears in its body.
- [ ] **Step 4: Commit** with explicit pathspec: `-- .claude/settings.json CLAUDE.md src/mocks/README.md .github/pull_request_template.md`.

---

## Rollout order

Task 1 → Tasks 2, 3 (the two broken repos) → Task 4 → Task 6 → Task 7 → Task 5. Each merge helps on its own.

## Done when

- A fresh clone of each of the five frontends, with no `.env`, shows live data on its main screen.
- Starting Claude in each repo offers the `ev-designer` plugin.
- After the next three designer PRs, count hardcoded data values review had to replace outside `src/mocks/`. Target: zero.
