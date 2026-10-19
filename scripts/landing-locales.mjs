import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { renderHomeFallback, renderHomeJsonLd } from "./landing-home.mjs";

// Home page head copy (copy deck section 14). The meta description leads with
// the README positioning line (langgenius/mosoo README.md:8-9). The static v5
// home (apps/landing/src/home/markup.ts), the FAQ and the JSON-LD come from
// landing-home.mjs and are written into the markers in index.html.
// imageAlt describes the social card that ships today
// (public/brand/social-card-20261019.png: the README positioning line and the
// four runtimes); change it together with the og:image when the card is
// regenerated.
const HOME_SEO = {
  en: {
    lang: "en",
    title: "Open-source Agent runtime for application backends | mosoo",
    description:
      "An open-source, API-first managed Agent runtime for application backends. Run OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.",
    socialTitle: "An open-source, API-first managed Agent runtime for application backends",
    socialDescription:
      "Start an agent task from your backend with one request. Continue it in the same Session days later, on OpenAI Codex, Claude Agent SDK, OpenCode, or Pi.",
    imageAlt:
      "mosoo: an open-source, API-first managed Agent runtime for application backends. One API, 4 runtimes: OpenAI Codex, Claude Agent SDK, OpenCode, and Pi.",
  },
  zh: {
    lang: "zh-CN",
    title: "面向应用后端的开源 Agent runtime | mosoo",
    description:
      "开源、API 优先的托管 Agent runtime，面向应用后端。用一个 API 运行 OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi，每个 Session 都在独立的 sandbox 中执行。",
    socialTitle: "开源、API 优先的托管 Agent runtime，面向应用后端",
    socialDescription:
      "后端用一个请求启动 Agent 任务，几天后仍可在同一个 Session 里继续。支持 OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi，使用你自己的模型密钥。",
    imageAlt:
      "mosoo：开源、API 优先的托管 Agent runtime，面向应用后端。一个 API，4 个 runtime：OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi。",
  },
  ja: {
    lang: "ja",
    title: "アプリのバックエンド向けオープンソース Agent runtime | mosoo",
    description:
      "アプリケーションのバックエンドのための、オープンソースで API ファーストなマネージド Agent runtime。OpenAI Codex、Claude Agent SDK、OpenCode、Pi を 1 つの API で実行し、Session ごとに専用の sandbox を使います。",
    socialTitle:
      "アプリケーションのバックエンドのための、オープンソースで API ファーストなマネージド Agent runtime",
    socialDescription:
      "バックエンドから 1 つのリクエストで Agent のタスクを始め、数日後も同じ Session で続けられます。OpenAI Codex、Claude Agent SDK、OpenCode、Pi をご自身のモデルキーで実行します。",
    imageAlt:
      "mosoo：アプリケーションのバックエンドのための、オープンソースで API ファーストなマネージド Agent runtime。1 つの API で 4 つの runtime：OpenAI Codex、Claude Agent SDK、OpenCode、Pi。",
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
    title: "Pricing | mosoo",
    description:
      "Start free on mosoo Cloud: run coding agents in isolated sandboxes with BYOK keys. Paid plans with more sandbox hours and concurrency are coming soon.",
    socialDescription:
      "Start free on mosoo Cloud: run coding agents in isolated sandboxes with BYOK keys.",
    imageAlt: "mosoo pricing",
  },
  zh: {
    lang: "zh-CN",
    title: "定价 | mosoo",
    description:
      "在 mosoo Cloud 免费起步：以 BYOK 密钥在隔离 sandbox 中运行 Coding Agent。含更多 sandbox 时长与并发的付费方案即将上线。",
    socialDescription: "在 mosoo Cloud 免费起步：以 BYOK 密钥在隔离 sandbox 中运行 Coding Agent。",
    imageAlt: "mosoo 定价",
  },
  ja: {
    lang: "ja",
    title: "料金 | mosoo",
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
    title: "System status | mosoo",
    description:
      "Live service availability and real production Run completion rates for mosoo, derived from Cloudflare and mosoo business logs.",
    socialDescription:
      "Observed production service availability and Run completion rates for mosoo.",
    imageAlt: "mosoo system status",
  },
  zh: {
    lang: "zh-CN",
    title: "系统状态 | mosoo",
    description:
      "基于 Cloudflare 调用结果与 mosoo 业务日志，查看生产服务可用性和真实 Run 完成率。",
    socialDescription: "查看 mosoo 生产服务可用性与真实 Run 完成率。",
    imageAlt: "mosoo 系统状态",
  },
  ja: {
    lang: "ja",
    title: "システムステータス | mosoo",
    description:
      "Cloudflare の実行結果と mosoo のビジネスログから、本番サービス可用性と実 Run 完了率を確認できます。",
    socialDescription: "mosoo の本番サービス可用性と実 Run 完了率。",
    imageAlt: "mosoo システムステータス",
  },
};

const USE_CASES_SEO = {
  en: {
    lang: "en",
    title: "Use cases | mosoo",
    description:
      "Products built on mosoo: see what each product does, what mosoo provides, and how the rest of the stack fits together.",
    socialDescription: "Real products built on mosoo: agents published once and called as APIs.",
    imageAlt: "mosoo use cases",
  },
  zh: {
    lang: "zh-CN",
    title: "用例 | mosoo",
    description:
      "用 mosoo 构建的产品：了解每个产品的作用、mosoo 提供的能力，以及技术栈其他部分如何协同。",
    socialDescription: "用 mosoo 构建的真实产品：Agent 发布一次，即可作为 API 调用。",
    imageAlt: "mosoo 用例",
  },
  ja: {
    lang: "ja",
    title: "ユースケース | mosoo",
    description:
      "mosoo でつくられたプロダクト：各プロダクトの役割、mosoo が提供する機能、スタック全体の連携を紹介します。",
    socialDescription:
      "mosoo でつくられた実プロダクト：Agent を一度公開すれば API として呼び出せます。",
    imageAlt: "mosoo ユースケース",
  },
};

const USE_CASE_BLUEPRINT_SEO = {
  en: {
    lang: "en",
    title: "Blueprint: a site builder for everyone | mosoo",
    description:
      "How Blueprint at trybp.page uses one mosoo Agent, a Thread per project, and Worker-side publishing to turn a brief into a live site.",
    socialDescription:
      "Prompt in, shippable site out: a mosoo Agent runs Blueprint, and trybp.page publishes the artifact.",
    imageAlt: "The Blueprint control surface on trybp.page",
  },
  zh: {
    lang: "zh-CN",
    title: "Blueprint：人人可用的站点构建器 | mosoo",
    description:
      "trybp.page 上的 Blueprint 如何用一个 mosoo Agent、每个项目一个 Thread，以及 Worker 侧发布，把 brief 变成线上站点。",
    socialDescription:
      "提示词进，可上线站点出：mosoo Agent 运行 Blueprint，trybp.page 发布产物。",
    imageAlt: "trybp.page 上的 Blueprint 控制台",
  },
  ja: {
    lang: "ja",
    title: "Blueprint：だれでも使えるサイトビルダー | mosoo",
    description:
      "trybp.page の Blueprint が、1 つの mosoo Agent、プロジェクトごとの Thread、Worker 側の公開でブリーフをライブサイトに変える方法。",
    socialDescription:
      "プロンプトを入れると出荷可能なサイトが出てくる：mosoo Agent が Blueprint を実行し、trybp.page が成果物を公開します。",
    imageAlt: "trybp.page 上の Blueprint コントロール画面",
  },
};

const USE_CASE_PITCHPILOT_SEO = {
  en: {
    lang: "en",
    title: "PitchPilot: an Agent-powered web app | mosoo",
    description:
      "How PitchPilot keeps its product UI while one published mosoo Agent handles attachments, Runs, events, and committed HTML artifacts for preview and download.",
    socialDescription:
      "A complete web app puts a published mosoo Agent behind its own product experience.",
    imageAlt:
      "PitchPilot previewing a committed HTML artifact generated by a published mosoo Agent",
  },
  zh: {
    lang: "zh-CN",
    title: "PitchPilot：Agent 驱动的 Web 应用 | mosoo",
    description:
      "PitchPilot 如何保留自己的产品 UI，同时让一个已发布的 mosoo Agent 处理附件、Run、事件与已提交的 HTML artifact，并提供预览和下载。",
    socialDescription: "一个完整的 Web 应用，把已发布的 mosoo Agent 放在自己的产品体验背后。",
    imageAlt: "PitchPilot 正在预览由已发布 mosoo Agent 生成并提交的 HTML artifact",
  },
  ja: {
    lang: "ja",
    title: "PitchPilot：Agent 搭載 Web アプリ | mosoo",
    description:
      "PitchPilot が独自のプロダクト UI を保ちながら、公開済み mosoo Agent に添付ファイル、Run、イベント、コミット済み HTML artifact を処理させ、プレビューとダウンロードを提供する方法。",
    socialDescription:
      "完成した Web アプリが、公開済み mosoo Agent を独自のプロダクト体験の背後に置きます。",
    imageAlt: "公開済み mosoo Agent が生成・コミットした HTML artifact をプレビューする PitchPilot",
  },
};

const USE_CASE_GO_GYM_SEO = {
  en: {
    lang: "en",
    title: "Go Gym: a multi-user Agent backend | mosoo",
    description:
      "How Go Gym uses one shared mosoo Agent, user-scoped Threads, delegated MCP identity, and isolated sandboxes inside a production multi-user fitness app.",
    socialDescription:
      "One shared mosoo Agent turns fitness conversations into isolated, durable user records.",
    imageAlt: "The Go Gym dashboard after the Agent recorded meals and training",
  },
  zh: {
    lang: "zh-CN",
    title: "Go Gym：多用户 Agent Backend | mosoo",
    description:
      "Go Gym 如何在生产级多用户健身应用中使用一个共享的 mosoo Agent、用户范围内的 Thread、委托 MCP 身份与隔离 sandbox。",
    socialDescription: "一个共享的 mosoo Agent 把健身对话转化为隔离、持久的用户记录。",
    imageAlt: "Agent 记录饮食与训练后的 Go Gym 仪表盘",
  },
  ja: {
    lang: "ja",
    title: "Go Gym：マルチユーザー Agent Backend | mosoo",
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
    title: "Codex Pet: Agent as API | mosoo",
    description:
      "How one published mosoo Agent turns an uploaded avatar into all nine Codex pet animation states, integrated from Codex through the Thread API.",
    socialDescription:
      "One published mosoo Agent turns an uploaded avatar into all nine Codex pet animation states.",
    imageAlt: "The Codex Pet app built on mosoo",
  },
  zh: {
    lang: "zh-CN",
    title: "Codex Pet：Agent as API | mosoo",
    description:
      "一个已发布的 mosoo Agent 如何把一张上传的头像变成全部九个 Codex 宠物动画状态，由 Codex 通过 Thread API 完成集成。",
    socialDescription: "一个已发布的 mosoo Agent 把一张上传的头像变成全部九个 Codex 宠物动画状态。",
    imageAlt: "用 mosoo 构建的 Codex Pet 应用",
  },
  ja: {
    lang: "ja",
    title: "Codex Pet：Agent as API | mosoo",
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
    title: "ghfind: a deep project valuation engine | mosoo",
    description:
      "ghfind uses one published mosoo Agent for deep repository evaluation while ghfind owns scoring, workflow, validation, storage, and UI.",
    socialDescription:
      "One published mosoo Agent powers ghfind's repository evaluation; ghfind owns the rubric, job workflow, validation, storage, and UI.",
    imageAlt: "The ghfind Projects page powered by mosoo",
  },
  zh: {
    lang: "zh-CN",
    title: "ghfind：深度项目评测估值引擎 | mosoo",
    description:
      "ghfind 把确定性的 GitHub 账号评分与仓库评估分开；仓库评估由一个已发布的 mosoo Agent 检查项目，并通过 Thread API 返回结构化 artifact。",
    socialDescription:
      "一个已发布的 mosoo Agent 驱动 ghfind 的仓库评估；rubric、任务流程、校验、存储与 UI 由 ghfind 负责。",
    imageAlt: "由 mosoo 驱动的 ghfind Projects 页面",
  },
  ja: {
    lang: "ja",
    title: "ghfind：プロジェクト評価・バリュエーションエンジン | mosoo",
    description:
      "ghfind は決定論的な GitHub アカウントスコアとリポジトリ評価を分離し、後者では公開済み mosoo Agent がプロジェクトを調査して Thread API から構造化 artifact を返します。",
    socialDescription:
      "公開済み mosoo Agent が ghfind のリポジトリ評価を担い、rubric、ジョブフロー、検証、保存、UI は ghfind が担います。",
    imageAlt: "mosoo が支える ghfind Projects ページ",
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

// The static nav that the subpages (pricing, status, use cases) still carry.
function navReplacements(locale) {
  const labels = FALLBACK_LABELS[locale];
  return [
    ['href="/en/pricing">Pricing</a>', `href="/${locale}/pricing">${labels.pricing}</a>`],
    ['href="/en/use-cases">Use cases</a>', `href="/${locale}/use-cases">${labels.useCases}</a>`],
    ['href="/health">Status</a>', `href="${locale === "en" ? "/health" : `/${locale}/health`}">${labels.status}</a>`],
    [">Docs</a>", `>${labels.docs}</a>`],
    [">Quickstart</a>", `>${labels.quickstart}</a>`],
    [">Blog</a>", `>${labels.blog}</a>`],
    [">Log in</a>", `>${labels.login}</a>`],
  ];
}

// Replaces exactly one `<!-- mosoo:<name> ... -->` comment. A function
// replacement keeps "$" in the inserted HTML (shell variables in code) literal.
function fillMarker(html, name, content) {
  const marker = new RegExp(`<!-- mosoo:${name}\\b[\\s\\S]*?-->`, "g");
  const count = html.match(marker)?.length ?? 0;
  if (count !== 1) {
    throw new Error(`Landing locale build expected one mosoo:${name} marker, found ${count}`);
  }
  return html.replace(marker, () => content);
}

function localizeHomeHead(source, locale) {
  const en = HOME_SEO.en;
  const copy = HOME_SEO[locale];
  const url = `https://mosoo.ai/${locale}`;
  return applyReplacements(source, [
    // The home's <html> also declares the damped scroll (src/effects/v5/damp-scroll.ts).
    [`<html lang="${en.lang}" data-damp>`, `<html lang="${copy.lang}" data-damp>`],
    [en.title, copy.title],
    [en.description, copy.description],
    [en.socialTitle, copy.socialTitle],
    [en.socialDescription, copy.socialDescription],
    [en.imageAlt, copy.imageAlt],
    [
      '<link rel="canonical" href="https://mosoo.ai/en" />',
      `<link rel="canonical" href="${url}" />`,
    ],
    [
      '<meta property="og:url" content="https://mosoo.ai/en" />',
      `<meta property="og:url" content="${url}" />`,
    ],
  ]);
}

// The no-JS h1 of a subpage is its title without the " | mosoo" suffix.
const headingOf = (title) => title.replace(/ \| mosoo$/, "");

// Localizes any landing subpage (pricing, status, use cases…): the EN copy in
// the source HTML is looked up from seo.en and swapped for seo[locale].
function localizeSubpageHtml(source, locale, seo, subpath, extraReplacements = []) {
  const en = seo.en;
  const copy = seo[locale];
  const enUrl = subpath === "/health" ? "https://mosoo.ai/health" : `https://mosoo.ai/en${subpath}`;
  const url = locale === "en" ? enUrl : `https://mosoo.ai/${locale}${subpath}`;
  const replacements = [
    [`<html lang="${en.lang}">`, `<html lang="${copy.lang}">`],
    [en.title, copy.title],
    [
      `>\n          ${headingOf(en.title)}\n        </h1>`,
      `>\n          ${headingOf(copy.title)}\n        </h1>`,
    ],
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

// Head copy is localized first, then the generated JSON-LD and static page go
// into the markers, so the EN-to-locale replacements never touch them.
export function renderLandingLocale(source, locale) {
  if (!HOME_SEO[locale]) throw new Error(`Unsupported landing locale: ${locale}`);
  const head = fillMarker(localizeHomeHead(source, locale), "home-head", renderHomeJsonLd(locale));
  return fillMarker(head, "home-fallback", renderHomeFallback(locale));
}

export function renderPricingLocale(source, locale) {
  if (!PRICING_SEO[locale]) throw new Error(`Unsupported pricing locale: ${locale}`);
  return localizeSubpageHtml(source, locale, PRICING_SEO, "/pricing");
}

export function renderStatusLocale(source, locale) {
  if (!STATUS_SEO[locale]) throw new Error(`Unsupported status locale: ${locale}`);
  return localizeSubpageHtml(source, locale, STATUS_SEO, "/health");
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
  const blueprintSource = await readFile(join(landingDist, "use-cases", "blueprint.html"), "utf8");
  const pitchPilotSource = await readFile(
    join(landingDist, "use-cases", "pitchpilot.html"),
    "utf8",
  );

  // dist/index.html keeps no unfilled markers if a host ever serves it directly.
  await writeFile(join(landingDist, "index.html"), renderLandingLocale(source, "en"));

  await Promise.all(
    Object.keys(HOME_SEO).map(async (locale) => {
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
