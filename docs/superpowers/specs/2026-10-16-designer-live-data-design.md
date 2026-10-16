# Designers build against live data, not invented data

**Date:** 2026-10-16
**Status:** Draft for review
**Scope:** every Empowered Vote frontend repo, plus one shared Claude skill

## Problem

Volunteer UX designers work in Claude Code on a local clone of a frontend repo. When a screen
needs data they cannot get, Claude invents it and hardcodes it into components. Their PRs then
need heavy rework before merge.

The data they need is almost always **public** — officials, races, compass stances — that the
live site already shows. It is not private or signed-in data.

## What we found (2026-10-14)

- **No frontend needs a secret to read public data.** They read only through the API base URL
  (`VITE_API_URL`, or `NEXT_PUBLIC_EV_ACCOUNTS_URL` in On the Record). They never talk to
  Supabase directly. The live API answers public routes without a key.
- **The live API refuses browser requests from `localhost`.** Its CORS allow-list holds only
  the production domains (`backend/src/index.ts` in ev-accounts). A page served by a local dev
  server gets blocked, so the designer sees errors and Claude fills the gap.
- **Two repos already solve this; the rest do not.**

  | Repo | Dev proxy to live API | Default with no `.env` |
  |---|---|---|
  | essentials | yes, `/api` → `accounts-api.empowered.vote` | live data |
  | CompassV2 | yes, `/api` → `accounts-api.empowered.vote` | live data |
  | read-rank | no (proxies only `/auth` to `localhost:5050`); `.env.example` points `VITE_API_URL` at `localhost:3000` | needs a local backend, which needs DB secrets |
  | treasury-tracker | proxy exists, but target defaults to `localhost:5050` | needs a local backend |
  | on-the-record/web | none; most reads are server-side (no CORS), `app/search/SearchView.tsx` fetches from the browser | search breaks |

- **Claude has no index of the public API**, so even with data flowing it guesses route names
  or falls back to inventing data.
- Some screens need data **no API route returns yet**. The designer has no honest option today
  except to invent it, and nothing marks where they did.

## Goals

1. `npm install && npm run dev` in any frontend shows real public data, with no keys and no
   local backend.
2. Claude reaches for the API before it reaches for invented data.
3. When data genuinely does not exist yet, it lives in one marked place and the PR names it.

**Success:** a designer's PR either uses live data or lists exactly what the API is missing.
Review fixes one mock file, not scattered hardcoded values.

## Non-goals

- **Signed-in or private data.** Designers rarely need it. If that changes, the next step is a
  staging database with a shared test account — a separate decision.
- **Giving designers any secret.** Nothing in this design moves a key.
- **Changing the production CORS allow-list.** The dev proxy makes it irrelevant locally.
- **Google Maps.** Read & Rank's Maps dependency is being removed, so it needs no designer key.
- **A CI check for hardcoded data.** A script cannot reliably tell invented data from interface
  copy. Revisit only if parts 1–2 do not cut the rework.

## Part 1 — The same live-data setup in every frontend

Each frontend repo gets the pattern essentials and CompassV2 already use:

- A dev-server proxy forwards `/api/*` to `https://accounts-api.empowered.vote`. The browser only
  sees same-origin requests, so CORS never applies. The proxy strips or rewrites the `Origin`
  header the way essentials does.
- **The default is the live API.** With no `.env` file, `npm run dev` shows live data.
  A developer running the backend locally overrides the target with one variable
  (e.g. `VITE_API_PROXY_TARGET=http://localhost:3000`).
- `.env.example` is updated to match, with a comment saying what the default does.
- On the Record (Next.js): add a `rewrites()` entry for `/api/*` in `web/next.config.ts`, and have
  the browser-side search fetch the relative path in development.

Safety: the proxy reaches only what any member of the public reaches from a browser. A
designer who is not signed in can read public data and change nothing.

Per-repo work:

| Repo | Change |
|---|---|
| essentials | none — already the reference |
| CompassV2 | none |
| read-rank | add `/api` proxy, default to live API, fix `.env.example` |
| treasury-tracker | change proxy default from `localhost:5050` to the live API |
| on-the-record/web | add rewrite; route browser search through it in dev |

## Part 2 — Rules so Claude stops hardcoding

### 2.1 One shared "designer" skill

One Claude skill, kept in a single shared place (proposed: this repo, `ev-ui`, under
`claude/skills/ev-designer/`), so the rules do not drift across six copies. It tells Claude:

- Get data from the API through the repo's existing API helper. Never type real-looking names,
  numbers, dates or quotes into components.
- Here is the **index of public API routes**, each with one trimmed sample response. Check it
  before inventing anything.
- If no route fits, follow the missing-data rule (2.3).

The route index is generated from the backend's route files where practical, so it stays
current; a hand-kept list is acceptable for the first version.

### 2.2 A pointer in each frontend's `CLAUDE.md`

Two or three lines per repo: load the `ev-designer` skill, and name that repo's API helper file.
Claude reads `CLAUDE.md` in every session, so designers do not have to remember anything.

### 2.3 The missing-data rule

When a screen needs data that no API route returns:

1. Put the sample data in one file under `src/mocks/`, shaped like the response the API would
   return. Start the file with a comment naming the route it stands in for.
2. Load it through the same helper the real data uses, so replacing it later is a one-line
   change.
3. List it in the PR under **"Data this needs from the API."** That list becomes the backend task.

### 2.4 PR template checkbox

Add to each frontend's PR template:

> - [ ] All data comes from the API or from `src/mocks/` (listed above).

## Rollout order

1. read-rank and treasury-tracker proxies (the two repos that currently break).
2. The `ev-designer` skill with a hand-kept route index.
3. `CLAUDE.md` pointers and PR template lines in every frontend.
4. On the Record rewrite.
5. Generated route index, if the hand-kept one drifts.

Each step ships on its own and helps on its own.

## How we will know it worked

- A fresh clone of each frontend, with no `.env`, shows live data on its main screens.
- The next few designer PRs: count hardcoded data values that review had to replace. Target zero
  outside `src/mocks/`.

## Open questions

- Where designers install the skill from: a Claude Code plugin in `ev-ui`, or a copy in each repo's
  `.claude/skills/`. The plugin keeps one copy; the per-repo copy needs no install step.
