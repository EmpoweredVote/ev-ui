---
name: ev-primer
description: Use when starting work in any Empowered Vote repo (ev-accounts, ev-ui, focused-communities, CompassV2, essentials, read-rank, treasury-tracker, on-the-record, civic-spaces, Empowered-Listening, Fallacy Finders, Civic-Trivia-Championships) — before writing code, proposing architecture, naming a table or schema, choosing a branch, adding a service, or deciding what a feature is allowed to do. Carries the platform's values and three-pillar model, plus the verified state of the shared Supabase project, services and repo conventions.
---

# Empowered Vote — platform primer

Two documents sit beside this one. They are split by shelf life, not by topic.

| File | What it holds | How to treat it |
| --- | --- | --- |
| [`philosophy.md`](./philosophy.md) | Values, the three pillars, account tiers as a product model, reputation, gems, roles, data sourcing | Durable. Conflicts with it are design bugs, not trade-offs. |
| [`infrastructure.md`](./infrastructure.md) | Supabase schemas and real column names, services, repo layouts, the new-feature checklist | Dated. Verified 2026-11-05. Re-check before trusting, and move the date when you do. |

**Read both before the first line of code.** If you only have room for one, it depends on the
task: naming, scope and "should we build this" → `philosophy.md`. Schemas, branches, deploys
and health checks → `infrastructure.md`.

## The five that get violated most

1. **Shared Facts → Shared Values → Shared Solutions.** That order is the product. A feature
   that skips a step is in the wrong pillar.
2. **Never a status flag for account tier.** Presence of a profile row is the tier of record.
   `infrastructure.md` has the one caveat that trips everyone — a read-surface view that *does*
   expose `tier` — and you need it before you write a query.
3. **Memory over moderation.** Do not delete bad information; make its origin and consequences
   visible. This is architecture, not policy.
4. **Never sell civic influence.** Gems are not purchasable, Connect and Empower are never paid.
   Architecturally prohibited, no exceptions to negotiate.
5. **Build on live data, never invented data.** Typing a plausible name, number, date, quote or
   ID into a component is the single most common cause of a PR being sent back. For the API
   index and the fetch rules, use the `ev-designer` skill in this same marketplace.

## Before you trust anything in here

Both files state when they were last checked. `infrastructure.md` additionally marks every
claim it could not confirm as `[UNVERIFIED]` or `[OPEN]`, and collects the open ones at the end.

That is deliberate. The February 2026 primer this replaces asserted a table that does not
exist, a column set that had been renamed, a branch convention wrong for the repo shipping the
primer, and a health-check recipe that reports green forever. None of it was careless — it was
accurate, and then the system moved.

So: **if you check a claim here and it is wrong, fix it in the same PR as your work.** An
undated claim about production is indistinguishable from a stale one, and a document that opens
with "read this fully before writing any code" earns the right to say that only by staying true.
