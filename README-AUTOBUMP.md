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
4. Add `DISPATCH_TOKEN` secret to the new repo (same PAT as other consumers)
5. Settings → General → enable "Allow auto-merge"
6. Settings → Branches → require `build` status check on `main`
7. Add the new repo to the `matrix.consumer` list in `ev-ui/.github/workflows/publish.yml`
8. Update this file's "Current consumers" list

## Required secrets

- **ev-ui repo:** `NPM_TOKEN` (npm automation token), `DISPATCH_TOKEN` (fine-grained GitHub PAT)
- **Consumer repos:** `DISPATCH_TOKEN` only

The `DISPATCH_TOKEN` is a fine-grained Personal Access Token with access to ev-ui and all consumer repos. Required permissions: **Contents: Read/Write**, **Pull requests: Read/Write**, **Actions: Read/Write**, **Metadata: Read**. Use the same token across all repos to simplify rotation.

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
