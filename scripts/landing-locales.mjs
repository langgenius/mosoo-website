import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const EN = {
  lang: "en",
  title: "mosoo — Open-Source Agent Runtime for Coding Agents",
  description:
    "Run OpenAI Codex, Claude Agent SDK, and OpenCode behind one Agent API in isolated sandboxes. Open source, self-hostable, and built for coding agents.",
  socialDescription:
    "Run OpenAI Codex, Claude Agent SDK, and OpenCode behind one Agent API in isolated sandboxes.",
  imageAlt: "mosoo open-source agent runtime",
  structuredDescription:
    "Open-source agent runtime and API for running coding agents in isolated sandboxes.",
  subcategory: "AI agent runtime",
};

const SEO = {
  en: EN,
  zh: {
    lang: "zh-CN",
    title: "mosoo — 面向 Coding Agent 的开源 Agent runtime",
    description:
      "通过统一的 Agent API，在隔离 sandbox 中运行 OpenAI Codex、Claude Agent SDK 和 OpenCode。开源、可自行托管，专为 Coding Agent 构建。",
    socialDescription:
      "通过统一的 Agent API，在隔离 sandbox 中运行 OpenAI Codex、Claude Agent SDK 和 OpenCode。",
    imageAlt: "mosoo 开源 Agent runtime",
    structuredDescription: "用于在隔离 sandbox 中运行 Coding Agent 的开源 Agent runtime 与 API。",
    subcategory: "AI Agent runtime",
  },
  ja: {
    lang: "ja",
    title: "mosoo — Coding Agent 向けオープンソース Agent runtime",
    description:
      "OpenAI Codex、Claude Agent SDK、OpenCode を、隔離された sandbox 上で 1 つの Agent API 経由で実行。オープンソースでセルフホスト可能、Coding Agent のために設計されています。",
    socialDescription:
      "OpenAI Codex、Claude Agent SDK、OpenCode を、隔離された sandbox 上で 1 つの Agent API 経由で実行。",
    imageAlt: "mosoo オープンソース Agent runtime",
    structuredDescription:
      "隔離された sandbox で Coding Agent を実行するための、オープンソース Agent runtime と API。",
    subcategory: "AI Agent runtime",
  },
};

function replaceRequired(html, search, replacement) {
  if (!html.includes(search)) {
    throw new Error(`Landing locale build could not find: ${search}`);
  }
  return html.replaceAll(search, replacement);
}

function localizeHtml(source, locale, copy) {
  const url = `https://mosoo.ai/${locale}`;
  const replacements = [
    [`<html lang="${EN.lang}">`, `<html lang="${copy.lang}">`],
    [EN.title, copy.title],
    [EN.description, copy.description],
    [EN.socialDescription, copy.socialDescription],
    [EN.imageAlt, copy.imageAlt],
    [EN.structuredDescription, copy.structuredDescription],
    [EN.subcategory, copy.subcategory],
    ['<link rel="canonical" href="https://mosoo.ai/en" />', `<link rel="canonical" href="${url}" />`],
    ['<meta property="og:url" content="https://mosoo.ai/en" />', `<meta property="og:url" content="${url}" />`],
    ['"url": "https://mosoo.ai/en"', `"url": "${url}"`],
    ['"inLanguage": "en"', `"inLanguage": "${copy.lang}"`],
  ];

  return replacements.reduce(
    (html, [search, replacement]) =>
      search === replacement ? html : replaceRequired(html, search, replacement),
    source,
  );
}

export function renderLandingLocale(source, locale) {
  const copy = SEO[locale];
  if (!copy) throw new Error(`Unsupported landing locale: ${locale}`);
  return localizeHtml(source, locale, copy);
}

export async function buildLandingLocales(landingDist) {
  const source = await readFile(join(landingDist, "index.html"), "utf8");

  await Promise.all(
    Object.keys(SEO).map((locale) =>
      writeFile(join(landingDist, `${locale}.html`), renderLandingLocale(source, locale)),
    ),
  );
}
