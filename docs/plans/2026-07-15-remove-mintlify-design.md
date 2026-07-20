# Remove Mintlify From mosoo Website

## Decision

`mosoo-website` owns the landing page and blog. The independent `mosoo-docs`
Fumadocs Worker owns `mosoo.ai/docs` and `mosoo.ai/docs/*`.

## Website changes

- Build and deploy only the landing and blog static assets.
- Remove Mintlify CLI calls from package scripts and local development tooling.
- Remove the Mintlify deployment API call from the OpenAPI sync workflow.
- Keep legacy documentation redirects in the website Worker; Cloudflare's more
  specific Fumadocs routes handle production `/docs` requests first.
- Leave the old documentation source files in place for a separate ownership
  cleanup; this change only removes them from the website build and deploy path.

## Verification and release

1. Install from `package-lock.json` and build the website.
2. Confirm `dist/index.html` and `dist/blog/index.html` exist and `dist/docs`
   does not.
3. Run a Wrangler production dry-run.
4. Open a non-draft PR, merge it, and deploy the merged `main` commit.
5. Smoke test `/`, `/blog/`, and the Fumadocs-owned `/docs/` routes.
