import type { CollectionEntry } from "astro:content";

import { LOCALES } from "../content.config";

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

const localeLabels: Record<Locale, string> = {
  zh: "中文",
  en: "EN",
  ja: "日本語",
};

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
