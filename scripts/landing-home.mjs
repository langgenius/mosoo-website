// The v4c home for /en, /zh and /ja: the static page (apps/landing/src/home/markup.ts, which reads every
// visible string from apps/landing/src/home/copy.ts) and the JSON-LD @graph. The page works without
// JavaScript; src/main.tsx only adds the effects.
//
// One source for the FAQ: copy.ts. The page shows it in native <details name="faq">, the FAQPage JSON-LD
// carries the same strings, and llms.txt (src/worker.js, "Direct answers") repeats them (tests keep the
// three equal). The SoftwareApplication description is the README L8-L9 positioning (copy.ts meta).
// Do not add facts here that the main repo (langgenius/mosoo) does not state.

import { HOME_COPY } from "../apps/landing/src/home/copy.ts";
import { renderHome } from "../apps/landing/src/home/markup.ts";

const SITE = "https://mosoo.ai";
const GITHUB = "https://github.com/langgenius/mosoo";

const LINKS = {
  releases: `${GITHUB}/releases`,
  license: `${GITHUB}/blob/main/LICENSE`,
  x: "https://x.com/mosooagent",
};

const LANGUAGES = [
  { locale: "en", lang: "en" },
  { locale: "zh", lang: "zh-CN" },
  { locale: "ja", lang: "ja" },
];

// featureList (metadata only, not a page slot): README L9 and L26, docs/SPEC.md L25, L31, L53, L65.
const FEATURES = {
  en: [
    "Start a Session without creating an Agent",
    "Choose OpenAI Codex, Claude Agent SDK, OpenCode, or Pi per Session",
    "Continue the same Session minutes or days later",
    "A turn succeeds only when its events, usage, and a checkpoint are committed",
    "Provider keys and MCP credentials stay outside the sandbox",
    "Input attachments, downloadable artifacts, and SSE event streams",
    "Bring your own model provider keys",
    "Usage recorded for every model call",
  ],
  zh: [
    "无需创建 Agent 即可启动 Session",
    "每个 Session 可选 OpenAI Codex、Claude Agent SDK、OpenCode 或 Pi",
    "几分钟或几天后在同一个 Session 中继续",
    "事件、用量和检查点一起提交后，turn 才算成功",
    "模型供应商密钥和 MCP 凭据留在 sandbox 之外",
    "输入附件、可下载的产出物和 SSE 事件流",
    "使用你自己的模型供应商密钥",
    "每次模型调用都记录用量",
  ],
  ja: [
    "Agent を作成せずに Session を開始",
    "Session ごとに OpenAI Codex、Claude Agent SDK、OpenCode、Pi から選択",
    "数分後でも数日後でも同じ Session で続行",
    "イベント、使用量、チェックポイントがコミットされて初めて turn が成功",
    "プロバイダーキーと MCP の認証情報は sandbox の外",
    "入力の添付ファイル、ダウンロードできる成果物、SSE イベントストリーム",
    "ご自身のモデルプロバイダーキーを使用",
    "モデル呼び出しごとに使用量を記録",
  ],
};

export const HOME_LOCALES = Object.keys(HOME_COPY);

function copyFor(locale) {
  const copy = HOME_COPY[locale];
  if (!copy) throw new Error(`Unsupported home locale: ${locale}`);
  return copy;
}

const langOf = (locale) => LANGUAGES.find((language) => language.locale === locale)?.lang ?? locale;

/** The FAQ a reader sees; the FAQPage JSON-LD and llms.txt carry the same strings. */
export function homeFaq(locale) {
  return copyFor(locale).faq.items;
}

/** The page's one h1 (two lines of the locked hero). */
export function homeHeadline(locale) {
  const { lineA, lineB } = copyFor(locale).hero;
  return `${lineA} ${lineB}`;
}

/** README L8-L9: the meta description and the SoftwareApplication description. */
export function homeDescription(locale) {
  return copyFor(locale).meta.description;
}

export function renderHomeFallback(locale) {
  copyFor(locale);
  return renderHome(locale);
}

export function homeStructuredData(locale) {
  const copy = copyFor(locale);
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
        description: copy.meta.description,
        applicationCategory: "DeveloperApplication",
        applicationSubCategory: "Managed Agent runtime",
        operatingSystem: "Web",
        codeRepository: GITHUB,
        license: LINKS.license,
        softwareHelp: { "@type": "CreativeWork", url: copy.nav.docsHref },
        releaseNotes: LINKS.releases,
        featureList: FEATURES[locale],
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

// The v4c home links its real stylesheets (src/shared/styles/v4.css, src/home/home.css) from the page
// head, so the no-JS page needs no inline fallback styles.
export const HOME_FALLBACK_STYLE = "";
