// The home page in /en, /zh and /ja, as static HTML: the v4b "Paper" page
// itself (no React on the home; apps/landing/src/main.tsx only adds styles and
// the effect engines), and the JSON-LD @graph.
//
// UI first, copy last (owner notes 2026-10-19 15:13): every string below was
// written into a slot of the locked UI (v4b/UI-LOCK.md §4; the letter in each
// comment is the slot id) and checked against langgenius/mosoo (README,
// docs/SPEC.md, docs/prd, scripts/public-api-session-workflow.ts). A string
// that does not fit its slot is rewritten, never given a new slot. The FAQ
// strings are the exact strings the FAQPage JSON-LD and llms.txt carry.

import { OUTLINE } from "../apps/landing/src/shared/chrome/outline-geometry.mjs";
import { renderPaperFooter, renderPaperNav } from "../apps/landing/src/shared/chrome/paper-chrome.mjs";

const SITE = "https://mosoo.ai";
const CONSOLE = "https://cloud.mosoo.ai";
const GITHUB = "https://github.com/langgenius/mosoo";

const LINKS = {
  console: CONSOLE,
  github: GITHUB,
  releases: `${GITHUB}/releases`,
  license: `${GITHUB}/blob/main/LICENSE`,
  x: "https://x.com/mosooagent",
};

const LANGUAGES = [
  { locale: "en", lang: "en" },
  { locale: "zh", lang: "zh-CN" },
  { locale: "ja", lang: "ja" },
];

// Positioning (README line 8) and the JSON-LD description and features. The
// page itself has no slot for the positioning line (UI-LOCK §3 row 07), so it
// lives in the meta description (landing-locales.mjs) and here.
const META = {
  en: {
    lang: "en",
    positioning: "An open-source, API-first managed Agent runtime for application backends.",
    description:
      "An open-source, API-first managed Agent runtime for application backends. It runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.",
    help: `${SITE}/docs/`,
    features: [
      "Start a Session without creating an Agent",
      "Choose OpenAI Codex, Claude Agent SDK, OpenCode, or Pi per Session",
      "Continue the same Session minutes or days later",
      "A turn succeeds only when its events, usage, and a checkpoint are committed",
      "Provider keys and MCP credentials stay outside the sandbox",
      "Input attachments, downloadable artifacts, and SSE event streams",
      "Bring your own model provider keys",
      "Usage recorded for every model call",
    ],
  },
  zh: {
    lang: "zh-CN",
    positioning: "开源、API 优先的托管 Agent runtime，面向应用后端。",
    description:
      "开源、API 优先的托管 Agent runtime，面向应用后端。它用一个 API 运行 OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi，每个 Session 都在自己的 sandbox 中执行。",
    help: `${SITE}/docs/zh-Hans/`,
    features: [
      "无需创建 Agent 即可启动 Session",
      "每个 Session 可选 OpenAI Codex、Claude Agent SDK、OpenCode 或 Pi",
      "几分钟或几天后在同一个 Session 中继续",
      "事件、用量和检查点一起提交后，turn 才算成功",
      "模型供应商密钥和 MCP 凭据留在 sandbox 之外",
      "输入附件、可下载的产出物和 SSE 事件流",
      "使用你自己的模型供应商密钥",
      "每次模型调用都记录用量",
    ],
  },
  ja: {
    lang: "ja",
    positioning: "アプリケーションのバックエンドのための、オープンソースで API ファーストなマネージド Agent runtime。",
    description:
      "アプリケーションのバックエンドのための、オープンソースで API ファーストなマネージド Agent runtime。OpenAI Codex、Claude Agent SDK、OpenCode、Pi を 1 つの API で実行し、Session ごとに専用の sandbox を使います。",
    help: `${SITE}/docs/ja/`,
    features: [
      "Agent を作成せずに Session を開始",
      "Session ごとに OpenAI Codex、Claude Agent SDK、OpenCode、Pi から選択",
      "数分後でも数日後でも同じ Session で続行",
      "イベント、使用量、チェックポイントがコミットされて初めて turn が成功",
      "プロバイダーキーと MCP の認証情報は sandbox の外",
      "入力の添付ファイル、ダウンロードできる成果物、SSE イベントストリーム",
      "ご自身のモデルプロバイダーキーを使用",
      "モデル呼び出しごとに使用量を記録",
    ],
  },
};

// U16: six questions (≤10 words) and answers (≤40 words; zh ≤100, ja ≤120
// characters). Sources, in order: README (Getting Started, License); SPEC §3;
// README + docs/prd/runtime-catalog.md; SPEC §5; SPEC §2; SPEC §4
// Continuation. The page, the FAQPage JSON-LD and llms.txt read this list.
const FAQ = {
  en: [
    {
      q: "Is mosoo hosted or open source?",
      a: "Both. The quickest way to try it is the hosted console at cloud.mosoo.ai. The source is Apache-2.0 on GitHub, and the README explains how to run it locally for development.",
    },
    {
      q: "Do I need to create an Agent first?",
      a: "No. On /api/v2, one request carries the harness, provider, model, instructions, and input, and mosoo starts a durable Session without creating an Agent. Saved Agent presets are optional.",
    },
    {
      q: "Which harnesses can a Session run?",
      a: "OpenAI Codex, Claude Agent SDK, OpenCode, or Pi. Each Session freezes its harness, model, and protocol, and a pair that does not match is rejected before anything runs.",
    },
    {
      q: "Do my provider keys enter the sandbox?",
      a: "No. Provider keys and MCP credentials stay outside it, and the sandbox only receives expiring grants for them. Environment variables are different: code in the sandbox can read them.",
    },
    {
      q: "Who pays for model usage?",
      a: "You do, directly. Model keys belong to your Project, and the provider bills your account. mosoo supplies no models and sets no spending cap.",
    },
    {
      q: "What happens when I reply days later?",
      a: "The same Session continues, even after its sandbox was reclaimed. mosoo restores the working directory, the native conversation, and the recorded artifacts from the last committed checkpoint. If that fails, the follow-up fails with an error.",
    },
  ],
  zh: [
    {
      q: "mosoo 是托管服务还是开源项目？",
      a: "两者都是。最快的试用方式是托管控制台 cloud.mosoo.ai。源码以 Apache-2.0 许可证发布在 GitHub 上，README 说明了如何在本地运行以便开发。",
    },
    {
      q: "需要先创建 Agent 吗？",
      a: "不需要。在 /api/v2 上，一个请求就能带上 harness、模型供应商、模型、指令和输入，mosoo 直接启动持久的 Session，不会创建 Agent。保存的 Agent 预设是可选项。",
    },
    {
      q: "Session 能运行哪些 harness？",
      a: "OpenAI Codex、Claude Agent SDK、OpenCode 或 Pi。每个 Session 会固定自己的 harness、模型和协议，不匹配的组合会在执行前被拒绝。",
    },
    {
      q: "模型供应商密钥会进入 sandbox 吗？",
      a: "不会。模型供应商密钥和 MCP 凭据留在 sandbox 之外，sandbox 只拿到会过期的授权。环境变量不同：sandbox 里的代码可以读取它们。",
    },
    {
      q: "模型用量由谁付费？",
      a: "由你直接支付。模型密钥属于你的项目，费用由供应商向你的账户收取。mosoo 不提供模型，也不设花费上限。",
    },
    {
      q: "几天后再回复会怎样？",
      a: "同一个 Session 会继续，即使 sandbox 已被回收。mosoo 从最近提交的检查点恢复工作目录、原生对话和产出物；恢复失败会明确报错。",
    },
  ],
  ja: [
    {
      q: "mosoo はホスト型ですか、オープンソースですか？",
      a: "両方です。いちばん手早く試せるのはホスト版のコンソール cloud.mosoo.ai です。ソースは Apache-2.0 で GitHub にあり、開発用にローカルで動かす方法は README にあります。",
    },
    {
      q: "先に Agent を作成する必要はありますか？",
      a: "ありません。/api/v2 では 1 つのリクエストに harness、プロバイダー、モデル、指示、入力を含めれば、Agent を作らずに永続的な Session が始まります。Agent プリセットは任意です。",
    },
    {
      q: "Session ではどの harness を使えますか？",
      a: "OpenAI Codex、Claude Agent SDK、OpenCode、Pi です。各 Session は harness、モデル、プロトコルを固定し、合わない組み合わせは実行前に拒否されます。",
    },
    {
      q: "プロバイダーキーは sandbox に入りますか？",
      a: "入りません。プロバイダーキーと MCP の認証情報は sandbox の外にあり、sandbox には期限付きの許可だけが渡ります。環境変数は sandbox 内のコードから読めます。",
    },
    {
      q: "モデルの利用料金はだれが払いますか？",
      a: "お客様が直接支払います。モデルのキーはプロジェクトに属し、料金はプロバイダーからお客様のアカウントに請求されます。mosoo はモデルを提供せず、支出上限も設けません。",
    },
    {
      q: "数日後に返信するとどうなりますか？",
      a: "同じ Session が続きます。sandbox が回収された後も、最後にコミットされたチェックポイントから作業ディレクトリ、会話、成果物を復元します。復元できなければエラーになります。",
    },
  ],
};

// ---------------------------------------------------------------------------
// The v4b "Paper" home (UI-FORMS §f b-paper; locked slots in v4b/UI-LOCK.md §4).
//
// Product objects (the U08 fragments, the U13 matrix) carry the main repo's own
// language: harness names, the run status, the files and the follow-up of the
// CSV acceptance workflow (scripts/public-api-session-workflow.ts). No IDs,
// hashes or timestamps; no mono token in a fragment.

const PAPER_EN = {
  // H1 slot A (ink) + B (soft); `join` sits between them in the text.
  hero: {
    titleInk: "A managed runtime", // A 1×18
    titleSoft: "for the Agents in your backend.", // B 2×22; A+B ≤9 words
    join: " ",
    lead: "One request starts a Session. Reply days later.", // C 2×30, ≤10 words, no numbers
    primary: "Try mosoo", // D
    secondary: "Source", // E
  },
  // U08: tab (A), chip (B1-B3), ghost line cut by the plate (C1-C3), two
  // controls (D1-D3: a word plus an optional count or caret), caption (E, F).
  stage: [
    {
      tab: "Call.",
      chip: "Codex",
      glyph: "openai-runtime",
      ghost: "Read the attached input.csv, then save outputs/report.md and chart.svg",
      controls: [{ label: "Files", count: "1" }, { label: "Inline", caret: true }],
      title: "One request, one Session.",
      body: "Harness, model, instructions and files in one call. No Agent needed.",
    },
    {
      tab: "Watch.",
      chip: "Running",
      glyph: "live",
      ghost: "Writing outputs/chart.svg while the events stream back over SSE",
      controls: [{ label: "Events" }, { label: "Cancel" }],
      title: "Watch it work.",
      body: "Events are saved, then streamed. Files land in outputs/.",
    },
    {
      tab: "Return.",
      chip: "Same Session",
      glyph: "openai-runtime",
      ghost: "Append south,20 to the CSV, then regenerate report.md and chart.svg",
      controls: [{ label: "Files", count: "3" }, { label: "Follow-up" }],
      title: "Come back days later.",
      body: "A reply seven days later continues the same Session, files intact.",
    },
  ],
  // U01: A 1×22, B 1×22 (≤5 words each, a turn between them), C 1×50 (≤10 words, no numbers).
  voice: { a: "The sandbox is gone.", b: "The Session stays.", sub: "Reply next week; it resumes where it stopped." },
  // U11 ×2: A 1×18 (mono caps), B 2×30 (≤10 words), C 2×32 (≤8 words). The quotes are
  // the two inputs of the CSV acceptance workflow, shortened.
  said: {
    label: "Sessions",
    cards: [
      {
        cat: "First turn",
        quote: "“Read input.csv and save a report to outputs/.”",
        result: "A fresh sandbox; the report lands in outputs/.",
      },
      {
        cat: "Seven days later",
        quote: "“Append south,20 to the CSV and redo the chart.”",
        result: "Same Session, same files, a new chart.",
      },
    ],
  },
  // U13: A 1×14, B / B′ 1×22 each (≤8 words), C runtime names as the README
  // writes them, D 1×14 (≤2 words: the model protocols each accepts), E 1×44.
  supply: {
    eyebrow: "Harnesses",
    titleInk: "Pick a harness.",
    titleSoft: "Keep your own key.",
    cats: ["Claude models", "Responses API", "All protocols", "All protocols"],
    wide: "Your provider key never enters the sandbox.",
  },
  // U16: A / A′ 2×18.
  faq: { titleInk: "Questions", titleSoft: "before you wire it in." },
  // Close: A 2×26 (≤6 words); buttons reuse D / E; F 1×52 (≤9 words, no price).
  close: { title: "Start your first Session.", fine: "mosoo is in Alpha. Public APIs may still change." },
};

// zh and ja: the same slots, written as short as each slot allows (CJK counts
// per full-width character; Latin product words stay Latin, as in the docs).
const PAPER_ZH = {
  hero: {
    titleInk: "托管的 Agent runtime",
    titleSoft: "为应用后端而建。",
    join: "",
    lead: "一个请求启动 Session，几天后接着回复。",
    primary: "试用 mosoo",
    secondary: "源码",
  },
  stage: [
    {
      tab: "发起。",
      chip: "Codex",
      glyph: "openai-runtime",
      ghost: "读取附件 input.csv，把 outputs/report.md 和 outputs/chart.svg 存好",
      controls: [{ label: "文件", count: "1" }, { label: "内联", caret: true }],
      title: "一个请求，一个 Session。",
      body: "一次调用带上 harness、模型和文件。",
    },
    {
      tab: "观察。",
      chip: "运行中",
      glyph: "live",
      ghost: "正在写入 outputs/chart.svg，事件通过 SSE 实时回传",
      controls: [{ label: "事件" }, { label: "取消" }],
      title: "看它干活。",
      body: "事件先保存再推送，文件落在 outputs/ 里。",
    },
    {
      tab: "回来。",
      chip: "同一 Session",
      glyph: "openai-runtime",
      ghost: "在 CSV 末尾追加 south,20，然后重新生成 report.md 和 chart.svg",
      controls: [{ label: "文件", count: "3" }, { label: "追问" }],
      title: "几天后再回来。",
      body: "七天后回复，还是同一个 Session，文件都在。",
    },
  ],
  voice: { a: "sandbox 回收了，", b: "Session 还在。", sub: "下周再回复，从停下的地方接着做。" },
  said: {
    label: "Session 示例",
    cards: [
      { cat: "第一轮", quote: "“读取 input.csv，把报告存进 outputs/。”", result: "全新的 sandbox，报告落在 outputs/。" },
      { cat: "七天后", quote: "“在 CSV 里追加 south,20，重画图表。”", result: "同一个 Session，文件都在，图表换新。" },
    ],
  },
  supply: {
    eyebrow: "Harness",
    titleInk: "选一个 harness，",
    titleSoft: "密钥用你自己的。",
    cats: ["Claude 模型", "Responses API", "全部协议", "全部协议"],
    wide: "你的模型供应商密钥从不进入 sandbox。",
  },
  faq: { titleInk: "常见问题", titleSoft: "接入之前先看看。" },
  close: { title: "启动你的第一个 Session。", fine: "mosoo 目前处于 Alpha 阶段，公开 API 仍可能变化。" },
};

const PAPER_JA = {
  hero: {
    titleInk: "マネージド runtime、",
    titleSoft: "バックエンドの Agent のために。",
    join: "",
    lead: "リクエスト一つで、数日後まで続く。",
    primary: "mosoo を試す",
    secondary: "ソース",
  },
  stage: [
    {
      tab: "呼ぶ。",
      chip: "Codex",
      glyph: "openai-runtime",
      ghost: "添付の input.csv を読み、report.md と chart.svg を outputs/ に保存して",
      controls: [{ label: "ファイル", count: "1" }, { label: "インライン", caret: true }],
      title: "1 リクエストで 1 Session。",
      body: "harness もモデルもファイルも一度に。",
    },
    {
      tab: "見る。",
      chip: "実行中",
      glyph: "live",
      ghost: "outputs/chart.svg を書き込み中。イベントは SSE で届きます",
      controls: [{ label: "イベント" }, { label: "キャンセル" }],
      title: "動くところを見る。",
      body: "イベントは保存してから配信。ファイルは outputs/ に。",
    },
    {
      tab: "戻る。",
      chip: "同じ Session",
      glyph: "openai-runtime",
      ghost: "CSV に south,20 を追加して、report.md と chart.svg を作り直して",
      controls: [{ label: "ファイル", count: "3" }, { label: "返信" }],
      title: "数日後に戻る。",
      body: "7 日後の返信も同じ Session で。ファイルもそのままです。",
    },
  ],
  voice: { a: "sandbox は消えても、", b: "Session は残る。", sub: "来週返信しても、止まったところから続きます。" },
  said: {
    label: "Session の例",
    cards: [
      { cat: "最初の turn", quote: "「input.csv を読み、レポートを outputs/ に保存」", result: "専用の sandbox。レポートは outputs/ に。" },
      { cat: "7 日後", quote: "「CSV に south,20 を足して、グラフを作り直して」", result: "同じ Session、同じファイル、新しいグラフ。" },
    ],
  },
  supply: {
    eyebrow: "Harness",
    titleInk: "harness を選ぶ。",
    titleSoft: "キーは自分のものを。",
    cats: ["Claude モデル", "Responses API", "全プロトコル", "全プロトコル"],
    wide: "プロバイダーキーは sandbox に入りません。",
  },
  faq: { titleInk: "よくある質問", titleSoft: "組み込む前に。" },
  close: { title: "最初の Session を始めよう。", fine: "mosoo は現在 Alpha 版です。公開 API は変更される可能性があります。" },
};

const PAPER = { en: PAPER_EN, zh: PAPER_ZH, ja: PAPER_JA };

// The four harnesses, in the U13 order; names as README line 9 writes them.
const HARNESSES = [
  { name: "Claude Agent SDK", glyph: "claude-agent-sdk" },
  { name: "OpenAI Codex", glyph: "openai-runtime" },
  { name: "OpenCode", glyph: "acp-fallback" },
  { name: "Pi", glyph: "pi" },
];

export const HOME_LOCALES = Object.keys(PAPER);

function metaFor(locale) {
  const meta = META[locale];
  if (!meta) throw new Error(`Unsupported home locale: ${locale}`);
  return meta;
}

export function homeFaq(locale) {
  metaFor(locale);
  return FAQ[locale];
}

/** The h1 as text: slot A, then slot B. */
export function homeHeadline(locale) {
  metaFor(locale);
  const { titleInk, titleSoft, join } = PAPER[locale].hero;
  return `${titleInk}${join}${titleSoft}`;
}

/** README line 8, the line the meta description and the JSON-LD lead with. */
export function homePositioning(locale) {
  return metaFor(locale).positioning;
}

// ---------------------------------------------------------------------------
// HTML

const escapeText = (value) =>
  String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const escapeAttribute = (value) => escapeText(value).replaceAll('"', "&quot;");

// FAQ answers stay plain text so the visible answer and the FAQPage JSON-LD
// carry identical text content; code styling and one link are markup only.
const FAQ_CODE = /\/api\/v[12]\b|outputs\/|Idempotency-Key|runtime\.capacity_exhausted/g;
function faqAnswer(value) {
  return escapeText(value)
    .replace(FAQ_CODE, (token) => `<code translate="no">${token}</code>`)
    .replace("cloud.mosoo.ai", `<a href="${LINKS.console}">cloud.mosoo.ai</a>`);
}

const GITHUB_MARK =
  '<svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';

// Runtime glyphs are masks painted in ink (paper.css .pp-gm), one weight for all four.
const glyph = (id) => `<span class="pp-gm pp-gm-${id}" aria-hidden="true"></span>`;

// A drawn caret for a control that opens a menu (Inter has no U+2304).
const CARET = '<svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>';
const control = ({ label, count, caret }) =>
  `<span class="pp-pill">${escapeText(label)}${count ? `<b>${escapeText(count)}</b>` : ""}${caret ? CARET : ""}</span>`;

function renderPaperActions(copy) {
  return `<div class="pp-actions">
<a class="pp-btn pp-btn-ink" href="${LINKS.console}">${escapeText(copy.hero.primary)}</a>
<a class="pp-btn pp-btn-line" href="${LINKS.github}">${GITHUB_MARK}${escapeText(copy.hero.secondary)}</a>
</div>`;
}

function renderPaperHero(copy) {
  const tabs = copy.stage
    .map(
      (step, i) =>
        `<button class="pp-tab" type="button" role="tab" id="pp-tab-${i}" aria-controls="pp-panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab><span class="pp-tab-track"><span class="pp-tab-bar" data-tab-bar></span></span>${escapeText(step.tab)}</button>`,
    )
    .join("\n");
  const frags = copy.stage
    .map((step, i) => {
      const icon = step.glyph === "live" ? '<span class="pp-live"></span>' : glyph(step.glyph);
      return `<div class="pp-frag" data-frag data-product-ui aria-hidden="true"${i === 0 ? "" : " hidden"}>
<span class="pp-chip"><span class="pp-chip-ic">${icon}</span>${escapeText(step.chip)}</span>
<p class="pp-ghost">${escapeText(step.ghost)}</p>
<div class="pp-ctl"><span class="pp-plus">+</span>${step.controls.map(control).join("")}</div>
</div>`;
    })
    .join("\n");
  const panels = copy.stage
    .map(
      (step, i) =>
        `<div class="pp-cap" role="tabpanel" id="pp-panel-${i}" aria-labelledby="pp-tab-${i}" data-panel${i === 0 ? "" : " hidden"}><h2>${escapeText(step.title)}</h2><p>${escapeText(step.body)}</p></div>`,
    )
    .join("\n");
  return `<section class="pp-hero pp-wrap" aria-labelledby="hero-title">
<div class="pp-hero-top">
<h1 id="hero-title" class="pp-h1 pp-display">${escapeText(copy.hero.titleInk)}${copy.hero.join}<span class="pp-soft">${escapeText(copy.hero.titleSoft)}</span></h1>
<div class="pp-hero-side">
<p class="pp-lead">${escapeText(copy.hero.lead)}</p>
${renderPaperActions(copy)}
</div>
</div>
<div class="pp-stage" data-effect="tabs">
<div class="pp-tabs" role="tablist">
${tabs}
</div>
<div class="pp-plate">
${frags}
</div>
${panels}
</div>
</section>`;
}

function renderPaperVoice(copy) {
  const line = (text) =>
    `<span class="pp-fill-line"><span class="pp-fill-base">${escapeText(text)}</span><span class="pp-fill-ink" aria-hidden="true" data-fill-ink>${escapeText(text)}</span></span>`;
  return `<section class="pp-section pp-wrap pp-voice" data-effect="fill" aria-label="${escapeAttribute(`${copy.voice.a}${copy.hero.join}${copy.voice.b}`)}">
<p class="pp-voice-q pp-display">${line(copy.voice.a)}${line(copy.voice.b)}</p>
<p class="pp-voice-sub">${escapeText(copy.voice.sub)}</p>
</section>`;
}

function renderPaperSaid(copy) {
  const cards = copy.said.cards
    .map(
      (card) => `<figure class="pp-said-card">
<figcaption class="pp-said-cat">${escapeText(card.cat)}</figcaption>
<blockquote class="pp-display">${escapeText(card.quote)}</blockquote>
<p class="pp-said-res">${escapeText(card.result)}</p>
</figure>`,
    )
    .join("\n");
  return `<section id="sessions" class="pp-section pp-wrap pp-said" aria-label="${escapeAttribute(copy.said.label)}">
${cards}
</section>`;
}

function renderPaperSupply(copy) {
  const cells = HARNESSES.map(
    (harness, i) =>
      `<div><span class="pp-ib">${glyph(harness.glyph)}</span><div><p class="pp-mx-name" translate="no">${escapeText(harness.name)}</p><p class="pp-mx-cat">${escapeText(copy.supply.cats[i])}</p></div></div>`,
  ).join("\n");
  return `<section id="runtimes" class="pp-section pp-wrap" aria-labelledby="supply-title">
<div class="pp-supply">
<p class="pp-eyebrow"><i></i>${escapeText(copy.supply.eyebrow)}</p>
<h2 id="supply-title" class="pp-h2-40 pp-display">${escapeText(copy.supply.titleInk)}${copy.hero.join}<br><span class="pp-soft">${escapeText(copy.supply.titleSoft)}</span></h2>
<div class="pp-mx" data-product-ui>
<i class="pp-hdl pp-hdl-1"></i><i class="pp-hdl pp-hdl-2"></i><i class="pp-hdl pp-hdl-3"></i><i class="pp-hdl pp-hdl-4"></i>
${cells}
<div class="pp-mx-wide"><span class="pp-ib">${glyph("key")}</span><p class="pp-mx-name">${escapeText(copy.supply.wide)}</p></div>
</div>
</div>
</section>`;
}

function renderPaperFaq(locale, copy) {
  const indicator = `<svg class="pp-ind" viewBox="${OUTLINE.faq.viewBox}" aria-hidden="true"><path class="pp-ind-win" d="${OUTLINE.faq.d}" stroke="currentColor" stroke-width="1"/><path d="${OUTLINE.faq.base}" stroke="currentColor" stroke-width="1"/></svg>`;
  const rows = FAQ[locale]
    .map(
      ({ q, a }, i) =>
        `<details class="pp-q" name="faq"${i === 0 ? " open" : ""}><summary>${indicator}${escapeText(q)}</summary><p class="pp-a">${faqAnswer(a)}</p></details>`,
    )
    .join("\n");
  return `<section id="faq" class="pp-section pp-wrap pp-faq" aria-labelledby="faq-title">
<h2 id="faq-title" class="pp-h2-44 pp-display">${escapeText(copy.faq.titleInk)}${copy.hero.join}<br><span class="pp-soft">${escapeText(copy.faq.titleSoft)}</span></h2>
<div class="pp-rows">
${rows}
</div>
</section>`;
}

function renderPaperClose(copy) {
  return `<section id="start" class="pp-section pp-wrap pp-close" aria-labelledby="close-title">
<h2 id="close-title" class="pp-display">${escapeText(copy.close.title)}</h2>
${renderPaperActions(copy)}
<p class="pp-fine">${escapeText(copy.close.fine)}</p>
</section>`;
}

const HOME_LANGUAGE_HREFS = { en: "/en", zh: "/zh", ja: "/ja" };

export function renderHomeFallback(locale) {
  metaFor(locale);
  const copy = PAPER[locale];
  return `<div class="pp-page">
${renderPaperNav({ locale })}
<main id="main" tabindex="-1">
${renderPaperHero(copy)}
${renderPaperVoice(copy)}
${renderPaperSaid(copy)}
${renderPaperSupply(copy)}
${renderPaperFaq(locale, copy)}
${renderPaperClose(copy)}
</main>
${renderPaperFooter({ locale, languageHrefs: HOME_LANGUAGE_HREFS })}
</div>`;
}

// ---------------------------------------------------------------------------
// JSON-LD

export function homeStructuredData(locale) {
  const meta = metaFor(locale);
  const url = `${SITE}/${locale}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE}/#organization`,
        name: "LangGenius",
        legalName: "LangGenius, Inc.",
        url: "https://github.com/langgenius",
        sameAs: ["https://github.com/langgenius"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        name: "mosoo",
        alternateName: "mosoo AI",
        url: `${SITE}/`,
        inLanguage: LANGUAGES.map((language) => language.lang),
        publisher: { "@id": `${SITE}/#organization` },
        about: { "@id": `${SITE}/#software` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE}/#software`,
        name: "mosoo",
        alternateName: "mosoo AI",
        url,
        inLanguage: meta.lang,
        description: meta.description,
        applicationCategory: "DeveloperApplication",
        applicationSubCategory: "Managed Agent runtime",
        operatingSystem: "Web",
        codeRepository: GITHUB,
        license: LINKS.license,
        softwareHelp: { "@type": "CreativeWork", url: meta.help },
        releaseNotes: LINKS.releases,
        featureList: meta.features,
        publisher: { "@id": `${SITE}/#organization` },
        sameAs: [GITHUB, LINKS.x],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        url,
        inLanguage: meta.lang,
        isPartOf: { "@id": `${SITE}/#website` },
        about: { "@id": `${SITE}/#software` },
        mainEntity: FAQ[locale].map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };
}

// Every "<" is written as < so no string can close the script element.
export function renderHomeJsonLd(locale) {
  const json = JSON.stringify(homeStructuredData(locale), null, 2).replaceAll("<", "\\u003c");
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

// The page's own stylesheet (paper.css) arrives as a <link> from the Vite
// build; this only keeps the first paint on paper instead of white.
export const HOME_FALLBACK_STYLE = `<style>html,body{margin:0;background:#f8f7f4}</style>`;
