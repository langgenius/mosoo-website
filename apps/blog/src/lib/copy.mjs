export const dateLocaleByLocale = {
  en: "en-US",
  zh: "zh-CN",
  ja: "ja-JP",
};

export const categoryLabelsByLocale = {
  en: {
    Engineering: "Engineering",
    Product: "Product",
    Research: "Research",
    "Customer Stories": "Customer Stories",
  },
  zh: {
    Engineering: "工程",
    Product: "产品",
    Research: "研究",
    "Customer Stories": "客户故事",
  },
  ja: {
    Engineering: "エンジニアリング",
    Product: "プロダクト",
    Research: "リサーチ",
    "Customer Stories": "導入事例",
  },
};

export const headerCopyByLocale = {
  en: {
    blog: "Blog",
    backToMosoo: "Back to mosoo",
    languageLabel: "Blog language",
    learnMore: "Learn More",
    rssTitle: "Subscribe via RSS",
  },
  zh: {
    blog: "博客",
    backToMosoo: "返回 mosoo",
    languageLabel: "博客语言",
    learnMore: "了解更多",
    rssTitle: "订阅 RSS",
  },
  ja: {
    blog: "ブログ",
    backToMosoo: "mosoo に戻る",
    languageLabel: "ブログ言語",
    learnMore: "詳しく見る",
    rssTitle: "RSS を購読",
  },
};

export const indexCopyByLocale = {
  en: {
    title: "Notes from the bamboo grove.",
    description: "Letters for builders moving Agents from local experiments into production systems.",
    all: "All",
    allPosts: "All posts",
    post: "post",
    posts: "posts",
    empty: "No posts yet - check back soon.",
  },
  zh: {
    title: "竹林手记。",
    description: "写给正在把 Agent 从本地实验带进生产系统的人。",
    all: "全部",
    allPosts: "全部文章",
    post: "篇",
    posts: "篇",
    empty: "暂无文章。",
  },
  ja: {
    title: "竹林からのノート。",
    description: "Agent をローカルの実験からプロダクションシステムへ運ぼうとしている人に向けた手紙。",
    all: "すべて",
    allPosts: "すべての記事",
    post: "記事",
    posts: "記事",
    empty: "記事はまだありません。",
  },
};

export const postCopyByLocale = {
  en: {
    back: "← All posts",
    more: "← More posts",
    by: "By",
    learnMore: "Learn More →",
  },
  zh: {
    back: "← 返回全部文章",
    more: "← 更多文章",
    by: "作者",
    learnMore: "了解更多 →",
  },
  ja: {
    back: "← 記事一覧に戻る",
    more: "← ほかの記事",
    by: "著者",
    learnMore: "詳しく見る →",
  },
};

export const footerCopyByLocale = {
  en: "© 2026 mosoo - take root, and grow a bamboo sea.",
  zh: "© 2026 mosoo - 扎根，长成竹海。",
  ja: "© 2026 mosoo - 根を張り、竹の海へ育つ。",
};

export function localeFromLang(lang) {
  if (lang === "zh-CN") return "zh";
  if (lang === "ja") return "ja";
  return "en";
}

export function categoryLabel(locale, category) {
  return categoryLabelsByLocale[locale]?.[category] ?? category;
}
