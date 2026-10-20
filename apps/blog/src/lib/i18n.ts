import type { CollectionEntry } from "astro:content";

import { LOCALES } from "../content.config";

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

// The current language on the header's switch: each language names itself, as on the home's bar
// (apps/landing/src/home/copy/nav.json langShort).
const localeLabels: Record<Locale, string> = {
  zh: "中文",
  en: "EN",
  ja: "日本語",
};

/** The languages in the switch's list and the phone menu's segments, as the home lists them (English, 简体中文, 日本語). */
export const localeNames: Record<Locale, string> = {
  en: "English",
  zh: "简体中文",
  ja: "日本語",
};

// The header's Products panel, language switch and phone menu (owner 2026-10-20 17:15: 「多语言切换不明显，原先product
// 入口没了」; staging v5/polish/nav/DESIGN.md), worded as the home's bar (apps/landing/src/home/copy/nav.json): the
// two products in lowercase (owner 2026-10-20 21:57: 「mosoo computer 一律小写」), production's lines and labels
// (origin/main apps/landing/src/shared/i18n.ts L4-L8 / L32-L36) except the mosoo line, which is MAIN README L8 in
// the home title's short form; "New" untranslated, as production's chip. languageButton names the switch with the
// short name it shows in place of {lang} (WCAG 2.5.3).
export const navCopyByLocale = {
  en: {
    home: "mosoo home",
    label: "Primary site links",
    products: "Products",
    new: "New",
    mosoo: { name: "mosoo", line: "Open-source Agent runtime for application backends." },
    computer: { name: "mosoo computer", line: "A persistent cloud computer for agents." },
    language: "Language",
    languageButton: "Language ({lang})",
    menu: "Menu",
  },
  zh: {
    home: "mosoo 首页",
    label: "主要站点链接",
    products: "产品",
    new: "New",
    mosoo: { name: "mosoo", line: "面向应用后端的开源 Agent runtime。" },
    computer: { name: "mosoo computer", line: "为 Agent 准备的持久云端计算机。" },
    language: "语言",
    languageButton: "语言（{lang}）",
    menu: "菜单",
  },
  ja: {
    home: "mosoo ホーム",
    label: "主要なサイトリンク",
    products: "プロダクト",
    new: "New",
    mosoo: { name: "mosoo", line: "アプリのバックエンド向けオープンソース Agent runtime。" },
    computer: { name: "mosoo computer", line: "Agent のための永続的なクラウドコンピューター。" },
    language: "言語",
    languageButton: "言語（{lang}）",
    menu: "メニュー",
  },
} as const satisfies Record<Locale, unknown>;

const localeIdSuffix = new RegExp(`-(${LOCALES.join("|")})$`);

export const getPostLocale = (post: CollectionEntry<"blog">): Locale => post.data.locale;

const getPostSlug = (post: CollectionEntry<"blog">): string =>
  post.data.permalink ?? post.id.replace(localeIdSuffix, "");

export const getPostPath = (post: CollectionEntry<"blog">): string => {
  const slug = getPostSlug(post);
  return getPostLocale(post) === DEFAULT_LOCALE ? slug : `${getPostLocale(post)}/${slug}`;
};

export const getPostHref = (post: CollectionEntry<"blog">, base: string): string =>
  `${base}/${getPostPath(post)}`;

export const getIndexHref = (locale: Locale, base: string): string =>
  locale === DEFAULT_LOCALE ? `${base || "/"}` : `${base}/${locale}`;

export interface LocaleOption {
  locale: Locale;
  href: string;
  label: string;
  active: boolean;
}

// Maps the current pathname onto every locale, preserving the rest of the
// path. Localized posts share a permalink, so `/blog/zh/<slug>` swaps to
// `/blog/ja/<slug>` — and to `/blog/<slug>` for the default locale.
export const getLocaleOptions = (pathname: string, base: string): LocaleOption[] => {
  const normalizedBase = base.replace(/\/$/, "");
  const rawPath = pathname.replace(/\/$/, "") || normalizedBase || "/";
  const withoutBase =
    normalizedBase && rawPath.startsWith(normalizedBase)
      ? rawPath.slice(normalizedBase.length) || "/"
      : rawPath;
  const current =
    LOCALES.find(
      (locale) =>
        locale !== DEFAULT_LOCALE &&
        (withoutBase === `/${locale}` || withoutBase.startsWith(`/${locale}/`)),
    ) ?? DEFAULT_LOCALE;
  const rest =
    current === DEFAULT_LOCALE
      ? withoutBase
      : withoutBase.replace(new RegExp(`^/${current}(?=/|$)`), "") || "/";
  const ordered = [DEFAULT_LOCALE, ...LOCALES.filter((locale) => locale !== DEFAULT_LOCALE)];

  return ordered.map((locale) => {
    const targetWithoutBase =
      locale === DEFAULT_LOCALE ? rest : `/${locale}${rest === "/" ? "" : rest}`;
    const href =
      `${normalizedBase}${targetWithoutBase}`.replace(/\/$/, "") || normalizedBase || "/";
    return { locale, href, label: localeLabels[locale], active: locale === current };
  });
};
