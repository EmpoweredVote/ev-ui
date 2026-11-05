# Empowered Vote — Infrastructure Primer

*Checked against production on 2026-11-05. Supersedes the technical half of the February 2026
primer; the rest of that document is now [`philosophy.md`](./philosophy.md).*

This is the half that rots. Every factual claim below was verified against the live Supabase
project, the GitHub org, or a production HTTP response on the date above — or it is marked
`[UNVERIFIED]` or `[OPEN]`. If you are reading this more than a few months later, re-check
before trusting it, and move the date when you do.

The companion document, [`philosophy.md`](./philosophy.md), holds the philosophy, the three
pillars and the product rules. Those do not expire the same way and are not repeated here.

**A note on why this split exists.** The February primer stated, as fact, a database table that
does not exist, a column set that had been renamed, a branch convention that is wrong for the
repo that ships the primer, and a health-check recipe that reports green forever. None of it was
written carelessly; it was written accurately and then the system moved. A document that claims
"read this fully before writing any code" has to carry a date and a verification method, or it
quietly becomes the most confident wrong voice in the room.

---

## Account Architecture

Three tiers. **Presence of a profile row is the tier of record** — no tier flag is the source of
truth, though see the caveat below, which is the single most common thing to get wrong.

```
auth.users                          ← Supabase Auth
    └── public.users                ← our extension of auth identity          [TABLE]
        ├── connect.connected_profiles    ← Connect verification complete     [TABLE]
        └── empower.empowered_profiles    ← Empower activated                 [TABLE]
```

Note the schema prefixes. Neither profile table lives in `public`, and the February primer's
diagram omitted the prefixes for exactly these two.

### `public.connected_profiles` is a VIEW, not a table

```
public.connected_profiles   [VIEW]     ← read through this
connect.connected_profiles  [TABLE]    ← the real rows
connect.connected_profiles_public [VIEW]
```

The view is what most consumers read. Two things about it surprise people:

- **`user_id` is `text`**, not `uuid` — unlike `inform.compass_responses.user_id`, which is
  `uuid`. Joins across that boundary need a cast.
- **It exposes `tier`, `account_standing` and `is_suspended` columns.** The rule "the tier is the
  presence of a row, never a status flag" describes the write model; the read surface does
  present a flag, and clients consume it. Focused Communities' `AccountUser` type carries `tier`
  and `account_standing` — it reads them from the accounts API's `/api/account/me`, whose shape
  mirrors this view rather than the no-flags rule. Do not write code that contradicts the read
  surface because a document told you flags do not exist.

`empower.empowered_profiles` exists and currently holds **0 rows**. `[OPEN]` Is Empower
pre-launch, or has the activation path moved?

`[OPEN]` A third table, `civic_spaces.connected_profiles`, also exists. Whether that is a
deliberate per-product copy or drift needs a ruling before anyone builds against it.

### Display names

- `display_name` — pseudonym, shown in Connect contexts. Present on the `public` view.
- Legal names belong to Empower surfaces. `[UNVERIFIED]` The February primer named
  `empowered_profiles.legal_name`; the table exists but is empty, so the column was not
  confirmed in use.

---

## Compass and Stance Data Model

This grew from two columns into a subsystem. The February primer describes the two columns.

### `inform.compass_responses` — actual columns

```
user_id               uuid
topic_id              uuid
value                 numeric        ← was documented as stance_value
write_in_text         text           ← was documented as stance_text
visibility            text           ← text, not an enum
inverted              boolean
season_id             uuid           ← undocumented
answered_revision_id  uuid           ← undocumented
created_at            timestamptz
updated_at            timestamptz
deleted_at            timestamptz    ← soft delete, undocumented
```

Gone since February: `stance_type`, `stance_text`, `stance_value`, `calibrated_at`.
**`inform.compass_inferred` does not exist** in any schema. `[OPEN]` Abandoned, or planned and
not yet built? The February primer stated it as existing and nightly-batched, which is the kind
of claim that sends someone looking for a job that was never written.

### The stance tables

```
inform.compass_stances
inform.compass_stance_revisions
inform.stance_coder_labels
inform.stance_gold_labels
inform.stance_research_review
inform.topic_rewrite_stance_proposals
```

Stance text is versioned (`compass_stance_revisions`, and `compass_responses.answered_revision_id`
records which revision a person actually answered). There is a labelling and research-review
pipeline around stance quality. Treat stance text as versioned content, never as a literal you
can inline.

### Seasons

```
inform.seasons
inform.season_questions
```

Live and load-bearing — Focused Communities ships `useSeasons.ts` against them, and
`compass_responses.season_id` is populated. Any compass work has to account for which season a
response belongs to.

### Topics

`inform.compass_topics` columns include `is_live`, `is_active`, `version`, `went_live_at`,
`topic_key`, `office_scope` (array), `judicial_role` and `fc_community_slug` — the last being a
direct link from a compass topic to a Focused Communities community.

**61 topics are live** (64 total) as of the date above. The February primer's "all 20 live Top
Priority topics" is three times out of date, and it matters because it is written as an
enforcement threshold for empowerment.

`[OPEN]` What is the current calibration requirement — all live topics, or a named subset?

`[OPEN]` **Stance display.** The February primer says positions are `1.0–5.0, .5 increments
user-facing`. The rule recorded for Focused Communities is that users are never shown the
numbers 1–5 and that display order is randomised. These cannot both be current.

---

## Database Architecture

Single Supabase project, shared across products. Schema-based separation, and there are **26
schemas**, not the five the February primer listed.

Application schemas, with relation counts as of the date above:

| schema | tables | notes |
| --- | --- | --- |
| `public` | 14 + 15 views | identity extension, cross-product views |
| `inform` | 33 + 7 views | compass, topics, stances, seasons |
| `connect` | 18 + 3 views | profiles, communities, conversations |
| `empower` | 2 | currently empty |
| `essentials` | 78 + 8 views | the largest schema in the project |
| `treasury` | 40 | Treasury Tracker |
| `transparent_motivations` | 13 | campaign finance |
| `trivia`, `validation_quests` | 13 each | |
| `meetings` | 15 | |
| `civic_spaces` | 12 | |
| `listening` | 9 | |
| `compass_deprecated` | 8 | retired compass tables, still present |
| `judicial`, `staging`, `civic`, `steward`, `id_vault` | 1–6 each | |

Supabase-managed (`auth`, `storage`, `realtime`, `vault`, `extensions`, `net`, `cron`,
`supabase_migrations`) are not listed.

**Always prefix.** `inform.compass_responses`, never bare `compass_responses` — and this applies
to the profile tables too.

**RLS always on.** Inform data readable by all; Connect data requires a connected profile;
Empower data requires an empowered profile. Database policies are the primary defence,
application checks the second layer.

**Migrations only, through the Supabase MCP `apply_migration`** — not `db push`. The project is
shared with EV-Accounts, and a push can carry another product's in-flight changes. Never make
manual production schema changes.

---

## Infrastructure and Services

### Supabase

Primary database, auth and file storage. Supabase Auth — do not build custom auth. The service
role key is server-side only and must never reach a client.

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-side only
```

### Render

Hosting, in **two shapes** — the February primer described only the first.

**Web Service** (Express API). `ev-accounts` runs this way and serves
`https://accounts-api.empowered.vote`. All routes carry the `/api/` prefix. Use
`process.env.PORT`. Cold starts on the free tier are slow; UptimeRobot mitigates.

**Static Site** (built SPA). Focused Communities runs this way at
`focused-communities-frontend.onrender.com`. Its Express backend is frozen (see that repo's
`FROZEN.md`) and the API now lives inside `ev-accounts`; the old web service is suspended
deliberately. **A static site serves `index.html` for every unmatched path**, which has a
consequence worth internalising — see UptimeRobot below.

`[OPEN]` Is the Netlify proxy described in February still in front of anything?

### Upstash

Managed Redis. Always implement an in-memory fallback; Redis being down must not crash the API.

```typescript
let redisClient: Redis | null = null;
try {
  redisClient = new Redis(process.env.REDIS_URL!);
} catch {
  console.warn('Redis unavailable, falling back to in-memory cache');
}
```

### GitHub

**Check the default branch before you branch.** It is not uniform across the org:

- `master` — `focused-communities`, `ev-accounts`, `Empowered-Listening`,
  `Civic-Trivia-Championships`, `empowered-validation-quests`
- `main` — `civic-spaces`, `treasury-tracker`, `ev-ui`, `ev-landing`, `on-the-record`,
  `empowered-badges`, `ev-qa`, `ev-cto`, `ev-marketer`

`git switch -c <branch> origin/main` fails outright in five of the fourteen most active repos.
Run `git remote show origin | grep HEAD` or check the repo page.

Repository naming is **not** `empowered-[feature-name]`; only two of twenty-eight follow it. The
live conventions are `ev-*` for shared infrastructure and plain descriptive names for products.
Do not rename anything to match a pattern that does not exist.

`.env.example` always included. Never commit `.env` or secrets.

### UptimeRobot

Pings a health endpoint every 5 minutes. A real backend exposes:

```
GET /api/health → { "status": "ok", "timestamp": 1793861775541 }
```

Verified live on `accounts-api.empowered.vote`.

**Do not point a monitor at `/api/health` on a static site.** Focused Communities returns HTTP
200 with `content-type: text/html` for that path — the SPA fallback, not a health check. The
monitor would be green permanently, including while the site is completely broken. Monitor a
static site by fetching a real asset and asserting on its content type, or monitor the API it
depends on instead.

### Framer

`[OPEN]` The February primer named Framer as the production frontend. As of the date above,
`https://empowered.vote` serves hand-written static HTML (~139 KB) behind Cloudflare, with no
Framer markers in the document. Whether Framer still serves any surface needs a ruling; if not,
this section should be deleted rather than left to mislead.

---

## Repo Layout

**There is no standard layout, and pretending otherwise sends people looking for directories that
do not exist.** The February primer's `backend/` + `frontend/` shape matches *none* of the
repos checked. What actually exists:

| repo | shape |
| --- | --- |
| `ev-accounts` | `backend/`, `app/`, `admin/`, `supabase/` — the only repo with `backend/` |
| `focused-communities` | `src/` (frozen backend), `frontend/` (Vite SPA), `supabase/` |
| `civic-spaces` | `src/`, `public/`, `supabase/` — Vite SPA |
| `treasury-tracker` | `src/`, `public/`, `supabase/`, `e2e/` |
| `Empowered-Listening` | `app/`, `components/`, `hooks/`, `lib/`, `store/` — **Next.js** |

Next.js is in production use and the February primer does not mention it at all.

Shared conventions that *are* real: a `supabase/` directory with CLI migrations, a `.planning/`
workspace in most repos, and `.github/workflows/` for CI.

**Read the repo's own `CLAUDE.md` first.** It is the authority for that repo and it is current in
a way this document cannot be.

---

## Development Principles

Unchanged and still correct:

- **Privacy by default.** Collect only what is necessary.
- **Value-driven architecture.** System goals align with user goals.
- **Equity of Opportunity.** No pay-to-win civic influence; gems are never for sale.
- **Memory over moderation.** Make origins and consequences transparent rather than deleting.
- **Anti-partisan by design.** Policy substance before party labels; local before state before
  federal.
- **Graceful degradation.** Redis down does not crash the API.
- **TypeScript everywhere.** Strict typing, no `any` without justification.
- **Migrations only**, via `apply_migration`.

Added, from what this audit turned up:

- **A check that cannot fail is not a check.** The `/api/health` monitor on a static site is the
  worked example: green forever, measuring nothing. Before trusting a green signal, confirm it
  can go red.
- **Date your claims.** Anything stating how production is configured carries the date it was
  verified. An undated claim is indistinguishable from a stale one.

---

## New Feature Checklist

1. **Check the default branch** (`master` or `main` — both are in use) and branch from it.
2. Read the repo's `CLAUDE.md`.
3. Scaffold to match the repo you are in, not to a template.
4. Create `.env.example`.
5. If it is a backend: add `GET /api/health` returning `{ status, timestamp }` immediately.
6. Supabase client: service role server-side, anon key client-side.
7. Redis with in-memory fallback, if used.
8. Identify or create the Supabase schema, and prefix every reference.
9. CI that runs the tests **of the code that ships** — not only the build, and not only a
   sibling package's suite.
10. Post-deployment: UptimeRobot on a real health endpoint, or on a static asset with a content-type
    assertion. Never on an SPA fallback path.

---

## Open questions for Chris

Marked `[OPEN]` above, collected:

1. Is Framer still serving any surface?
2. Is the Netlify proxy still in front of anything?
3. Is `civic_spaces.connected_profiles` a deliberate copy, or drift?
4. `empower.empowered_profiles` has 0 rows — pre-launch, or superseded?
5. `inform.compass_inferred` — abandoned, or planned and unbuilt?
6. Stance display: `1.0–5.0, .5 increments user-facing`, or never show 1–5 and randomise order?
7. Calibration threshold for empowerment, now that 61 topics are live rather than 20.

---

*Verified 2026-11-05 against the live Supabase project, the EmpoweredVote GitHub org (28 repos),
and production HTTP responses.*
*Supersedes the technical half of the February 2026 primer. Philosophy and pillars: [`philosophy.md`](./philosophy.md).*
*Maintainer: Chris — Founder, Empowered Vote*
