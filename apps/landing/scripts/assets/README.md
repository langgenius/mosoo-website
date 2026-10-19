# Landing asset pipelines (v4c "Stage")

Every generated asset on the home comes from a script in this folder. Each script is deterministic:
same inputs, same bytes. Run them from the repository root; commit the outputs.

| Script | Inputs (provenance) | Outputs | Notes |
|---|---|---|---|
| `fonts.mjs` | `mosoo-website-redesign-staging/refs/fonts/candidates/` (Google Fonts, SIL OFL 1.1): Hedvig Letters Serif 400, Inter variable (Latin), Fragment Mono 400 | `apps/landing/public/fonts/{hedvig-letters-serif-400,inter-latin-var,fragment-mono-400}.woff2` + `*-OFL.txt` (copyright line from each font's name table + `ofl-1.1.txt`) | Checks glyph coverage for the copy and the 125 KB budget (122,988 B). Hedvig is the display stand-in for ABC Arizona Mix (commercial, not shipped); swap via `--font-display` in `src/shared/styles/fonts-v4.css`. |
| `outline.mjs` | The logo mark `apps/landing/public/brand/logo-mark.svg` (block 51.51 x 40.96, sides concave by 1.47; bar 51.51 x 6.93). Geometry ported unchanged from `mosoo-website-redesign-staging/brand/outline/src/gen.mjs` | `apps/landing/public/brand/outline/{outline-112,portal-mask,session-line,faq-indicator-closed,faq-indicator-open}.svg`, `apps/landing/src/home/outline-geometry.ts` | The bar becomes a 1 px line; nothing is stacked or green (brand/outline README §5.2), so the form never reads as a bamboo node. |
| `social-card.mjs` | README.md L8 (positioning) and L9 (four runtimes); Hedvig and Inter from `public/fonts`; `HERO_WINDOW` / `NAV_MARK` from `src/home/outline-geometry.ts`; the hero tiles' plates and tilts | `apps/landing/public/brand/social-card-20261019.png` (1200 x 630) | `node apps/landing/scripts/assets/social-card.mjs <chrome-binary>` (or `CHROME=`). Renders over the DevTools protocol. Paper ground, 1 px outline window, ink glyphs, 24 px monochrome mark; no photo, no green. Replaces the v3 card at the same path (never deployed). |
| `runtime-glyphs.mjs` | `@lobehub/icons-static-svg` (MIT, a landing dependency) mono files `openai`, `claudecode`, `opencode`; `pi` from the staging copy of lobehub 1.94.0 (`refs/devices/elements/svg/runtime-pi.src.svg`); MAIN `docs/design/assets/sidebar-icons/environments.svg`; Hugeicons Free 4.2.3 (MIT) Key02 / Copy01 via the staging byte copies | `apps/landing/src/home/runtime-glyphs.ts` | Glyphs are drawn inline in `currentColor` (ink): UI-FORMS c.0 desaturates runtime marks on the site. Runtime ids follow MAIN `pkgs/runtime-catalog/src/catalog.ts` icon keys. |

No textures or grain tiles: the c-stage canvas uses no bitmaps (UI-FORMS §f, U04 "c 方向全页不用位图").
The only "material" is CSS: the S2 ripple bands in the hero window and the portal veil
(`src/home/home.css`).
