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
    useCases: "Use cases",
    status: "Status",
    docs: "Docs",
    quickstart: "Quickstart",
    blog: "Blog",
    login: "Log in",
  },
  zh: {
    pricing: "定价",
    useCases: "用例",
    status: "状态",
    docs: "文档",
    quickstart: "快速开始",
    blog: "博客",
    login: "登录",
  },
  ja: {
    pricing: "料金",
    useCases: "ユースケース",
    status: "稼働状況",
    docs: "ドキュメント",
    quickstart: "クイックスタート",
    blog: "ブログ",
    login: "ログイン",
  },
};

const PRICING_SEO = {
  en: {
    lang: "en",
    title: "mosoo — Pricing",
    description:
      "Start free on mosoo Cloud: run coding agents in isolated sandboxes with BYOK keys. Paid plans with more sandbox hours and concurrency are coming soon.",
    socialDescription:
      "Start free on mosoo Cloud: run coding agents in isolated sandboxes with BYOK keys.",
    imageAlt: "mosoo pricing",
  },
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

const STATUS_SEO = {
  en: {
    lang: "en",
    title: "mosoo — System Status",
    description:
      "Live production canary status, measured availability, TTFT, and driver continuity for mosoo public agent runtimes.",
    socialDescription:
      "Production canary status and measured availability for mosoo public agent runtimes.",
    imageAlt: "mosoo system status",
  },
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

const USE_CASES_SEO = {
  en: {
    lang: "en",
    title: "mosoo — Use Cases",
    description:
      "Real products built on mosoo: see the live product, what mosoo provides, and how the rest of the stack fits together.",
    socialDescription: "Real products built on mosoo: agents published once and called as APIs.",
    imageAlt: "mosoo use cases",
  },
  zh: {
    lang: "zh-CN",
    title: "mosoo — 用例",
    description:
      "用 mosoo 构建的真实产品：查看线上产品、mosoo 提供的能力，以及技术栈其他部分如何协同。",
    socialDescription: "用 mosoo 构建的真实产品：Agent 发布一次，即可作为 API 调用。",
    imageAlt: "mosoo 用例",
  },
  ja: {
    lang: "ja",
    title: "mosoo — ユースケース",
    description:
      "mosoo でつくられた実プロダクト：ライブプロダクト、mosoo が提供する機能、スタック全体の連携を紹介します。",
    socialDescription: "mosoo でつくられた実プロダクト：Agent を一度公開すれば API として呼び出せます。",
    imageAlt: "mosoo ユースケース",
  },
};

const USE_CASE_GO_GYM_SEO = {
  en: {
    lang: "en",
    title: "mosoo — Go Gym: Multi-user Agent Backend",
    description:
      "How Go Gym uses one shared mosoo Agent, user-scoped Threads, delegated MCP identity, and isolated sandboxes inside a production multi-user fitness app.",
    socialDescription:
      "One shared mosoo Agent turns fitness conversations into isolated, durable user records.",
    imageAlt: "The Go Gym dashboard after the Agent recorded meals and training",
  },
  zh: {
    lang: "zh-CN",
    title: "mosoo — Go Gym：多用户 Agent Backend",
    description:
      "Go Gym 如何在生产级多用户健身应用中使用一个共享的 mosoo Agent、用户范围内的 Thread、委托 MCP 身份与隔离 sandbox。",
    socialDescription:
      "一个共享的 mosoo Agent 把健身对话转化为隔离、持久的用户记录。",
    imageAlt: "Agent 记录饮食与训练后的 Go Gym 仪表盘",
  },
  ja: {
    lang: "ja",
    title: "mosoo — Go Gym：マルチユーザー Agent Backend",
    description:
      "Go Gym が本番マルチユーザーフィットネスアプリで、共有 mosoo Agent、ユーザー単位の Thread、委任 MCP ID、隔離 sandbox を使う方法。",
    socialDescription:
      "共有された 1 つの mosoo Agent が、フィットネス会話を隔離された永続ユーザーレコードに変換します。",
    imageAlt: "Agent が食事とトレーニングを記録した後の Go Gym ダッシュボード",
  },
};

const USE_CASE_CODEX_PET_SEO = {
  en: {
    lang: "en",
    title: "mosoo — Codex Pet: Agent as API",
    description:
      "How one published mosoo Agent turns an uploaded avatar into all nine Codex pet animation states — integrated from Codex through the Thread API.",
    socialDescription:
      "One published mosoo Agent turns an uploaded avatar into all nine Codex pet animation states.",
    imageAlt: "The Codex Pet app built on mosoo",
  },
  zh: {
    lang: "zh-CN",
    title: "mosoo — Codex Pet：Agent as API",
    description:
      "一个已发布的 mosoo Agent 如何把一张上传的头像变成全部九个 Codex 宠物动画状态——由 Codex 通过 Thread API 完成集成。",
    socialDescription:
      "一个已发布的 mosoo Agent 把一张上传的头像变成全部九个 Codex 宠物动画状态。",
    imageAlt: "用 mosoo 构建的 Codex Pet 应用",
  },
  ja: {
    lang: "ja",
    title: "mosoo — Codex Pet：Agent as API",
    description:
      "公開済みの mosoo Agent 1 つが、アップロードされたアバターを 9 つの Codex ペットアニメーション状態に変換。Codex から Thread API 経由で統合します。",
    socialDescription:
      "公開済みの mosoo Agent 1 つが、アップロードされたアバターを 9 つの Codex ペットアニメーション状態に変換。",
    imageAlt: "mosoo でつくられた Codex Pet アプリ",
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

function navReplacements(locale) {
  const labels = FALLBACK_LABELS[locale];
  return [
    ['href="/en/pricing">Pricing</a>', `href="/${locale}/pricing">${labels.pricing}</a>`],
    ['href="/en/use-cases">Use cases</a>', `href="/${locale}/use-cases">${labels.useCases}</a>`],
    ['href="/en/status">Status</a>', `href="/${locale}/status">${labels.status}</a>`],
    [">Docs</a>", `>${labels.docs}</a>`],
    [">Quickstart</a>", `>${labels.quickstart}</a>`],
    [">Blog</a>", `>${labels.blog}</a>`],
    [">Log in</a>", `>${labels.login}</a>`],
  ];
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
    ...navReplacements(locale),
  ];

  return applyReplacements(source, replacements);
}

// Localizes any landing subpage (pricing, status, use cases…): the EN copy in
// the source HTML is looked up from seo.en and swapped for seo[locale].
function localizeSubpageHtml(source, locale, seo, subpath, extraReplacements = []) {
  const en = seo.en;
  const copy = seo[locale];
  const url = `https://mosoo.ai/${locale}${subpath}`;
  const enUrl = `https://mosoo.ai/en${subpath}`;
  const replacements = [
    [`<html lang="${en.lang}">`, `<html lang="${copy.lang}">`],
    [en.title, copy.title],
    [en.description, copy.description],
    [en.socialDescription, copy.socialDescription],
    [en.imageAlt, copy.imageAlt],
    [`<link rel="canonical" href="${enUrl}" />`, `<link rel="canonical" href="${url}" />`],
    [
      `<meta property="og:url" content="${enUrl}" />`,
      `<meta property="og:url" content="${url}" />`,
    ],
    [`"@id": "${enUrl}"`, `"@id": "${url}"`],
    [`"url": "${enUrl}"`, `"url": "${url}"`],
    ['"inLanguage": "en"', `"inLanguage": "${copy.lang}"`],
    ...navReplacements(locale),
    ...extraReplacements,
  ];

  return applyReplacements(source, replacements);
}

export function renderLandingLocale(source, locale) {
  const copy = SEO[locale];
  if (!copy) throw new Error(`Unsupported landing locale: ${locale}`);
  return localizeHtml(source, locale, copy);
}

export function renderPricingLocale(source, locale) {
  if (!PRICING_SEO[locale]) throw new Error(`Unsupported pricing locale: ${locale}`);
  return localizeSubpageHtml(source, locale, PRICING_SEO, "/pricing");
}

export function renderStatusLocale(source, locale) {
  if (!STATUS_SEO[locale]) throw new Error(`Unsupported status locale: ${locale}`);
  return localizeSubpageHtml(source, locale, STATUS_SEO, "/status");
}

export function renderUseCasesLocale(source, locale) {
  if (!USE_CASES_SEO[locale]) throw new Error(`Unsupported use-cases locale: ${locale}`);
  return localizeSubpageHtml(source, locale, USE_CASES_SEO, "/use-cases", [
    ['href="/en/use-cases/go-gym">', `href="/${locale}/use-cases/go-gym">`],
    ['href="/en/use-cases/codex-pet">', `href="/${locale}/use-cases/codex-pet">`],
  ]);
}

export function renderUseCaseGoGymLocale(source, locale) {
  if (!USE_CASE_GO_GYM_SEO[locale]) {
    throw new Error(`Unsupported use-case locale: ${locale}`);
  }
  return localizeSubpageHtml(source, locale, USE_CASE_GO_GYM_SEO, "/use-cases/go-gym");
}

export function renderUseCaseCodexPetLocale(source, locale) {
  if (!USE_CASE_CODEX_PET_SEO[locale]) {
    throw new Error(`Unsupported use-case locale: ${locale}`);
  }
  return localizeSubpageHtml(source, locale, USE_CASE_CODEX_PET_SEO, "/use-cases/codex-pet");
}

export async function buildLandingLocales(landingDist) {
  const source = await readFile(join(landingDist, "index.html"), "utf8");
  const pricingSource = await readFile(join(landingDist, "pricing.html"), "utf8");
  const statusSource = await readFile(join(landingDist, "status.html"), "utf8");
  const useCasesSource = await readFile(join(landingDist, "use-cases.html"), "utf8");
  const goGymSource = await readFile(join(landingDist, "use-cases", "go-gym.html"), "utf8");
  const codexPetSource = await readFile(join(landingDist, "use-cases", "codex-pet.html"), "utf8");

  await Promise.all(
    Object.keys(SEO).map(async (locale) => {
      await writeFile(join(landingDist, `${locale}.html`), renderLandingLocale(source, locale));
      await mkdir(join(landingDist, locale, "use-cases"), { recursive: true });
      await writeFile(
        join(landingDist, locale, "pricing.html"),
        renderPricingLocale(pricingSource, locale),
      );
      await writeFile(
        join(landingDist, locale, "status.html"),
        renderStatusLocale(statusSource, locale),
      );
      await writeFile(
        join(landingDist, locale, "use-cases.html"),
        renderUseCasesLocale(useCasesSource, locale),
      );
      await writeFile(
        join(landingDist, locale, "use-cases", "go-gym.html"),
        renderUseCaseGoGymLocale(goGymSource, locale),
      );
      await writeFile(
        join(landingDist, locale, "use-cases", "codex-pet.html"),
        renderUseCaseCodexPetLocale(codexPetSource, locale),
      );
    }),
  );
}
