# Mosoo Website

Landing page and blog source for Mosoo.

- Live docs: [mosoo.ai/docs](https://mosoo.ai/docs)
- Mosoo repository: [langgenius/mosoo](https://github.com/langgenius/mosoo)

## About

This repository builds and deploys the Mosoo landing page and blog. The
independent [langgenius/mosoo-docs](https://github.com/langgenius/mosoo-docs)
Fumadocs Worker owns `https://mosoo.ai/docs`.

## Local Development

Use Node 24 or another supported Node version (`>=20`).

Install dependencies:

```bash
npm install
```

Run the landing page or blog locally:

```bash
npm run landing:dev
npm run blog:dev
```

Build the landing and blog apps:

```bash
npm run site:build
```

Deploy the production Worker:

```bash
npm run deploy
```

The production Worker serves `/` and `/blog`. The more specific `/docs` and
`/docs/*` routes are served by the Fumadocs Worker. `/login` redirects to
`https://try.mosoo.ai/login`.

## Project Structure

- `apps/landing/` contains the copied Mosoo landing page source from `langgenius/mosoo`.
- `apps/blog/` contains the copied Mosoo Astro blog source from `langgenius/mosoo`.
- `pkgs/design-tokens/` contains the copied design tokens used by the blog.
- `*.mdx`, `zh-Hans/`, and the generated OpenAPI snapshots are legacy docs
  sources retained for a separate ownership cleanup; they are not deployed by
  this Worker.
- `mosoo-openapi.en.generated.json` is the English OpenAPI snapshot used by the English API Reference.
- `mosoo-openapi.zh-Hans.generated.json` is the Simplified Chinese OpenAPI snapshot used by the Chinese API Reference.
- `mosoo-openapi.generated.json` is a compatibility copy of the English snapshot.
- `llms.txt` is the standard LLM discovery entry point for the docs site.
- `coding-agents.md` is the coding-agent-oriented Markdown guide. Its OpenAPI contract section is regenerated from the English OpenAPI snapshot.
- `scripts/sync-openapi-specs.mjs` regenerates and validates the localized OpenAPI snapshots from the Mosoo source repo.
- `scripts/openapi.zh-Hans.translations.json` stores the Simplified Chinese translations keyed by the English source text.
- `images/` contains brand and documentation assets.

## OpenAPI Sync

Mosoo is the source of truth. By default, the sync script fetches `https://github.com/langgenius/mosoo.git` into a temporary directory and generates from that online Git source.

```bash
npm run openapi:sync
```

Check whether generated snapshots are stale:

```bash
npm run openapi:check
```

Generate from a specific online branch, tag, or SHA:

```bash
MOSOO_REPO_REF=<branch-or-sha> npm run openapi:sync
```

The sync script:

- fetches the Mosoo source from GitHub unless `MOSOO_REPO_DIR` is explicitly set for a local debugging override;
- imports Mosoo's public OpenAPI document factory from the source repo;
- normalizes public-facing token wording to `API token`;
- generates English and Simplified Chinese OpenAPI snapshots;
- regenerates `llms.txt` as the LLM discovery entry point;
- regenerates the generated OpenAPI contract block in `coding-agents.md`;
- in `sync` mode, records newly missing Simplified Chinese translation keys and uses the English source text as a non-blocking fallback until the translation is filled in;
- in `check` mode, fails if any visible `title`, `summary`, `description`, or `bearerFormat` string lacks a completed Chinese translation;
- verifies the Chinese snapshot has the same non-text structure as the English snapshot.

Optional source controls:

- `MOSOO_REPO_REF`: online branch, tag, or SHA to fetch. Defaults to `main`.
- `MOSOO_REPO_URL`: source repository URL. Defaults to `https://github.com/langgenius/mosoo.git`.
- `MOSOO_REPO_TOKEN`: token for private repository or private submodule access.
- `MOSOO_REPO_DIR`: explicit local checkout override for debugging only.

The legacy sync workflow `.github/workflows/sync-openapi.yml` can run manually,
nightly, or from a Mosoo `repository_dispatch` event named
`mosoo-openapi-changed`. It updates the retained snapshots but does not deploy
the Fumadocs site.

Secrets used by the sync workflow:

- `MOSOO_REPO_TOKEN`: optional token for checking out a private Mosoo source repo.

The Mosoo source repo should include `.github/workflows/docs-openapi-dispatch.yml` and configure `MOSOO_DOCS_DISPATCH_TOKEN` with permission to dispatch workflows in `langgenius/mosoo-website`. That workflow listens to OpenAPI source paths and sends the current Mosoo SHA to this repo.
