// Site-wide entrance-motion variant. Three options, all defined in
// styles/global.css and wired up in BaseLayout:
//
//   "none" · no entrance motion — hover micro-transitions only
//   "fade" · the page fades in once as a unit (opacity, 480ms)
//   "rise" · masthead/featured/cards rise 12px with a short stagger;
//            below-fold cards reveal as they scroll into view
//
// Change MOTION_VARIANT to switch the whole site. Any page can be previewed
// with a different variant via `?motion=none|fade|rise` (preview-only — it
// does not persist across navigation).
export const MOTION_VARIANTS = ["none", "fade", "rise"] as const;
export type MotionVariant = (typeof MOTION_VARIANTS)[number];

export const MOTION_VARIANT: MotionVariant = "rise";
