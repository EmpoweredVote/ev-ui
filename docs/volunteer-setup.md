# Volunteer setup: real data in Claude

For designers and volunteers working on Empowered Vote apps with Claude. Ten minutes, once.

## The two rules

1. **Real data only.** Every screen shows live public data from the Empowered Vote API. Never
   invented names, numbers, dates or quotes. If the data does not exist yet, mark it (see below).
2. **Current code only.** Start each piece of work from the latest `main`. An old clone or an old
   branch brings back screens that have already changed.

You need **no keys, passwords or `.env` values**. All the data you design with is public. If
anything asks you for a secret, stop and ask in the team channel.

## One-time setup

1. Install Node.js 20 or later, Git, and the Claude desktop app.
2. Clone the app you are working on (essentials, CompassV2, read-rank, treasury-tracker or
   on-the-record) from github.com/EmpoweredVote.
3. In Claude Code, add the Empowered Vote plugin marketplace and the designer skill:

   ```
   /plugin marketplace add EmpoweredVote/ev-ui
   /plugin install ev-designer@empoweredvote
   ```

## Each time you start work

```bash
git fetch origin
git switch -c <your-branch-name> origin/main
npm install
npm run dev
```

Do **not** create a `.env` file. With no `.env`, `npm run dev` reads the live public API.
On the Record runs from its `web/` folder.

You are signed out locally. A failed `/api/auth/session` line in the browser console is normal.

## When data is missing

Sometimes a screen needs data the API does not serve yet. Then Claude should:

1. Put sample data in **one** file under `src/mocks/`, starting with
   `// Stands in for: GET /api/<route> — not yet served by the API`.
2. List it in your PR under **"Data this needs from the API"**.

That list becomes the backend task. Scattered made-up values are what cost review time.

## Prototypes outside the app

A standalone HTML prototype or a published Claude artifact cannot call the API from the page.
Ask Claude to fetch real records first and embed them, with the date fetched:

> Fetch three real races from https://accounts-api.empowered.vote/api/readrank/races and use
> them in the prototype. Mark anything you could not fetch as a placeholder.

## Before you open a PR

- [ ] Branch made from current `origin/main`.
- [ ] No `.env` file, key or password in the change.
- [ ] All data comes from the API or from `src/mocks/` (listed under "Data this needs from the API").
- [ ] Shared components come from `@empoweredvote/ev-ui`, not copies.

## Off limits

Account and user data — profiles, answers, emails, anything behind sign-in — is not available
for design work, and you should not try to reach it. Mock signed-in screens under `src/mocks/`.
