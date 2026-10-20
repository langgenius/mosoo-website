// The home copy loader. One JSON file per section (./copy/<section>.json), each holding en, zh and ja in the same
// shape; keys that start with "$" ($comment, $temporary, $slots) are notes for writers, not copy, and are never
// read here. Slot budgets live in tests/home-copy-slots.test.mjs. Every visible string on the home comes from these
// files (product names that the main repo spells one way stay as data in the files too); URLs live below.
//
// Types are inferred from each file's en block, so adding a slot is one JSON edit; the Record annotations make the
// compiler check that zh and ja carry every en slot. Erasable TypeScript only, relative imports only: Node imports
// this file at build time (scripts/landing-home.mjs), Vite in the browser.

import accent from "./copy/accent.json" with { type: "json" };
import closing from "./copy/closing.json" with { type: "json" };
import faq from "./copy/faq.json" with { type: "json" };
import footer from "./copy/footer.json" with { type: "json" };
import hero from "./copy/hero.json" with { type: "json" };
import nav from "./copy/nav.json" with { type: "json" };
import stage from "./copy/stage.json" with { type: "json" };

export const HOME_LOCALES = ["en", "zh", "ja"] as const;
export type HomeLocale = (typeof HOME_LOCALES)[number];

export type NavCopy = (typeof nav)["en"];
export type HeroCopy = (typeof hero)["en"];
export type StageCopy = (typeof stage)["en"];
export type AccentCopy = (typeof accent)["en"];
export type FaqCopy = (typeof faq)["en"];
export type ClosingCopy = (typeof closing)["en"];
export type FooterCopy = (typeof footer)["en"];

/** One locale's copy for the whole page; every section's render() receives it. */
export interface HomeCopy {
  readonly nav: NavCopy;
  readonly hero: HeroCopy;
  readonly stage: StageCopy;
  readonly accent: AccentCopy;
  readonly faq: FaqCopy;
  readonly closing: ClosingCopy;
  readonly footer: FooterCopy;
}

const NAV: Record<HomeLocale, NavCopy> = nav;
const HERO: Record<HomeLocale, HeroCopy> = hero;
const STAGE: Record<HomeLocale, StageCopy> = stage;
const ACCENT: Record<HomeLocale, AccentCopy> = accent;
const FAQ: Record<HomeLocale, FaqCopy> = faq;
const CLOSING: Record<HomeLocale, ClosingCopy> = closing;
const FOOTER: Record<HomeLocale, FooterCopy> = footer;

function copyFor(locale: HomeLocale): HomeCopy {
  return {
    nav: NAV[locale],
    hero: HERO[locale],
    stage: STAGE[locale],
    accent: ACCENT[locale],
    faq: FAQ[locale],
    closing: CLOSING[locale],
    footer: FOOTER[locale],
  };
}

export const HOME_COPY: Record<HomeLocale, HomeCopy> = { en: copyFor("en"), zh: copyFor("zh"), ja: copyFor("ja") };

export function isHomeLocale(value: string): value is HomeLocale {
  return (HOME_LOCALES as readonly string[]).includes(value);
}

// ------------------------------------------------------------------------------------------------- links
// Same targets as the v4d home (scripts/landing-home.mjs LINKS / SHELL at 9e92312), which the SEO tests guard.

const GITHUB = "https://github.com/langgenius/mosoo";

export const LINKS = {
  site: "https://mosoo.ai",
  console: "https://cloud.mosoo.ai",
  signIn: "https://cloud.mosoo.ai/login",
  github: GITHUB,
  releases: `${GITHUB}/releases`,
  spec: `${GITHUB}/blob/main/docs/SPEC.md`,
  license: `${GITHUB}/blob/main/LICENSE`,
  llms: "https://mosoo.ai/llms.txt",
} as const;

const DOCS: Record<HomeLocale, string> = {
  en: "https://mosoo.ai/docs/",
  zh: "https://mosoo.ai/docs/zh-Hans/",
  ja: "https://mosoo.ai/docs/ja/",
};

/** Links whose target depends on the locale. */
export function localeLinks(locale: HomeLocale) {
  const docs = DOCS[locale];
  return {
    home: `/${locale}`,
    docs,
    quickstart: `${docs}quickstart/`,
    apiReference: `${docs}api-reference-v2/`,
    useCases: `/${locale}/use-cases`,
    blog: locale === "en" ? "/blog" : `/blog/${locale}`,
    status: locale === "en" ? "/health" : `/${locale}/health`,
  } as const;
}

/** The language list (endonyms, the same in every locale) and each locale's html lang. */
export const LANGUAGES: readonly { locale: HomeLocale; lang: string; label: string }[] = [
  { locale: "en", lang: "en", label: "English" },
  { locale: "zh", lang: "zh-CN", label: "简体中文" },
  { locale: "ja", lang: "ja", label: "日本語" },
];

/**
 * The four harnesses in the order the copy names them (hero.harnesses, stage.kit.harness, footer harness names),
 * keyed by the runtime catalog id (MAIN pkgs/runtime-catalog/src/catalog.ts L426-472).
 */
export const HARNESS_IDS = ["openai-runtime", "claude-agent-sdk", "acp-fallback", "pi"] as const;
export type HarnessId = (typeof HARNESS_IDS)[number];
