# ev-ui Auto-Bump Pipeline

This repo is the source of truth for `@empoweredvote/ev-ui`. When a new version is published, every consumer app automatically receives a PR to bump the dependency. Patch and minor bumps auto-merge; major bumps require manual review.

## Release workflow

1. Make changes on a feature branch, PR into `main`.
2. After merging to `main`, bump the version and push a tag:
   ```bash
   npm version patch    # or minor / major
   git push origin main --follow-tags
   ```
3. The `publish.yml` workflow:
   - Verifies `package.json` version matches the tag
   - Builds the package
   - Publishes to npm
   - Dispatches `ev-ui-published` to each consumer repo

## Consumer flow

Each consumer repo has `.github/workflows/ev-ui-bump.yml` that:
1. Receives the dispatch
2. Creates a branch `chore/bump-ev-ui-<version>`
3. Runs `npm install @empoweredvote/ev-ui@<version>`
4. Opens a PR
5. Enables auto-merge (squash) if `bump_type` is `patch` or `minor`

Once `build-check.yml` passes on the PR, auto-merge completes the merge, and Render auto-deploys `main`.

## Current consumers

- CompassV2
- essentials
- read-rank
- civic-spaces

## Adding a new consumer

1. Install ev-ui in the new repo: `npm install @empoweredvote/ev-ui`
2. Copy `.github/workflows/ev-ui-bump.yml` from any existing consumer
3. Copy `.github/workflows/build-check.yml` from any existing consumer
4. Install the `ev-ui-autobump` GitHub App on the new repo (add it via the app's install page)
5. Add `APP_ID` and `APP_PRIVATE_KEY` secrets to the new repo (same values as other consumers — run `gh secret set APP_ID --repo EmpoweredVote/<new-repo> --body "<app-id>"` and `gh secret set APP_PRIVATE_KEY --repo EmpoweredVote/<new-repo> < /path/to/private-key.pem`)
6. Settings → General → enable "Allow auto-merge"
7. Settings → Branches → require `build` status check on `main` (may need a throwaway PR first to register the check — see the "register build-check" pattern in git history)
8. Add the new repo to the `matrix.consumer` list in `ev-ui/.github/workflows/publish.yml`
9. Update this file's "Current consumers" list

## Authentication

### npm publishing — Trusted Publishing (OIDC)

This workflow uses **npm trusted publishing** via OpenID Connect. There is **no `NPM_TOKEN` secret** — GitHub Actions authenticates to npm using a short-lived OIDC token generated per workflow run.

**Requirements:**
- The `publish` job must have `permissions: id-token: write`
- Node version must be 22.14+ (runner uses `actions/setup-node@v6` with `node-version: '24'`)
- A trusted publisher is configured on npmjs.com for `@empoweredvote/ev-ui` pointing to `EmpoweredVote/ev-ui` with workflow filename `publish.yml`
- `package.json` must have a `repository.url` field matching the GitHub URL (required for provenance validation)

**To inspect or change the trusted publisher:** https://www.npmjs.com/package/@empoweredvote/ev-ui/access → Trusted Publisher section.

**Bonus:** Trusted publishing automatically generates [npm provenance attestations](https://docs.npmjs.com/generating-provenance-statements) — cryptographic proof that this package was built from this GitHub repo. You'll see a "Published with provenance" badge on npmjs.com.

### Cross-repo dispatch — `ev-ui-autobump` GitHub App

Cross-repo communication (dispatching events from ev-ui to consumer repos, then committing/PR'ing in consumer repos) uses a **GitHub App** called `ev-ui-autobump` — not a Personal Access Token.

**Why a GitHub App instead of a PAT:**
- Installation tokens are minted on-the-fly per workflow run and expire in 1 hour
- No long-lived secret to rotate (private key can be regenerated without service interruption)
- Commits are attributed to `ev-ui-autobump[bot]` — clearer audit trail
- Scoped to only the 5 repos it's installed on

**Setup (one-time, already done):**
1. App created at https://github.com/organizations/EmpoweredVote/settings/apps/ev-ui-autobump
2. Repository permissions: Actions R/W, Contents R/W, Metadata R, Pull requests R/W
3. Webhooks disabled
4. Installed on: `ev-ui`, `CompassV2`, `essentials`, `read-rank`, `civic-spaces`

**Secrets required in all 5 repos:**
- `APP_ID` — numeric App ID (from app settings page)
- `APP_PRIVATE_KEY` — PEM-formatted private key (generated once, can regenerate without downtime)

**How workflows use it:**

```yaml
- name: Mint installation token
  id: app-token
  uses: actions/create-github-app-token@v2
  with:
    app-id: ${{ secrets.APP_ID }}
    private-key: ${{ secrets.APP_PRIVATE_KEY }}
    # For cross-repo use in ev-ui publish.yml, also specify:
    # owner: EmpoweredVote
    # repositories: CompassV2  # (or whichever target repo)

# Then use in subsequent steps:
- uses: actions/checkout@v6
  with:
    token: ${{ steps.app-token.outputs.token }}
```

**Rotating the private key (if compromised or periodically):**
1. Go to app settings → Private keys → Generate a private key (download new .pem)
2. Update `APP_PRIVATE_KEY` secret in all 5 repos: `gh secret set APP_PRIVATE_KEY --repo EmpoweredVote/<repo> < new-key.pem`
3. Delete the old private key from the app settings page
4. You can have multiple valid keys at once, so there's no breakage window

## Debugging

- **Dispatch not firing:** check `ev-ui/.github/workflows/publish.yml` run logs in the `dispatch` job.
- **Consumer PR not opening:** check the consumer's Actions tab for the `Bump @empoweredvote/ev-ui` workflow run.
- **Auto-merge not enabled:** confirm "Allow auto-merge" is enabled in repo settings and `build` is a required status check.
- **Build-check failing:** the consumer's build is actually broken. Fix the build and push to the PR branch; auto-merge will re-evaluate.

## Manual trigger

To re-bump a stuck consumer without re-publishing ev-ui, use `workflow_dispatch` on that consumer's `ev-ui-bump.yml`:
```bash
gh workflow run ev-ui-bump.yml \
  --repo EmpoweredVote/<consumer> \
  -f version=0.2.1 \
  -f bump_type=patch
```
