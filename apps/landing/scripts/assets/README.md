# Paper home assets: pipelines and provenance

Every file the v4b "Paper" home serves from `apps/landing/public/` that is not hand-written CSS comes from a
deterministic script in this folder or from a named upstream file. Re-running a script writes the same bytes.

| Output | Script / source | Provenance | Size |
|---|---|---|---|
| `public/fonts/HedvigLettersSerif-Regular-latin.woff2` + `HedvigLettersSerif-OFL.txt` | `fonts.mjs <refs/fonts/candidates>` | Hedvig Letters Serif 400, SIL OFL 1.1; display stand-in for ABC Arizona Mix (`--font-display`) | 34,796 B |
| `public/fonts/Inter-Variable-latin.woff2` + `Inter-OFL.txt` | `fonts.mjs` | Inter variable, Latin subset, SIL OFL 1.1 | 73,016 B |
| `public/fonts/FragmentMono-Regular-latin.woff2` + `FragmentMono-OFL.txt` | `fonts.mjs` | Fragment Mono 400, SIL OFL 1.1; the one mono token per object | 15,176 B |
| `public/landing/paper/plate-2400.webp`, `plate-1200.webp` | `plate.mjs [outDir] [seed=23]` | Seeded Perlin noise only (no sampled pixels). Warm stone ramp `#eeeae2 → #cfc8bb` (UI-FORMS U08, oklch C ≤ 0.02) with a dry-brushed coat (b-paper's hand; visual source Harvey hero plate, `refs/harvey/www.harvey.ai-hero.jpg`) | 76,488 B / 9,250 B |
| `public/landing/paper/grain-128.png` | `plate.mjs` | feTurbulence paper grain, 16-colour palette PNG | 8,331 B |
| `public/brand/outline/nested-3.svg`, `portal-mask.svg`, `faq-indicator-{closed,open}.svg`, `src/shared/chrome/outline-geometry.mjs` | `outline.mjs` | Port of `mosoo-website-redesign-staging/brand/outline/src/gen.mjs`: the mosoo block becomes a 1px window, the bar a line; geometry from `public/brand/logo-mark.svg` | < 2 KB each |
| `public/brand/runtime/{claude-agent-sdk,openai-runtime,acp-fallback}.svg` | copied from `node_modules/@lobehub/icons-static-svg@1.90` (`claudecode`, `openai`, `opencode`) | MIT; the runtime marks mosoo's console maps to these runtime ids (MAIN `pkgs/runtime-catalog/src/catalog.ts` L431–L465). Shown desaturated to ink | < 2 KB |
| `public/brand/runtime/pi.svg` | `refs/devices/elements/svg/runtime-pi.src.svg` | Pi mark from MAIN's `@lobehub/icons-static-svg@1.94` (`pi.svg`), not in this site's 1.90 | 279 B |
| `public/brand/runtime/key.svg` | `refs/devices/elements/svg/glyph-KeyRound.src.svg` | Hugeicons KeyRound as used by MAIN's console (elements.md §F) | 1,128 B |

The grain on the plate and the said cards is an inline feTurbulence data URI in `paper.css` (`--pp-grain`, 220px tile,
multiply 16%), so it has no file.

Effects are code, not assets: `apps/landing/src/effects/` (progress tabs, word fill, footer rise). Their frame
proofs live in `mosoo-website-redesign-staging/v4b/proof/fx-*-contact.jpg`.
