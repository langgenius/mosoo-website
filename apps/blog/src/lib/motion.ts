// Site-wide entrance-motion variant. Three options, all defined in
// styles/global.css and wired up in BaseLayout:
//
//   "none" · no entrance motion — hover micro-transitions only
//   "fade" · the page fades in once as a unit (opacity, 480ms)
//   "rise" · the article header and hero rise 12px with a short stagger
//
// The index cards are not part of this switch: they enter with the landing's
// v5 rise engine (data-rise="card", see components/BlogIndex.astro).
//
// Change MOTION_VARIANT to switch the whole site. Any page can be previewed
// with a different variant via `?motion=none|fade|rise` (preview-only — it
// does not persist across navigation).
export const MOTION_VARIANTS = ["none", "fade", "rise"] as const;
export type MotionVariant = (typeof MOTION_VARIANTS)[number];

export const MOTION_VARIANT: MotionVariant = "rise";
