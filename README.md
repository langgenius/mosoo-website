# Mosoo Website

Landing page and blog source for [Mosoo](https://mosoo.ai), the open-source agent runtime for coding agents.

- **Live site:** [mosoo.ai](https://mosoo.ai)
- **Live docs:** [mosoo.ai/docs](https://mosoo.ai/docs)
- **Mosoo source:** [langgenius/mosoo](https://github.com/langgenius/mosoo)

## About

This repository builds and deploys only the Mosoo landing page and blog. The
independent [`langgenius/mosoo-docs`](https://github.com/langgenius/mosoo-docs)
Fumadocs Worker owns `mosoo.ai/docs` and `mosoo.ai/docs/*`.

The [`langgenius/mosoo`](https://github.com/langgenius/mosoo) repository remains
the source of truth for product behavior and API contracts.

Production currently uses this topology:

- `mosoo-website-prod` serves `/`, `/blog`, and other non-docs routes.
- `mosoo-docs` serves `/docs` and `/docs/*` through more specific Cloudflare
  Worker routes.
- Legacy unprefixed documentation URLs are redirected to their `/docs`
  equivalents by the website Worker.

## Project Structure

- `apps/landing` contains the React/Vite landing page.
- `apps/blog` contains the Astro/MDX blog.
- `pkgs/design-tokens` contains the shared Mosoo CSS design tokens used by the
  blog.
- `scripts/build-site.mjs` assembles the landing and blog outputs into one
  deployable directory.
- `src/worker.js` serves the combined static assets and handles redirects and
  route-specific fallback behavior.
- `wrangler.toml` configures the production Cloudflare Worker.

## Development

Use Node 24 or another supported Node.js version (`>=20`).

Install dependencies:

```bash
npm install
```

Run the landing and blog development servers together:

```bash
npm run dev
```

Run an individual app when needed:

```bash
npm run landing:dev
npm run blog:dev
```

Build the complete site:

```bash
npm run build
```

Validate the production build:

```bash
npm run validate
```

Preview the landing or blog app independently:

```bash
npm run landing:preview
npm run blog:preview
```

## Production Build

`npm run build` runs both app builds and assembles the final output under
`dist/`:

```text
dist/
  index.html
  assets/
  blog/
    index.html
    ...
```

The Cloudflare Worker uses strict 404 handling for `/blog/*` and SPA fallback
behavior for landing-page routes.

## Deployment

Preview the Worker locally:

```bash
npm run dev:worker
```

Deploy the production Worker:

```bash
npm run deploy
```
