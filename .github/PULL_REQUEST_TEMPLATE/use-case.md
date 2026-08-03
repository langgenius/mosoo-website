<!--
PR template for adding a use-case page yourself.
Prefill it by appending ?expand=1&template=use-case.md to the compare URL.
Only supplying materials? Open a "Use case submission" issue instead.
Reference implementation: the codex-pet files touched in #57.
-->

## Use case

- Name / slug: `<name>` → `/{locale}/use-cases/<slug>`
- Capability shown: <!-- e.g. Agent as API -->
- Repository: <!-- url -->
- Live app: <!-- url -->

## Checklist

### Content

- [ ] `apps/landing/use-cases/<slug>.html` — SEO head (canonical, hreflang, OG image) + crawlable fallback body with repo and live-app links
- [ ] Detail page component in `apps/landing/src/routes/use-cases/` + entry `apps/landing/src/use-case-<slug>-main.tsx`
- [ ] Case registered in `apps/landing/src/routes/use-cases/use-cases-data.ts` (listing card)
- [ ] en/zh/ja strings added to `apps/landing/src/routes/use-cases/i18n.ts` (keep Agent, API, Thread, Run, skill, sandbox untranslated)
- [ ] Assets under `apps/landing/public/landing/use-cases/`: 1440×900 screenshot; optional demo video ≤ 60 s, ≤ 10 MB, encoded with `-movflags +faststart`, embedded as `<video controls preload="none" poster=…>`

### Pipeline

- [ ] Vite input added in `apps/landing/vite.config.ts`
- [ ] SEO copy + locale rendering added in `scripts/landing-locales.mjs`; dist checks in `scripts/build-site.mjs`
- [ ] `apps/landing/public/sitemap-pages.xml` — the three locale URLs added
- [ ] Tests extended in `tests/site-seo.test.mjs` (bare `/use-cases/*` redirects are already covered — touch `tests/worker.test.mjs` only if routing changed)

### Verify

- [ ] `npm run test:seo` green
- [ ] `npm run build` green
- [ ] Rendered locally: `npx --yes --package wrangler@4.115.0 wrangler dev --local-protocol https`, then check `https://localhost:8787/{en,zh,ja}/use-cases/<slug>`
