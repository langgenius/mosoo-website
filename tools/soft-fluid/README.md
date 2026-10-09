# Mosoo cover source

This is the repo-local subset of the existing Mosoo **soft + fluid** cover kit,
adapted for **Human time, half revealed**. It contains the material, seeded hand
stroke and SVG helpers used by the earlier covers, plus this cover's scene and
an offline static export. It has no dependency on a personal checkout path.

The nine older covers are retained as registry metadata; their artwork is not
rebuilt here. Their historical authoring scenes have not been migrated. The
builder fails when asked to build an ID without a local scene instead of
pretending those images can be reproduced by this subset.

## Generate

From the repository root, with Node 24 (or the root README's supported version):

```sh
npm ci --prefix tools/soft-fluid
npm run build --prefix tools/soft-fluid
```

The independent package manifest and lockfile keep image tooling out of the site
runtime dependencies. To target another checkout explicitly:

```sh
node tools/soft-fluid/src/site-covers/integrate.mjs --only=human-time-beyond-expectations --site=/path/to/mosoo-website
```

`--site` is resolved from this kit directory. The default is the repository root.
An explicit `--only` selection is required; the npm command supplies the new ID.

## Authoring and outputs

- `src/site-covers/human-time-beyond-expectations.mjs`: one scene for live and
  static geometry, with only `Human time`, `Seen` and `Unseen` as labels.
- `tokens/tokens.json`: inherited paper, grain, colour and type tokens; brand
  lime remains `#84DE02`.
- `manifests/site-covers.json`: complete registry metadata, and `locales: ["zh"]`
  for this article. A locale here controls frontmatter updates, not translation.
- `apps/blog/src/covers/timelines/human-time-beyond-expectations.ts`: authored
  Motion timeline in the site's existing timeline directory.

The generator writes only this scene's `cover-material.webp`, `cover.jpg`, live
SVG and motion metadata. It regenerates the full cover registry and timeline
index from the manifest, preserving the earlier nine entries. It changes only
`heroImage`, `heroAlt` and `heroCover` in the declared locale's frontmatter.
Article text, date, publication state, body Excalidraw and screenshots stay as-is.

`cover.jpg` is a 1600 × 900 static OG/feed export from the same scene, rendered
with Sharp. Its hand lettering is outlined from the pinned OFL Shantell Sans
font, so rasterisation does not rely on system fonts or a browser screenshot.
The three labels are ASCII; the outline adapter uses original glyph metrics and
kern pairs because opentype.js does not support this font's contextual `ccmp`
table. Live SVG uses the site's existing self-hosted Shantell Sans font.
The builder rejects non-finite path coordinates. Intermediate SVGs in `exports/`
are ignored by Git and are useful for inspecting the render.

## Playback contract

The existing `CoverVisual`, `CoverControls` and shared Motion runtime supply all
interaction. There is no separate player or autoplay. At rest, including without
JavaScript, the ruler is half revealed. On hover or manual play, the curtain's
leading edge moves right by 235 scene units and stops in that same final pose.
An oversized curtain inside a fixed right-hand clip keeps the far end covered
throughout; moving the cloth never exposes the ruler at the right edge.

The timeline uses only `x` and `opacity`. The shared reduced-motion path removes
the positional segment and leaves a brief label fade for explicit playback;
hover is disabled. Keyboard, touch, pause/resume, re-entry and page visibility
follow the shared runtime.

## Verify

Run the generator, visually inspect `cover.jpg`, then run the repository's
`npm run validate`. Inspect the real Chinese article and blog list with browser
tools: static pose, hover/leave/re-entry, keyboard/touch, reduced motion and OG.
Compare the MDX body before and after and confirm no older cover assets changed.
The intent and actual reference-access record are in
[`references/human-time.md`](references/human-time.md).
