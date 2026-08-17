export const blogSitemapI18n = {
  defaultLocale: "en",
  locales: {
    en: "en",
    zh: "zh-CN",
    ja: "ja",
  },
};

export const canonicalizeBlogUrl = (url) =>
  url === "https://mosoo.ai/blog/" ? "https://mosoo.ai/blog" : url;

const linkLanguage = (link) => link.hreflang ?? link.lang;

export function serializeBlogSitemapItem(item) {
  item.url = canonicalizeBlogUrl(item.url);
  if (!item.links) return item;

  item.links = item.links.map((link) => ({
    ...link,
    url: canonicalizeBlogUrl(link.url),
  }));

  const hasDefault = item.links.some((link) => linkLanguage(link) === "x-default");
  const english = item.links.find((link) => linkLanguage(link) === "en");
  if (!hasDefault && english) {
    item.links.push({
      hreflang: "x-default",
      url: english.url,
    });
  }

  return item;
}
