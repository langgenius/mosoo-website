import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

// Categories shown as tab pills on the index. Add new ones here and they show
// up automatically — frontmatter is validated against this list.
export const CATEGORIES = ["Engineering", "Product", "Research", "Customer Stories"] as const;
export const LOCALES = ["zh", "en", "ja"] as const;

const blog = defineCollection({
  loader: glob({
    pattern: ["**/*.{md,mdx}", "!README.md"],
    base: "./src/content/blog",
  }),
  schema: z.object({
    title: z.string(),
    titleAccent: z.string().optional(),
    // Optional short title for the index card: one serif line within about 24
    // Latin or 10 CJK characters (measured; see src/content/blog/README.md).
    // Falls back to `title`, which may wrap to two or three lines. The article
    // page, feeds and metadata always use `title`.
    cardTitle: z.string().optional(),
    description: z.string(),
    // Optional phrase, copied exactly from `description`, that the index card
    // sets in bold (Intent's one emphasised phrase). Without it the card shows
    // `description` plain.
    descriptionEmphasis: z.string().optional(),
    date: z.coerce.date(),
    category: z.enum(CATEGORIES),
    author: z.string().default("mosoo team"),
    // Optional byline avatar, root-absolute like heroImage. Convention:
    // store shared author portraits under `public/blog/authors/<name>.<ext>`
    // so they ship at `/blog/blog/authors/<name>.<ext>`. Falls back to the
    // mosoo favicon when unset.
    authorAvatar: z.string().optional(),
    // Optional co-authors shown after the primary author in the byline.
    // Avatars follow the same `public/blog/authors/<name>.<ext>` convention
    // as `authorAvatar` and fall back to the mosoo favicon when unset.
    coAuthors: z
      .array(
        z.object({
          name: z.string(),
          avatar: z.string().optional(),
        }),
      )
      .default([]),
    locale: z.enum(LOCALES).default("en"),
    permalink: z.string().optional(),
    translationKey: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    // Custom hero image, optional. When set, the card and the article hero
    // render this image instead of the deterministic gradient. Convention:
    // store assets under `public/blog/<slug>/hero.<ext>` so they ship from
    // the blog worker at `/blog/blog/<slug>/hero.<ext>`. The path goes here
    // as a root-absolute URL — e.g.
    // "/blog/blog/the-journey-begins-with-an-imagine-if/hero.jpg".
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    // Optional live cover id (see `src/covers/registry.ts`). When set, the card
    // and the article hero render the animated inline-SVG cover instead of the
    // <img>. `heroImage` must still point at the static raster of the same
    // cover: it remains the Open Graph image, the JSON-LD image and the
    // fallback for feeds and crawlers.
    heroCover: z.string().optional(),
  }).refine((data) => !data.descriptionEmphasis || data.description.includes(data.descriptionEmphasis), {
    message: "descriptionEmphasis must be copied exactly from description",
    path: ["descriptionEmphasis"],
  }),
});

export const collections = { blog };
