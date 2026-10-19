// The v5 home for /en, /zh and /ja: the static page and the JSON-LD @graph. The page is
// apps/landing/src/home/markup.ts, which reads every visible string from the per-section copy files in
// apps/landing/src/home/copy/ (loader: copy.ts); it is complete without JavaScript, and src/main.tsx only adds
// the motion. Node imports those TypeScript and JSON modules as they are (type stripping, import attributes).
//
// One source for the FAQ: copy/faq.json. The page shows it in native <details name="faq">, the FAQPage JSON-LD
// carries the same strings, and llms.txt (src/worker.js, "Direct answers") repeats the en ones; the tests keep the
// three equal. The metadata below (positioning, description, featureList) is not a page slot: it comes from the
// main repo (README L8-L9, docs/SPEC.md) through the v1 copy deck. Do not add facts the main repo does not state.

import { HOME_COPY, HOME_LOCALES as LOCALES, LANGUAGES } from "../apps/landing/src/home/copy.ts";
import { renderHome } from "../apps/landing/src/home/markup.ts";

const SITE = "https://mosoo.ai";
const GITHUB = "https://github.com/langgenius/mosoo";

const LINKS = {
  releases: `${GITHUB}/releases`,
  license: `${GITHUB}/blob/main/LICENSE`,
  x: "https://x.com/mosooagent",
};

// README L8 (positioning; it leads the description) and L9 (the four runtimes), per locale; docs root per
// locale; featureList from README L9 / L26 and docs/SPEC.md L25, L31, L53, L65. Same values as v4d (9e92312).
const META = {
  en: {
    positioning: "An open-source, API-first managed Agent runtime for application backends.",
    description:
      "An open-source, API-first managed Agent runtime for application backends. It runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.",
    help: "https://mosoo.ai/docs/",
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
    positioning: "开源、API 优先的托管 Agent runtime，面向应用后端。",
    description:
      "开源、API 优先的托管 Agent runtime，面向应用后端。它用一个 API 运行 OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi，每个 Session 都在自己的 sandbox 中执行。",
    help: "https://mosoo.ai/docs/zh-Hans/",
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
    positioning: "バックエンド向け、OSS で API ファーストなマネージド Agent runtime。",
    description:
      "バックエンド向け、OSS で API ファーストなマネージド Agent runtime。OpenAI Codex、Claude Agent SDK、OpenCode、Pi を 1 つの API で実行し、Session ごとに専用の sandbox を使います。",
    help: "https://mosoo.ai/docs/ja/",
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

export const HOME_LOCALES = [...LOCALES];

function copyFor(locale) {
  const copy = HOME_COPY[locale];
  if (!copy || !META[locale]) throw new Error(`Unsupported home locale: ${locale}`);
  return copy;
}

const langOf = (locale) => LANGUAGES.find((language) => language.locale === locale)?.lang ?? locale;

/** The FAQ a reader sees; the FAQPage JSON-LD and llms.txt carry the same strings. */
export function homeFaq(locale) {
  return copyFor(locale).faq.items.map(({ q, a }) => ({ q, a }));
}

/** The page's one h1: both lines of the two-tone headline. */
export function homeHeadline(locale) {
  const { h1a, h1b } = copyFor(locale).hero;
  return `${h1a} ${h1b}`;
}

/** The README positioning line (L8) that leads the JSON-LD description. */
export function homePositioning(locale) {
  copyFor(locale);
  return META[locale].positioning;
}

export function renderHomeFallback(locale) {
  copyFor(locale);
  return renderHome(locale);
}

export function homeStructuredData(locale) {
  copyFor(locale);
  const meta = META[locale];
  const url = `${SITE}/${locale}`;
  const lang = langOf(locale);
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
        inLanguage: lang,
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
        inLanguage: lang,
        isPartOf: { "@id": `${SITE}/#website` },
        about: { "@id": `${SITE}/#software` },
        mainEntity: homeFaq(locale).map(({ q, a }) => ({
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
