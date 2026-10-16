---
name: ev-designer
description: Use when building or changing UI screens, components or pages in an Empowered Vote frontend (essentials, read-rank, treasury-tracker, CompassV2, on-the-record). Keeps designs on live public data instead of invented, hardcoded data.
---

# Designing Empowered Vote screens on live data

Empowered Vote's public data — officials, races, compass stances, budgets, meetings — is
served by one API. You can read all of it locally with no keys. Invented data in a component
becomes rework for whoever merges the PR, so use the real thing.

## 1. Data comes from the API

- Fetch through the repo's existing API helper. The repo's `CLAUDE.md` names it.
- **Never type real-looking names, numbers, dates, quotes or IDs into a component.** Not as
  placeholders, not "for now". Interface copy (labels, headings, button text) is fine.
- Pick real records to design against: a busy politician, a sparse one, a long name. Live data
  shows the edge cases a mockup hides.

## 2. Run the dev server with no `VITE_API_URL`

`npm run dev` proxies `/api` to the live API. Leave `VITE_API_URL` unset or empty in local dev;
an absolute value skips the proxy and the browser blocks the call (the dev server prints a
warning when this happens).

**If a request fails, say so and stop.** Report the URL and the status. Do not replace failed
data with invented data — that hides the failure and ships the rework.

## 3. Check the index before inventing anything

`public-api-routes.md`, next to this file, lists the public routes with a trimmed live sample of
each. Read it first. If nothing fits, search the frontend's source for an existing call before
deciding the data is missing.

## 4. The missing-data rule

When a screen needs data that no API route returns:

1. Put the sample data in one file under `src/mocks/`, shaped like the response the API would
   return. Start the file with a comment naming the route it stands in for:
   `// Stands in for: GET /api/<route> — not yet served by the API`
2. Load it through the same helper the real data uses, so replacing it later is a one-line
   change.
3. List it in the PR under **"Data this needs from the API."** That list becomes the backend
   task.

## 5. Signed-in screens

Locally you are signed out: session cookies belong to the live site. Design the signed-out state
from live data. Put any signed-in sample (a user's own answers, profile) in `src/mocks/` under
the same rule.
