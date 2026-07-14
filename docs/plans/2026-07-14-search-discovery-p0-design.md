# Search discovery P0

## Problem

`/robots.txt` falls through to the landing page and `/sitemap.xml` is routed to
the missing `/docs/sitemap.xml`. Crawlers therefore cannot reliably discover
the site's existing sitemap endpoints.

## Decision

- Serve `robots.txt` and `sitemap.xml` as landing static assets.
- Advertise both the root sitemap and Astro's existing blog sitemap in
  `robots.txt`.
- Keep the root sitemap limited to stable, indexable entry points: `/` and
  `/docs/`.
- Remove `/sitemap.xml` from both production and local legacy-docs routing.

Generating a complete docs sitemap is intentionally deferred until the docs
export provides canonical page metadata.

## Implementation and verification

1. Add the two static assets and remove the two stale routing conditions.
2. Build the unified site and check the generated files.
3. Run the local Worker and verify both endpoints return `200`, the expected
   content type, and no redirect.
