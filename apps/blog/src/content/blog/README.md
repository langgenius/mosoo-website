# Blog posts

Each `.mdx` file in this directory becomes a post at `mosoo.ai/blog/<slug>`,
where `<slug>` is the filename without extension.

## Frontmatter schema

Validated by `src/content.config.ts`.

```yaml
---
title: "Post title"
description: "One- or two-sentence dek shown on the index card and metadata."
date: 2026-05-28
category: "Engineering" # Engineering | Product | Research | Built on mosoo
author: "mosoo team" # optional, defaults to "mosoo team"
locale: "en" # en | zh | ja, defaults to en
permalink: "post-title" # optional shared slug for localized posts
translationKey: "post-title" # optional key linking localized versions
titleAccent: "If" # optional colored substring in the title
cardTitle: "Short card title." # optional, index card only; see Index card below
descriptionEmphasis: "a phrase from the description" # optional, index card only
featured: false # at most one true — wins the hero slot on the index
draft: false # true keeps the post out of the build
heroImage: "/blog/blog/<slug>/hero.jpg" # optional, see Images below
heroAlt: "..." # optional alt for heroImage
---
```

## Index card

The index shows each post as a white card (`src/components/Card.astro`,
`src/styles/index-cards.css`): the cover cut to 11:8, a serif title, the
description in full, then category · date.

- `cardTitle` replaces `title` on the card only (the article, feeds and
  metadata keep `title`). It is one line when it stays within about
  **24 Latin characters or 10 CJK characters**: measured with Hedvig Letters
  Serif 26px, that is one line at 1280 and wider, in the two-column layout
  and on phones; the 1200–1279 band fits about 22. Without it the full
  title wraps to two or three lines, and the cards in a row still start their
  descriptions on one line. A Chinese card title breaks only at spaces and
  punctuation, so give it a comma or a space where the line may turn; without
  one, a title wider than the slot runs past it instead of wrapping.
- Write `cardTitle` as one short sentence-case line that names the post's
  idea, in the post's own words where they fit, ending with a full stop or a
  question mark: `State is not a process.`, `How much human time?`.
- `descriptionEmphasis` is a phrase copied exactly from `description` (two to
  four words) that the card sets in bold; it darkens with the card on hover.
  The build fails if it is not found in `description`.
- The 11:8 window is centred on the cover unless `src/covers/card-focus.ts`
  moves it; check a new live cover there before publishing.

## Images

**Where to put them.** Drop assets under `apps/blog/public/blog/<slug>/`.
Cloudflare Workers Assets serves `public/` at the worker root and the worker
itself is mounted at `mosoo.ai/blog`, so a file at
`apps/blog/public/blog/the-journey-begins-with-an-imagine-if/hero.jpg` is served from
`https://mosoo.ai/blog/blog/the-journey-begins-with-an-imagine-if/hero.jpg`.

**How to reference them.** Use root-absolute URLs in frontmatter and MDX —
they survive base-path changes. Example:

```yaml
heroImage: "/blog/blog/the-journey-begins-with-an-imagine-if/hero.jpg"
heroAlt: "A grey scale named Agent Work, with a slit of lime light at the threshold"
```

In the post body, use standard markdown:

```md
![A grey scale named Agent Work, with a slit of lime light at the threshold](/blog/blog/the-journey-begins-with-an-imagine-if/figure.jpg)
```

Add a caption by wrapping in a `<figure>`:

```mdx
<figure>
  ![Alt text](/blog/blog/the-journey-begins-with-an-imagine-if/figure.jpg)
  <figcaption>Below the threshold, a one-off; above it, a lifecycle.</figcaption>
</figure>
```

**Format.** Prefer WebP or AVIF for new photography. JPEG works fine for hero
images that were exported elsewhere. Compress before committing — anything
over ~500 KB should be downsized.

**Fallback.** A post without `heroImage` uses the deterministic
`gradient-from-slug` painterly card. Every post has a visual no matter what.

## Writing tips

- Sentence case in titles and headings. Use the brand casing the post needs,
  including `mosoo` when it is a product name in prose.
- `description` shows up in the OG card, the index dek, and the search
  snippet. Make it stand alone.
- The first paragraph is the lede — write it like a magazine opener.
- Type is the site's v5 set: Hedvig Letters Serif for titles and headings,
  Hanken Grotesk for text, Fragment Mono for code. Code samples render on the carbon
  dark surface; keep them under ~80 chars per line so they don't scroll on
  mobile.
- Block-quotes set in the serif and bend left of the column — use sparingly,
  for a real quote or a thesis line.
