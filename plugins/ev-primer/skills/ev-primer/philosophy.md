# Empowered Vote — Platform Primer

*Philosophy, pillars and product rules. Written February 2026; re-read on 2026-11-05
and kept, except where flagged inline.*

Read this before writing any code, proposing any architecture, or making decisions about
naming, structure or tooling. **Technical decisions that conflict with the values below are
wrong decisions, even when they are technically elegant.**

This is the half that does not rot. It describes what Empowered Vote is for and what it
refuses to do, and almost none of it is a claim about a running system, so it survives
schema changes, service migrations and renames.

The companion document, [`infrastructure.md`](./infrastructure.md), holds the half that does
rot: schemas, services, repo conventions and the new-feature checklist. It carries its own
verification date, and the two are split precisely so that this one is not quietly discredited
when that one goes stale.

---

## Platform Philosophy

*Read this section before anything else. Technical decisions that conflict with these values are wrong decisions, even if they're technically elegant.*

### The Two Mars Problems

Empowered Vote exists to solve two civilizational problems:

**The First Mars Problem** (Mars, God of War): How do we end war before it ends us? All it takes is one generation that doesn't fear nuclear weapons to end life on Earth. The platform is one response to this — building the civic infrastructure that helps humanity govern itself before it destroys itself.

**The Second Mars Problem** (Mars, the planet): What should the first Martian government look like? We have one generation to design a modern democracy before it's needed. By designing for colonists who won't know us, we force ourselves to build value-driven systems that can't be corrupted by self-interest.

These aren't abstract — they are the design horizon. Every feature should be able to answer: *would this still work for the Omegas (first Martian colonists)?*

### The North Star

**Shared Facts → Shared Values → Shared Solutions**

Shared solutions last the longest because they benefit everyone for the same reason. No manipulation or coercion is necessary when we both earnestly want the same thing.

In order for solutions to last, we need to solve shared problems while using shared facts.

### Value-Driven vs. Objective-Driven Frameworks

This distinction is foundational to every system we build.

**Value-driven:** The objective changes based on where facts and values point. Solutions are built from the ground up using shared values — they last a very long time because they benefit everyone for the same reason.

**Objective-driven:** Start with a privately-held conclusion, then find facts and values to support it. Like an advertising agency or a defense attorney. Values are cherry-picked at convenience. These systems have an expiration date.

**The designer's test:** Are the goals of this system aligned with the goals of its users, or is it designed at their expense? Free-to-Play games, surveillance capitalism, and campaign advertising are all objective-driven. We build the other kind.

### The Cake Trick (Checks and Balances)

The platform's approach to power comes from a simple insight: when one party cuts the cake and the other chooses first, the cutter's optimal play is to make the cut as equal as possible. Our forefathers used this logic. We extend it: **leadership gets the second slice.** Citizens' voices guide leaders, not the other way around.

### Memory Over Moderation

We do not delete bad information — we make its origins and consequences visible. Accountability happens through transparent record-keeping, not censorship. When someone repeatedly spreads misinformation, their Veracity Rating drops and their reach decreases. The record of what they said and when it was disproven remains public. This is a hard design principle, not a policy preference.

### The Target User

The single mother who doesn't have much time to engage in politics but still wants to vote responsibly as a citizen. Every Inform Pillar feature must be able to answer: does this help her vote responsibly faster, or does it slow her down?

### Anti-Partisan (Not Non-Partisan)

Non-partisan = avoid controversy, find the middle. This can be exploited — radical positions shift the "middle" arbitrarily.

Anti-partisan = remove the distorting influence of political parties from information presentation entirely. Focus on policy substance, not party mascots. We support citizens and candidates but not their political parties. This is a design constraint, not a stance.

### Pilot Context

**Bloomington, Indiana** (Monroe County) is the launch pilot. Semi-purple, politically diverse, home to Indiana University. UX Researcher Chris Andrews is local. IU political science, philosophy, game design, and CS students are the expected early adopter cohort. When making decisions about local feature scope, this is the reference community.

---

## The Three Pillars

All features belong to one pillar. The pillar determines access model, privacy requirements, and architecture.

### Inform — Finding Shared Facts
**Problem:** Information Pollution
**Audience:** Everyone. No account required. Optimize for maximum reach.
**Core beliefs:** Facts must be evidence-based. Information must be engaging. Approach must be anti-partisan.
**Philosophy:** Single-player experiences using game mechanics to make the same facts appeal to the broadest possible audience. Information is one-directional — the goal is not to change minds but to help everyone see the same problems. We leave analysis, conclusions, and punditry to the Connect Pillar.

Features: Empowered Essentials, Empowered Compass (calibration), Read & Rank, Fallacy Finders, Civic Trivia Championship, Empowered Badges, Treasury Tracker, Veracity Rating, Emparks.

**Key Inform design rules:**
- Party labels are intentionally minimized. Policy substance first, party affiliation last-resort.
- Local representatives shown BEFORE state, state BEFORE federal. Local impact is most direct; local races are most underserved.
- Read & Rank is always blind — policy positions are unattributed until after ranking is complete.
- Anonymous users can earn and unlock badges; they cannot display them (no profile to show on).

---

### Connect — Unpacking Shared Values
**Problem:** Political Polarization
**Audience:** Smaller subset — users willing to participate, not just consume.
**Core beliefs:** Protect citizen conversations. Difficult discussions are guided by shared values. Only focus on shareable problems.
**Philosophy:** Authenticated, pseudonymous community. We don't need to know who users are — we need to ensure each person has exactly one voice and lives where they claim. Design cues come from mediation and counseling, not anonymous internet forums.

Features: Civil Civics, Equal Slice, Symposiums, Common Grounds, Issues in Focus, Communal Councils, Tolerance Reach, Awareness Exchange.

**Key Connect design rules:**
- Connected users use pseudonyms. Never expose legal identity.
- Civic conversations require iterative community (where your actions affect the people who know you) to breed trust.

---

### Empower — Creating Shared Solutions
**Problem:** Civic Impotence
**Audience:** Smallest subset — Connected users who choose civic leadership.
**Core beliefs:** Equality demands Equity of Opportunity. Leadership gets the second slice. We preserve the legacy of the next generation.
**Philosophy:** Give serious citizens tools to make real democratic impact without being beholden to the donor class. Empowered users trade privacy for influence — their civic stances become fully public and searchable. They can run for office on the strength of their solutions without needing fundraising infrastructure.

Features: Empowered Accounts, Empowered Candidates, Empowered Bills, Democracy 2.0, Awareness Exchange (full), Ranked Choice, Empowered Endorsements, Roles, Symposium speaking.

**Key Empower design rules:**
- Empowered is an extension of Connected — never a separate identity.
- Empowered users appear under their real (legal) names. The trade is explicit: privacy for influence.
- It will never cost money to Connect or Empower an account. Equity of Opportunity is non-negotiable.


---

## Account and Compass Rules

*These are product decisions, not observations of a running system, so they live here rather
than in `infrastructure.md`. They are only as current as the decisions behind them, and two
of them carry numbers that have moved — flagged inline.*

*The three schema references in this section were checked on 2026-11-05 and all exist:
`inform.compass_topic_roles`, `public.user_roles`, `inform.compass_topics`. The role list
itself, the gem cadence and the grace period were not audited against code — they are stated
intent.*

### "Fully Calibrated" Definition

For Empowered Accounts: **all 20 live Top Priority topics answered** (plus any role-relevant extras). Not just the topics the user selected for their visible compass — all of them. Enforced before empowerment is permitted.

> **Stale number, 2026-11-05.** 61 compass topics are live, not 20. The rule itself —
> all live topics, role-filtered — may still be right, but the count in it is three times
> out of date and it is written as an enforcement threshold. See open question 7 in
> `infrastructure.md`; do not implement against the number until it is settled.

Topics are role-filtered: a city council candidate does not need to calibrate on foreign policy topics. A US Congress candidate does. Role relevance is stored in `inform.compass_topic_roles`.

**Grace period:** When a new topic goes live, Empowered Accounts have 30 days to calibrate. Failure to calibrate within 30 days triggers demotion to Connected. Demotion is reversible — complete missing calibrations and request re-empowerment.

### Anonymous Compass Storage

Anonymous users' compass data lives in **browser localStorage**. When they create a Connected account, an import flow migrates their localStorage calibration to the database. The import job must handle conflicts (topic version mismatches, stance text changes since they calibrated).

Always provide a JSON export option for anonymous users so they can preserve calibration across devices or browser clears before creating an account.

### Reputation Systems

Two systems. Do not conflate them.

**Veracity Rating** — public. Shown with every post. Tracks accuracy of contributed information over time. Lower rating reduces reach of future contributions. All adjustments are transparent, documented, and contestable.

**Tolerance Rating** — private for Connected Accounts (never returned to anyone except the account owner); **public for Empowered Accounts** (civic leaders are held to higher transparency). Never sold. Tracks productive engagement patterns — the ability to disagree without being disagreeable. Sets a user's sphere of influence (reach) on the platform. When it decreases, the user is notified privately with specific details. A high Tolerance Rating does not indicate correct views — only constructive engagement style.

### Empowered Gems

Closed economy. **Never sold. Never traded outside the platform.** Full transaction ledger — every gem has a memory of where it's been.

- Distributed as a stipend on a set cadence (cadence TBD)
- Earned through Inform games and productive Connect contributions
- Per-feature closed economies — gems may not be transferable across all features
- Excess above reserve cap is use-it-or-lose-it at next stipend
- No gem purchases. No premium gem tiers. No exceptions.

Selling civic influence is the game-design equivalent of Pay-to-Win applied to democracy. It is architecturally prohibited.

### Roles

Junction table `public.user_roles`. Users can hold multiple roles. Cannot wear two hats in the same feature simultaneously.

- **Maven** — Empowered. Curate Badges, develop trivia questions, specialize on an Issue in Focus.
- **Journo** — Authenticated. Evidence-based content creation. Submit to Inform Pillar.
- **Arbiter** — Authenticated. Logical fallacy detection. Mediate Common Grounds. Validate Journo submissions.
- **Moderator** — Connected. Community organizers.
- **Juror** — Authenticated. Serve on Communal Councils.
- **Educator** — Authenticated. Create and validate Empowered Badges.
- **Guide** — Empowered. Civic leadership. Speak in Symposiums and Shared Grounds.
- **Scribe** — Empowered. Draft legislation via Empowered Bills.

---

## Data Sourcing (Inform Pillar)

This is important context for Inform features that depend on external data:

**Campaign finance:** OpenSecrets API was discontinued by the current administration. We are building **Transparent Motivations** as a replacement — an internal database capturing all publicly disclosed political donations. Direct FEC access + state databases. Do not assume OpenSecrets is available.

**Google Civic API:** Access has been reduced. Do not assume reliable access.

**Voting records:** Congress.gov for federal; state legislature websites for state. When available, automate. For the Bloomington pilot, data is manually curated.

**Partner strategy:** League of Women Voters has aligned mission and existing local chapter infrastructure. Partnership is a likely path for distributed data entry at scale.

**Pilot data scope:** Bloomington pilot uses manually curated data for Monroe County, Indiana. This is intentional — tight quality control before automating.


---

*Philosophy and pillars: unchanged from February 2026 and still current.*
*Product rules: carried over, with stale counts flagged rather than silently edited.*
*Infrastructure, schemas and services: [`infrastructure.md`](./infrastructure.md).*
*Maintainer: Chris — Founder, Empowered Vote*
