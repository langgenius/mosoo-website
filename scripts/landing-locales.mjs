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

const USE_CASE_BLUEPRINT_SEO = {
  en: {
    lang: "en",
    title: "mosoo — Blueprint: A site builder for everyone",
    description:
      "How Blueprint at trybp.page uses one shared cattle mosoo Agent, Thread-scoped projects, and Worker-side publish to turn a brief into a live site.",
    socialDescription:
      "Prompt in, shippable site out — a cattle mosoo Agent runs Blueprint; trybp.page publishes the artifact.",
    imageAlt: "The Blueprint control surface on trybp.page",
  },
  zh: {
    lang: "zh-CN",
    title: "mosoo — Blueprint：人人可用的站点构建器",
    description:
      "trybp.page 上的 Blueprint 如何用一个共享的 cattle mosoo Agent、按项目划分的 Thread，以及 Worker 侧发布，把 brief 变成线上站点。",
    socialDescription:
      "提示词进，可上线站点出——cattle mosoo Agent 运行 Blueprint；trybp.page 发布产物。",
    imageAlt: "trybp.page 上的 Blueprint 控制台",
  },
  ja: {
    lang: "ja",
    title: "mosoo — Blueprint：だれでも使えるサイトビルダー",
    description:
      "trybp.page の Blueprint が、共有 cattle mosoo Agent、プロジェクト単位の Thread、Worker 側の公開でブリーフをライブサイトに変える方法。",
    socialDescription:
      "プロンプトを入れると出荷可能なサイトが出てくる — cattle の mosoo Agent が Blueprint を実行し、trybp.page が成果物を公開します。",
    imageAlt: "trybp.page 上の Blueprint コントロール画面",
  },
};

const USE_CASE_PITCHPILOT_SEO = {
  en: {
    lang: "en",
    title: "mosoo — PitchPilot: Agent-powered Web App",
    description:
      "How PitchPilot keeps its product UI while one published mosoo Agent handles attachments, Runs, events, and committed HTML artifacts for preview and download.",
    socialDescription:
      "A complete web app puts a published mosoo Agent behind its own product experience.",
    imageAlt:
      "PitchPilot previewing a committed HTML artifact generated by a published mosoo Agent",
  },
  zh: {
    lang: "zh-CN",
    title: "mosoo — PitchPilot：Agent 驱动的 Web 应用",
    description:
      "PitchPilot 如何保留自己的产品 UI，同时让一个已发布的 mosoo Agent 处理附件、Run、事件与已提交的 HTML artifact，并提供预览和下载。",
    socialDescription:
      "一个完整的 Web 应用，把已发布的 mosoo Agent 放在自己的产品体验背后。",
    imageAlt: "PitchPilot 正在预览由已发布 mosoo Agent 生成并提交的 HTML artifact",
  },
  ja: {
    lang: "ja",
    title: "mosoo — PitchPilot：Agent 搭載 Web アプリ",
    description:
      "PitchPilot が独自のプロダクト UI を保ちながら、公開済み mosoo Agent に添付ファイル、Run、イベント、コミット済み HTML artifact を処理させ、プレビューとダウンロードを提供する方法。",
    socialDescription:
      "完成した Web アプリが、公開済み mosoo Agent を独自のプロダクト体験の背後に置きます。",
    imageAlt:
      "公開済み mosoo Agent が生成・コミットした HTML artifact をプレビューする PitchPilot",
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

const USE_CASE_GHFIND_SEO = {
  en: {
    lang: "en",
    title: "mosoo — ghfind: Deep project valuation engine",
    description:
      "ghfind gives any public open-source project a deep evaluation and valuation, and any GitHub account a brutally honest 0–100 score — the deep project valuation runs on one published mosoo Agent behind the ghfind backend, through the Thread API.",
    socialDescription:
      "One published mosoo Agent powers ghfind's deep project valuation through the Thread API.",
    imageAlt: "The ghfind app built on mosoo",
  },
  zh: {
    lang: "zh-CN",
    title: "mosoo — ghfind：深度项目评测估值引擎",
    description:
      "ghfind 为任意公开开源项目做深度评测估值，也为任意 GitHub 账号打出毫不留情的 0–100 分——深度项目评测估值由 ghfind 后端通过一个已发布的 mosoo Agent、经 Thread API 完成。",
    socialDescription:
      "一个已发布的 mosoo Agent 通过 Thread API 支撑 ghfind 的深度项目评测估值。",
    imageAlt: "用 mosoo 构建的 ghfind 应用",
  },
  ja: {
    lang: "ja",
    title: "mosoo — ghfind：プロジェクト評価・バリュエーションエンジン",
    description:
      "ghfind は任意の公開オープンソースプロジェクトを詳細に評価・バリュエーションし、任意の GitHub アカウントに容赦ない 0〜100 スコアを出します——詳細な評価は ghfind バックエンドから公開済み mosoo Agent を Thread API 経由で呼び出して実行します。",
    socialDescription:
      "公開済みの mosoo Agent 1 つが Thread API 経由で ghfind の詳細なプロジェクト評価・バリュエーションを支えます。",
    imageAlt: "mosoo でつくられた ghfind アプリ",
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
    ['href="/en/use-cases/blueprint">', `href="/${locale}/use-cases/blueprint">`],
    ['href="/en/use-cases/pitchpilot">', `href="/${locale}/use-cases/pitchpilot">`],
    ['href="/en/use-cases/go-gym">', `href="/${locale}/use-cases/go-gym">`],
    ['href="/en/use-cases/codex-pet">', `href="/${locale}/use-cases/codex-pet">`],
    ['href="/en/use-cases/ghfind">', `href="/${locale}/use-cases/ghfind">`],
  ]);
}

export function renderUseCaseBlueprintLocale(source, locale) {
  if (!USE_CASE_BLUEPRINT_SEO[locale]) {
    throw new Error(`Unsupported use-case locale: ${locale}`);
  }
  return localizeSubpageHtml(source, locale, USE_CASE_BLUEPRINT_SEO, "/use-cases/blueprint");
}

export function renderUseCasePitchPilotLocale(source, locale) {
  if (!USE_CASE_PITCHPILOT_SEO[locale]) {
    throw new Error(`Unsupported use-case locale: ${locale}`);
  }
  return localizeSubpageHtml(source, locale, USE_CASE_PITCHPILOT_SEO, "/use-cases/pitchpilot");
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

export function renderUseCaseGhfindLocale(source, locale) {
  if (!USE_CASE_GHFIND_SEO[locale]) {
    throw new Error(`Unsupported use-case locale: ${locale}`);
  }
  return localizeSubpageHtml(source, locale, USE_CASE_GHFIND_SEO, "/use-cases/ghfind");
}

export async function buildLandingLocales(landingDist) {
  const source = await readFile(join(landingDist, "index.html"), "utf8");
  const pricingSource = await readFile(join(landingDist, "pricing.html"), "utf8");
  const statusSource = await readFile(join(landingDist, "status.html"), "utf8");
  const useCasesSource = await readFile(join(landingDist, "use-cases.html"), "utf8");
  const goGymSource = await readFile(join(landingDist, "use-cases", "go-gym.html"), "utf8");
  const codexPetSource = await readFile(join(landingDist, "use-cases", "codex-pet.html"), "utf8");
  const ghfindSource = await readFile(join(landingDist, "use-cases", "ghfind.html"), "utf8");
  const blueprintSource = await readFile(
    join(landingDist, "use-cases", "blueprint.html"),
    "utf8",
  );
  const pitchPilotSource = await readFile(
    join(landingDist, "use-cases", "pitchpilot.html"),
    "utf8",
  );

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
      await writeFile(
        join(landingDist, locale, "use-cases", "ghfind.html"),
        renderUseCaseGhfindLocale(ghfindSource, locale),
      );
      await writeFile(
        join(landingDist, locale, "use-cases", "blueprint.html"),
        renderUseCaseBlueprintLocale(blueprintSource, locale),
      );
      await writeFile(
        join(landingDist, locale, "use-cases", "pitchpilot.html"),
        renderUseCasePitchPilotLocale(pitchPilotSource, locale),
      );
    }),
  );
}
