import { mkdir, readFile, writeFile } from "node:fs/promises";
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

const FALLBACK_LABELS = {
  en: {
    pricing: "Pricing",
    status: "Status",
    docs: "Docs",
    quickstart: "Quickstart",
    blog: "Blog",
    login: "Log in",
  },
  zh: {
    pricing: "定价",
    status: "状态",
    docs: "文档",
    quickstart: "快速开始",
    blog: "博客",
    login: "登录",
  },
  ja: {
    pricing: "料金",
    status: "稼働状況",
    docs: "ドキュメント",
    quickstart: "クイックスタート",
    blog: "ブログ",
    login: "ログイン",
  },
};

const PRICING_EN = {
  lang: "en",
  title: "mosoo — Pricing",
  description:
    "Start free on mosoo Cloud: run coding agents in isolated sandboxes with BYOK keys. Paid plans with more sandbox hours and concurrency are coming soon.",
  socialDescription:
    "Start free on mosoo Cloud: run coding agents in isolated sandboxes with BYOK keys.",
  imageAlt: "mosoo pricing",
};

const PRICING_SEO = {
  en: PRICING_EN,
  zh: {
    lang: "zh-CN",
    title: "mosoo — 定价",
    description:
      "在 mosoo Cloud 免费起步：以 BYOK 密钥在隔离 sandbox 中运行 Coding Agent。含更多 sandbox 时长与并发的付费方案即将上线。",
    socialDescription: "在 mosoo Cloud 免费起步：以 BYOK 密钥在隔离 sandbox 中运行 Coding Agent。",
    imageAlt: "mosoo 定价",
  },
  ja: {
    lang: "ja",
    title: "mosoo — 料金",
    description:
      "mosoo Cloud で無料で開始：BYOK キーを使い、隔離された sandbox で Coding Agent を実行。sandbox 時間と同時実行数を拡張する有料プランは近日公開。",
    socialDescription:
      "mosoo Cloud で無料で開始：BYOK キーを使い、隔離された sandbox で Coding Agent を実行。",
    imageAlt: "mosoo の料金",
  },
};

const STATUS_EN = {
  lang: "en",
  title: "mosoo — System Status",
  description:
    "Live production canary status, measured availability, TTFT, and driver continuity for mosoo public agent runtimes.",
  socialDescription:
    "Production canary status and measured availability for mosoo public agent runtimes.",
  imageAlt: "mosoo system status",
};

const STATUS_SEO = {
  en: STATUS_EN,
  zh: {
    lang: "zh-CN",
    title: "mosoo — 系统状态",
    description:
      "查看 mosoo 公共 Agent runtime 的生产 canary 状态、实测可用率、TTFT 与 driver 连续性。",
    socialDescription: "查看 mosoo 公共 Agent runtime 的生产 canary 状态与实测可用率。",
    imageAlt: "mosoo 系统状态",
  },
  ja: {
    lang: "ja",
    title: "mosoo — システムステータス",
    description:
      "mosoo の公開 Agent runtime に対する本番 canary、実測可用性、TTFT、driver 継続性を確認できます。",
    socialDescription: "mosoo 公開 Agent runtime の本番 canary と実測可用性。",
    imageAlt: "mosoo システムステータス",
  },
};

function replaceRequired(html, search, replacement) {
  if (!html.includes(search)) {
    throw new Error(`Landing locale build could not find: ${search}`);
  }
  return html.replaceAll(search, replacement);
}

function applyReplacements(source, replacements) {
  return replacements.reduce(
    (html, [search, replacement]) =>
      search === replacement ? html : replaceRequired(html, search, replacement),
    source,
  );
}

function localizeHtml(source, locale, copy) {
  const url = `https://mosoo.ai/${locale}`;
  const labels = FALLBACK_LABELS[locale];
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
    ['href="/en/pricing">Pricing</a>', `href="/${locale}/pricing">${labels.pricing}</a>`],
    ['href="/en/status">Status</a>', `href="/${locale}/status">${labels.status}</a>`],
    [">Docs</a>", `>${labels.docs}</a>`],
    [">Quickstart</a>", `>${labels.quickstart}</a>`],
    [">Blog</a>", `>${labels.blog}</a>`],
    [">Log in</a>", `>${labels.login}</a>`],
  ];

  return applyReplacements(source, replacements);
}

function localizePricingHtml(source, locale, copy) {
  const url = `https://mosoo.ai/${locale}/pricing`;
  const labels = FALLBACK_LABELS[locale];
  const replacements = [
    [`<html lang="${PRICING_EN.lang}">`, `<html lang="${copy.lang}">`],
    [PRICING_EN.title, copy.title],
    [PRICING_EN.description, copy.description],
    [PRICING_EN.socialDescription, copy.socialDescription],
    [PRICING_EN.imageAlt, copy.imageAlt],
    [
      '<link rel="canonical" href="https://mosoo.ai/en/pricing" />',
      `<link rel="canonical" href="${url}" />`,
    ],
    [
      '<meta property="og:url" content="https://mosoo.ai/en/pricing" />',
      `<meta property="og:url" content="${url}" />`,
    ],
    ['"@id": "https://mosoo.ai/en/pricing"', `"@id": "${url}"`],
    ['"url": "https://mosoo.ai/en/pricing"', `"url": "${url}"`],
    ['"inLanguage": "en"', `"inLanguage": "${copy.lang}"`],
    ['href="/en/pricing">Pricing</a>', `href="/${locale}/pricing">${labels.pricing}</a>`],
    ['href="/en/status">Status</a>', `href="/${locale}/status">${labels.status}</a>`],
    [">Docs</a>", `>${labels.docs}</a>`],
    [">Quickstart</a>", `>${labels.quickstart}</a>`],
    [">Blog</a>", `>${labels.blog}</a>`],
    [">Log in</a>", `>${labels.login}</a>`],
  ];

  return applyReplacements(source, replacements);
}

function localizeStatusHtml(source, locale, copy) {
  const url = `https://mosoo.ai/${locale}/status`;
  const labels = FALLBACK_LABELS[locale];
  const replacements = [
    [`<html lang="${STATUS_EN.lang}">`, `<html lang="${copy.lang}">`],
    [STATUS_EN.title, copy.title],
    [STATUS_EN.description, copy.description],
    [STATUS_EN.socialDescription, copy.socialDescription],
    [STATUS_EN.imageAlt, copy.imageAlt],
    [
      '<link rel="canonical" href="https://mosoo.ai/en/status" />',
      `<link rel="canonical" href="${url}" />`,
    ],
    [
      '<meta property="og:url" content="https://mosoo.ai/en/status" />',
      `<meta property="og:url" content="${url}" />`,
    ],
    ['"@id": "https://mosoo.ai/en/status"', `"@id": "${url}"`],
    ['"url": "https://mosoo.ai/en/status"', `"url": "${url}"`],
    ['"inLanguage": "en"', `"inLanguage": "${copy.lang}"`],
    ['href="/en/pricing">Pricing</a>', `href="/${locale}/pricing">${labels.pricing}</a>`],
    ['href="/en/status">Status</a>', `href="/${locale}/status">${labels.status}</a>`],
    [">Docs</a>", `>${labels.docs}</a>`],
    [">Quickstart</a>", `>${labels.quickstart}</a>`],
    [">Blog</a>", `>${labels.blog}</a>`],
    [">Log in</a>", `>${labels.login}</a>`],
  ];

  return applyReplacements(source, replacements);
}

export function renderLandingLocale(source, locale) {
  const copy = SEO[locale];
  if (!copy) throw new Error(`Unsupported landing locale: ${locale}`);
  return localizeHtml(source, locale, copy);
}

export function renderPricingLocale(source, locale) {
  const copy = PRICING_SEO[locale];
  if (!copy) throw new Error(`Unsupported pricing locale: ${locale}`);
  return localizePricingHtml(source, locale, copy);
}

export function renderStatusLocale(source, locale) {
  const copy = STATUS_SEO[locale];
  if (!copy) throw new Error(`Unsupported status locale: ${locale}`);
  return localizeStatusHtml(source, locale, copy);
}

export async function buildLandingLocales(landingDist) {
  const source = await readFile(join(landingDist, "index.html"), "utf8");
  const pricingSource = await readFile(join(landingDist, "pricing.html"), "utf8");
  const statusSource = await readFile(join(landingDist, "status.html"), "utf8");

  await Promise.all(
    Object.keys(SEO).map(async (locale) => {
      await writeFile(join(landingDist, `${locale}.html`), renderLandingLocale(source, locale));
      await mkdir(join(landingDist, locale), { recursive: true });
      await writeFile(
        join(landingDist, locale, "pricing.html"),
        renderPricingLocale(pricingSource, locale),
      );
      await writeFile(
        join(landingDist, locale, "status.html"),
        renderStatusLocale(statusSource, locale),
      );
    }),
  );
}
