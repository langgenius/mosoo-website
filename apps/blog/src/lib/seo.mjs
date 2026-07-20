/**
 * @typedef {"en" | "zh" | "ja"} BlogLocale
 * @typedef {Partial<Record<"en" | "zh-CN" | "ja" | "x-default", string>>} HreflangAlternates
 * @typedef {{
 *   id: string,
 *   data: {
 *     locale: BlogLocale,
 *     permalink?: string,
 *     translationKey?: string,
 *   },
 * }} PostLike
 */

/** @type {Record<BlogLocale, "en" | "zh-CN" | "ja">} */
const hreflangByLocale = {
  en: "en",
  zh: "zh-CN",
  ja: "ja",
};

/**
 * @param {string} value
 */
function trimTrailingSlash(value) {
  return value === "/" ? value : value.replace(/\/$/, "");
}

/**
 * @param {PostLike} post
 */
function postSlug(post) {
  return post.data.permalink ?? post.id.replace(/-(?:en|zh|ja)$/, "");
}

/**
 * @param {PostLike} post
 * @param {string} base
 */
function postHref(post, base) {
  const prefix = post.data.locale === "en" ? base : `${base}/${post.data.locale}`;
  return `${prefix}/${postSlug(post)}`;
}

/**
 * @param {string} base
 * @returns {HreflangAlternates}
 */
export function getIndexHreflangAlternates(base) {
  const cleanBase = trimTrailingSlash(base) || "/";
  const indexBase = cleanBase === "/" ? cleanBase : `${cleanBase}/`;
  return {
    en: indexBase,
    "zh-CN": `${indexBase}zh/`,
    ja: `${indexBase}ja/`,
    "x-default": indexBase,
  };
}

/**
 * Only emit a cluster when a post has at least one translation and an English
 * default. Partial one-way hreflang declarations are more harmful than no
 * declaration because every alternate must point back to the cluster.
 *
 * @param {PostLike} post
 * @param {PostLike[]} posts
 * @param {string} base
 * @returns {HreflangAlternates | undefined}
 */
export function getPostHreflangAlternates(post, posts, base) {
  if (!post.data.translationKey) return undefined;

  const translations = posts.filter(
    (candidate) => candidate.data.translationKey === post.data.translationKey,
  );
  const english = translations.find((candidate) => candidate.data.locale === "en");

  if (!english || translations.length < 2) return undefined;

  /** @type {HreflangAlternates} */
  const alternates = {};
  for (const translation of translations) {
    alternates[hreflangByLocale[translation.data.locale]] = postHref(translation, base);
  }
  alternates["x-default"] = postHref(english, base);
  return alternates;
}
