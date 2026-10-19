// Site chrome of the v4b "Paper" pages: the nav bar and the footer, as HTML
// strings. One source for both renderers: scripts/landing-home.mjs writes
// them into the static home, and LandingShell (React) injects the same markup
// on every other page. Styles: src/shared/styles/paper.css (.pp-nav, .pp-foot).
//
// Brand rules (UI-FORMS §d): the nav carries the only solid mark, ink, 20px,
// static. The footer carries the one large outline (three nested windows on a
// floor line, 22% / 40% / 100%) with a dot field in the inner window, so it
// has no solid logo. No green anywhere in the chrome.
import { OUTLINE } from "./outline-geometry.mjs";

const LABELS = {
  en: {
    skip: "Skip to content",
    home: "mosoo home",
    primary: "Primary",
    menu: "Menu",
    docs: "Docs",
    blog: "Blog",
    github: "GitHub",
    signIn: "Sign in",
    tryMosoo: "Try mosoo",
    footer: "Footer",
    useCases: "Use cases",
    pricing: "Pricing",
    status: "Status",
    changelog: "Changelog",
    license: "License",
    language: "Language",
  },
  zh: {
    skip: "跳到正文",
    home: "mosoo 首页",
    primary: "主导航",
    menu: "菜单",
    docs: "文档",
    blog: "博客",
    github: "GitHub",
    signIn: "登录",
    tryMosoo: "试用 mosoo",
    footer: "页脚",
    useCases: "用例",
    pricing: "价格",
    status: "状态",
    changelog: "更新日志",
    license: "许可证",
    language: "语言",
  },
  ja: {
    skip: "本文へ移動",
    home: "mosoo ホーム",
    primary: "メイン",
    menu: "メニュー",
    docs: "ドキュメント",
    blog: "ブログ",
    github: "GitHub",
    signIn: "ログイン",
    tryMosoo: "mosoo を試す",
    footer: "フッター",
    useCases: "ユースケース",
    pricing: "料金",
    status: "ステータス",
    changelog: "変更履歴",
    license: "ライセンス",
    language: "言語",
  },
};

const LANGUAGE_NAMES = { en: "English", zh: "简体中文", ja: "日本語" };
const HTML_LANG = { en: "en", zh: "zh-CN", ja: "ja" };
const DOCS_PREFIX = { en: "", zh: "zh-Hans/", ja: "ja/" };

const escape = (value) =>
  String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

/** Links shared by both renderers, for one locale. */
export function chromeLinks(locale) {
  return {
    home: `/${locale}`,
    docs: `https://mosoo.ai/docs/${DOCS_PREFIX[locale]}`,
    blog: locale === "en" ? "https://mosoo.ai/blog" : `https://mosoo.ai/blog/${locale}`,
    github: "https://github.com/langgenius/mosoo",
    signIn: "https://cloud.mosoo.ai/login",
    console: "https://cloud.mosoo.ai",
    useCases: `/${locale}/use-cases`,
    pricing: `/${locale}/pricing`,
    status: locale === "en" ? "/health" : `/${locale}/health`,
    changelog: "https://mosoo.ai/docs/changelog/",
    license: "https://github.com/langgenius/mosoo/blob/main/LICENSE",
  };
}

// The mark (block + bar) and the five letters of apps/landing/public/brand/logo-wordmark-onlight.svg, one ink.
const WORDMARK = `<svg class="pp-logo" viewBox="0 0 162 35" width="93" height="20" aria-hidden="true" fill="currentColor"><path d="M34.8718 0.00797244H0C0.633158 4.01811 1.00183 8.7378 1.00183 13.8003C1.00183 18.8628 0.633158 23.5825 0 27.5847H34.8718C34.2386 23.5745 33.8699 18.8548 33.8699 13.7923C33.8699 8.72983 34.2386 4.01014 34.8718 0V0.00797244Z"/><path d="M34.8718 31.2121H0V34.7041H34.8718V31.2121Z"/><path d="M44.7699 27.5847V6.85633H49.5387V9.0647C50.6928 7.68547 52.48 6.45771 55.2531 6.45771C57.7537 6.45771 59.6211 7.56588 60.7752 9.34373C62.0495 8.00436 64.0292 6.45771 67.243 6.45771C71.5309 6.45771 74.312 9.46332 74.312 13.9199V27.5847H69.5512V15.2992C69.5512 12.732 68.5975 10.8744 66.0569 10.8744C64.0292 10.8744 61.9293 12.453 61.9293 15.4187V27.5847H57.1686V15.2992C57.1686 12.732 56.2149 10.8744 53.6742 10.8744C51.6465 10.8744 49.5467 12.453 49.5467 15.4187V27.5847H44.7699Z"/><path d="M86.6625 27.5847C80.908 27.5847 76.8205 23.3274 76.8205 17.0212C76.8205 10.715 80.908 6.45771 86.6625 6.45771C92.417 6.45771 96.5045 10.715 96.5045 17.0212C96.5045 23.3274 92.417 27.5847 86.6625 27.5847ZM86.6625 23.6782C89.8123 23.6782 91.7999 21.1669 91.7999 17.0212C91.7999 12.8755 89.8123 10.3642 86.6625 10.3642C83.5128 10.3642 81.5251 12.8755 81.5251 17.0212C81.5251 21.1669 83.5128 23.6782 86.6625 23.6782Z"/><path d="M102.507 20.5052C103.718 22.4823 106.05 23.7978 108.422 23.7978C110.41 23.7978 112.237 23.1042 112.237 21.2865C112.237 19.4687 110.522 19.3492 107.292 18.6954C104.062 18.0337 100.368 17.2285 100.368 12.8915C100.368 9.17632 103.638 6.46569 108.342 6.46569C111.925 6.46569 115.114 8.0522 116.589 10.3004L113.439 13.1227C112.269 11.305 110.33 10.2606 108.07 10.2606C106.162 10.2606 104.92 11.1136 104.92 12.4689C104.92 13.9359 106.395 14.2149 108.967 14.7491C112.43 15.4825 116.79 16.216 116.79 20.8639C116.79 24.9618 113.015 27.6006 108.39 27.6006C104.615 27.6006 100.84 26.0938 99.0131 23.3035L102.515 20.5211L102.507 20.5052Z"/><path d="M129.132 27.5847C123.378 27.5847 119.29 23.3274 119.29 17.0212C119.29 10.715 123.378 6.45771 129.132 6.45771C134.887 6.45771 138.974 10.715 138.974 17.0212C138.974 23.3274 134.887 27.5847 129.132 27.5847ZM129.132 23.6782C132.282 23.6782 134.27 21.1669 134.27 17.0212C134.27 12.8755 132.282 10.3642 129.132 10.3642C125.982 10.3642 123.995 12.8755 123.995 17.0212C123.995 21.1669 125.982 23.6782 129.132 23.6782Z"/><path d="M151.325 27.5847C145.57 27.5847 141.483 23.3274 141.483 17.0212C141.483 10.715 145.57 6.45771 151.325 6.45771C157.079 6.45771 161.167 10.715 161.167 17.0212C161.167 23.3274 157.079 27.5847 151.325 27.5847ZM151.325 23.6782C154.474 23.6782 156.462 21.1669 156.462 17.0212C156.462 12.8755 154.474 10.3642 151.325 10.3642C148.175 10.3642 146.187 12.8755 146.187 17.0212C146.187 21.1669 148.175 23.6782 151.325 23.6782Z"/></svg>`;

/** @param {{ locale: "en" | "zh" | "ja" }} options */
export function renderPaperNav({ locale }) {
  const l = LABELS[locale];
  const href = chromeLinks(locale);
  const links = [
    [href.docs, l.docs],
    [href.blog, l.blog],
    [href.github, l.github],
    [href.signIn, l.signIn],
  ]
    .map(([url, label]) => `<a class="pp-nav-link" href="${escape(url)}">${escape(label)}</a>`)
    .join("");
  return `<a class="pp-skip" href="#main">${escape(l.skip)}</a>
<header class="pp-nav">
<a class="pp-nav-home" href="${href.home}" aria-label="${escape(l.home)}">${WORDMARK}</a>
<nav class="pp-nav-links" aria-label="${escape(l.primary)}">${links}<a class="pp-btn pp-btn-ink pp-btn-sm" href="${href.console}">${escape(l.tryMosoo)}</a></nav>
<details class="pp-nav-menu"><summary>${escape(l.menu)}</summary><div class="pp-nav-sheet">${links}</div></details>
<a class="pp-btn pp-btn-ink pp-btn-sm pp-nav-cta" href="${href.console}">${escape(l.tryMosoo)}</a>
</header>`;
}

function nestedOutline() {
  const n = OUTLINE.nested;
  const box = (v, of) => `${((v / of) * 100).toFixed(3)}%`;
  const inner = `left:${box(n.inner.x, n.width)};top:${box(n.inner.y, n.height)};width:${box(n.inner.w, n.width)};height:${box(n.inner.h, n.height)}`;
  const paths = n.layers
    .map((layer) => `<path d="${layer.d}" stroke-opacity="${layer.opacity}" vector-effect="non-scaling-stroke"/>`)
    .join("");
  return `<div class="pp-nest" data-effect="rise" aria-hidden="true">
<div class="pp-nest-dots" data-rise style="${inner}"></div>
<svg viewBox="${n.viewBox}" fill="none" stroke="currentColor" stroke-width="1" preserveAspectRatio="xMidYMid meet">${paths}<path d="${n.base}" vector-effect="non-scaling-stroke"/></svg>
</div>`;
}

/**
 * @param {{ locale: "en" | "zh" | "ja", languageHrefs: Record<"en" | "zh" | "ja", string> }} options
 */
export function renderPaperFooter({ locale, languageHrefs }) {
  const l = LABELS[locale];
  const href = chromeLinks(locale);
  const links = [
    [href.docs, l.docs],
    [href.blog, l.blog],
    [href.useCases, l.useCases],
    // No pricing link while /pricing still describes the v3 plans (self-host, channels) that the home FAQ
    // contradicts (review YC P0-1); the close's fine print says what starting costs.
    [href.status, l.status],
    [href.github, l.github],
    [href.changelog, l.changelog],
    [href.license, l.license],
  ]
    .map(([url, label]) => `<li><a href="${escape(url)}">${escape(label)}</a></li>`)
    .join("");
  const languages = ["en", "zh", "ja"]
    .map((code) =>
      code === locale
        ? `<li><a href="${escape(languageHrefs[code])}" hreflang="${HTML_LANG[code]}" lang="${HTML_LANG[code]}" aria-current="page">${LANGUAGE_NAMES[code]}</a></li>`
        : `<li><a href="${escape(languageHrefs[code])}" hreflang="${HTML_LANG[code]}" lang="${HTML_LANG[code]}">${LANGUAGE_NAMES[code]}</a></li>`,
    )
    .join("");
  return `<footer class="pp-foot">
${nestedOutline()}
<nav class="pp-foot-links" aria-label="${escape(l.footer)}"><ul>${links}</ul></nav>
<div class="pp-foot-base">
<nav class="pp-lang" aria-label="${escape(l.language)}"><ul>${languages}</ul></nav>
<p class="pp-copy">© 2026 LangGenius, Inc.</p>
</div>
</footer>`;
}
