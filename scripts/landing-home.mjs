// Home page for the crawlable static HTML in /en, /zh and /ja: the page a
// reader without JavaScript sees inside #root (and every reader sees until
// React mounts), plus the JSON-LD @graph. It renders the same sections, class
// names and copy as the React home (apps/landing/src/routes/login/landing/
// landing.tsx), so the linked d-object.css lays it out the same way.
//
// The page copy is apps/landing/src/routes/login/landing/home-copy.json, the
// file the React home reads, written to the slots in staging v4d/UI-LOCK.md.
// The FAQ there is the FAQ the FAQPage JSON-LD carries and llms.txt repeats.
// The shell strings below (nav, footer, JSON-LD) come from the v1 copy deck,
// drawn from langgenius/mosoo (README, docs/SPEC.md). Do not add facts here
// that the main repo does not state.

import { readFileSync } from "node:fs";

import HOME_COPY from "../apps/landing/src/routes/login/landing/home-copy.json" with { type: "json" };

const SITE = "https://mosoo.ai";
const CONSOLE = "https://cloud.mosoo.ai";
const GITHUB = "https://github.com/langgenius/mosoo";

const LINKS = {
  console: CONSOLE,
  signIn: `${CONSOLE}/login`,
  computer: "https://computer.mosoo.ai",
  github: GITHUB,
  spec: `${GITHUB}/blob/main/docs/SPEC.md`,
  releases: `${GITHUB}/releases`,
  license: `${GITHUB}/blob/main/LICENSE`,
  security: `${GITHUB}/security`,
  issues: `${GITHUB}/issues`,
  incidents: `${GITHUB}/tree/main/docs/operations/incidents`,
  driver: "https://github.com/langgenius/mosoo-agent-driver",
  openApiV2: `${CONSOLE}/api/v2/openapi.json`,
  openApiV1: `${CONSOLE}/api/v1/openapi.json`,
  changelog: `${SITE}/docs/changelog/`,
  llms: `${SITE}/llms.txt`,
  x: "https://x.com/mosooagent",
};

const LANGUAGES = [
  { locale: "en", lang: "en", label: "English" },
  { locale: "zh", lang: "zh-CN", label: "简体中文" },
  { locale: "ja", lang: "ja", label: "日本語" },
];

// Per-locale shell: links, nav and footer labels, JSON-LD. The footer groups
// follow apps/landing/src/shared/ui/site-footer.tsx in order.
const SHELL = {
  "en": {
    "lang": "en",
    "docs": "https://mosoo.ai/docs/",
    "quickstart": "https://mosoo.ai/docs/quickstart/",
    "apiReferenceV2": "https://mosoo.ai/docs/api-reference-v2/",
    "cli": "https://mosoo.ai/docs/cli/overview/",
    "blog": "https://mosoo.ai/blog",
    "health": "/health",
    "nav": {
      "home": "mosoo home",
      "docs": "Docs",
      "useCases": "Use cases",
      "github": "mosoo on GitHub",
      "signIn": "Sign in",
      "skip": "Skip to content",
      "language": "Change language"
    },
    "footer": {
      "descriptor": "An open-source, API-first managed Agent runtime for application backends.",
      "groups": [
        [
          "Product",
          [
            "mosoo console",
            "Mosoo Computer",
            "Use cases",
            "Status"
          ]
        ],
        [
          "Developers",
          [
            "Docs",
            "Quickstart",
            "API reference v2",
            "OpenAPI v2",
            "OpenAPI v1",
            "CLI",
            "Changelog",
            "llms.txt"
          ]
        ],
        [
          "Open source",
          [
            "GitHub",
            "Releases",
            "Product spec",
            "Agent Driver",
            "License",
            "Security",
            "Incident postmortems"
          ]
        ],
        [
          "Community",
          [
            "Blog",
            "X",
            "GitHub Issues"
          ]
        ]
      ],
      "copyright": "© 2026 LangGenius, Inc."
    },
    "jsonLd": {
      "description": "An open-source, API-first managed Agent runtime for application backends. It runs OpenAI Codex, Claude Agent SDK, OpenCode, and Pi behind one API, each Session in its own sandbox.",
      "help": "https://mosoo.ai/docs/",
      "features": [
        "Start a Session without creating an Agent",
        "Choose OpenAI Codex, Claude Agent SDK, OpenCode, or Pi per Session",
        "Continue the same Session minutes or days later",
        "A turn succeeds only when its events, usage, and a checkpoint are committed",
        "Provider keys and MCP credentials stay outside the sandbox",
        "Input attachments, downloadable artifacts, and SSE event streams",
        "Bring your own model provider keys",
        "Usage recorded for every model call"
      ]
    }
  },
  "zh": {
    "lang": "zh-CN",
    "docs": "https://mosoo.ai/docs/zh-Hans/",
    "quickstart": "https://mosoo.ai/docs/zh-Hans/quickstart/",
    "apiReferenceV2": "https://mosoo.ai/docs/zh-Hans/api-reference-v2/",
    "cli": "https://mosoo.ai/docs/zh-Hans/cli/overview/",
    "blog": "https://mosoo.ai/blog/zh",
    "health": "/zh/health",
    "nav": {
      "home": "mosoo 首页",
      "docs": "文档",
      "useCases": "用例",
      "github": "mosoo 的 GitHub 主页",
      "signIn": "登录",
      "skip": "跳到正文",
      "language": "切换语言"
    },
    "footer": {
      "descriptor": "开源、API 优先的托管 Agent runtime，面向应用后端。",
      "groups": [
        [
          "产品",
          [
            "mosoo 控制台",
            "Mosoo Computer",
            "用例",
            "状态"
          ]
        ],
        [
          "开发者",
          [
            "文档",
            "快速开始",
            "API 参考 v2",
            "OpenAPI v2",
            "OpenAPI v1",
            "CLI",
            "更新日志",
            "llms.txt"
          ]
        ],
        [
          "开源",
          [
            "GitHub",
            "版本发布",
            "产品规格",
            "Agent Driver",
            "许可证",
            "安全",
            "事故复盘"
          ]
        ],
        [
          "社区",
          [
            "博客",
            "X",
            "GitHub Issues"
          ]
        ]
      ],
      "copyright": "© 2026 LangGenius, Inc."
    },
    "jsonLd": {
      "description": "开源、API 优先的托管 Agent runtime，面向应用后端。它用一个 API 运行 OpenAI Codex、Claude Agent SDK、OpenCode 和 Pi，每个 Session 都在自己的 sandbox 中执行。",
      "help": "https://mosoo.ai/docs/zh-Hans/",
      "features": [
        "无需创建 Agent 即可启动 Session",
        "每个 Session 可选 OpenAI Codex、Claude Agent SDK、OpenCode 或 Pi",
        "几分钟或几天后在同一个 Session 中继续",
        "事件、用量和检查点一起提交后，turn 才算成功",
        "模型供应商密钥和 MCP 凭据留在 sandbox 之外",
        "输入附件、可下载的产出物和 SSE 事件流",
        "使用你自己的模型供应商密钥",
        "每次模型调用都记录用量"
      ]
    }
  },
  "ja": {
    "lang": "ja",
    "docs": "https://mosoo.ai/docs/ja/",
    "quickstart": "https://mosoo.ai/docs/ja/quickstart/",
    "apiReferenceV2": "https://mosoo.ai/docs/ja/api-reference-v2/",
    "cli": "https://mosoo.ai/docs/ja/cli/overview/",
    "blog": "https://mosoo.ai/blog/ja",
    "health": "/ja/health",
    "nav": {
      "home": "mosoo ホーム",
      "docs": "ドキュメント",
      "useCases": "ユースケース",
      "github": "mosoo の GitHub",
      "signIn": "ログイン",
      "skip": "本文へスキップ",
      "language": "言語を切り替える"
    },
    "footer": {
      "descriptor": "アプリケーションのバックエンドのための、オープンソースで API ファーストなマネージド Agent runtime。",
      "groups": [
        [
          "プロダクト",
          [
            "mosoo コンソール",
            "Mosoo Computer",
            "ユースケース",
            "稼働状況"
          ]
        ],
        [
          "開発者向け",
          [
            "ドキュメント",
            "クイックスタート",
            "API リファレンス v2",
            "OpenAPI v2",
            "OpenAPI v1",
            "CLI",
            "更新履歴",
            "llms.txt"
          ]
        ],
        [
          "オープンソース",
          [
            "GitHub",
            "リリース",
            "製品仕様",
            "Agent Driver",
            "ライセンス",
            "セキュリティ",
            "インシデントの事後分析"
          ]
        ],
        [
          "コミュニティ",
          [
            "ブログ",
            "X",
            "GitHub Issues"
          ]
        ]
      ],
      "copyright": "© 2026 LangGenius, Inc."
    },
    "jsonLd": {
      "description": "アプリケーションのバックエンドのための、オープンソースで API ファーストなマネージド Agent runtime。OpenAI Codex、Claude Agent SDK、OpenCode、Pi を 1 つの API で実行し、Session ごとに専用の sandbox を使います。",
      "help": "https://mosoo.ai/docs/ja/",
      "features": [
        "Agent を作成せずに Session を開始",
        "Session ごとに OpenAI Codex、Claude Agent SDK、OpenCode、Pi から選択",
        "数分後でも数日後でも同じ Session で続行",
        "イベント、使用量、チェックポイントがコミットされて初めて turn が成功",
        "プロバイダーキーと MCP の認証情報は sandbox の外",
        "入力の添付ファイル、ダウンロードできる成果物、SSE イベントストリーム",
        "ご自身のモデルプロバイダーキーを使用",
        "モデル呼び出しごとに使用量を記録"
      ]
    }
  }
};

// The outline path data the React page draws (generated by
// apps/landing/scripts/assets/outline.mjs), read so both pages share one shape.
const OUTLINE = Object.fromEntries(
  [
    ...readFileSync(new URL("../apps/landing/src/shared/ui/outline-paths.generated.ts", import.meta.url), "utf8").matchAll(
      /^export const (\w+) = (\{.*\}) as const;$/gm,
    ),
  ].map((match) => [match[1], JSON.parse(match[2])]),
);
const INK = "#1a1a1c";

// The same braille frames as landing.tsx (three cells per frame, offsets
// 0 / 3 / 6 on one eight-step cycle); decorative, aria-hidden.
const GLYPH_CYCLES = [
  ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"],
  ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧"],
  ["⠀", "⠄", "⠤", "⠦", "⠶", "⠷", "⠿", "⠷"],
];
const GLYPH_FRAMES = GLYPH_CYCLES.map((cycle) =>
  cycle.map((_, k) => `${cycle[k]}${cycle[(k + 3) % 8]}${cycle[(k + 6) % 8]}`),
);
// home-copy.ts: the Resume card carries the one green dot.
const LIVE_CARD = 1;

export const HOME_LOCALES = Object.keys(SHELL);

function copyFor(locale) {
  const shell = SHELL[locale];
  const page = HOME_COPY[locale];
  if (!shell || !page) throw new Error(`Unsupported home locale: ${locale}`);
  return { shell, page };
}

export function homeFaq(locale) {
  return copyFor(locale).page.faq.items.map(({ q, a }) => ({ q, a }));
}

/** The page's one h1: both lines of the two-tone headline. */
export function homeHeadline(locale) {
  const { hero } = copyFor(locale).page;
  return `${hero.h1a} ${hero.h1b}`;
}

/** The README positioning line (L8) that leads the JSON-LD description. */
export function homePositioning(locale) {
  return copyFor(locale).shell.footer.descriptor;
}

// ---------------------------------------------------------------------------
// HTML

const escapeText = (value) =>
  String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const escapeAttribute = (value) => escapeText(value).replaceAll('"', "&quot;");

function link(href, label, attributes = "") {
  return `<a href="${escapeAttribute(href)}"${attributes}>${escapeText(label)}</a>`;
}

const corners = (className) =>
  [1, 2, 3, 4].map((n) => `<i aria-hidden="true" class="${className} c${n}"></i>`).join("");

const path = (d, extra = "") =>
  `<path d="${d}" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke"${extra} />`;

const LOGO_MARK = `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 51.51 51.52" fill="currentColor"><path d="M0 0H51.51C50.58 5.95 50.04 12.97 50.04 20.48C50.04 27.99 50.58 35.01 51.51 40.96H0C0.93 35.01 1.47 27.99 1.47 20.48C1.47 12.97 0.93 5.95 0 0Z" /><rect x="0" y="44.59" width="51.51" height="6.93" /></svg>`;

function renderNav(locale, shell) {
  return `<header class="d-nav">
<a href="/${locale}" class="d-nav-brand" aria-label="${escapeAttribute(shell.nav.home)}">${LOGO_MARK}<span aria-hidden="true">mosoo</span></a>
<nav aria-label="Primary site links" class="d-nav-links">
${link(shell.docs, shell.nav.docs)}
${link(`/${locale}/use-cases`, shell.nav.useCases, ' class="d-hide-sm"')}
${link(LINKS.github, "GitHub", ' translate="no" class="d-hide-sm"')}
${link(LINKS.signIn, shell.nav.signIn)}
</nav>
</header>`;
}

function renderHero(shell, page) {
  const { hero, object } = page;
  const [w, h] = OUTLINE.OUTLINE_WINDOW.vb;
  const satellites = object.satellites
    .map(
      (sat, index) => `<div class="d-sat s${index + 1}" data-sat>${corners("d-sat-c")}<p class="d-sat-k">${escapeText(sat.key)}</p><p class="d-sat-v">${escapeText(sat.value)}</p></div>`,
    )
    .join("\n");
  // No data-dock here: the docked layout is the CSS default, the end state.
  return `<section id="hero" aria-labelledby="hero-title" class="d-hero">
<h1 id="hero-title" class="d-h1"><span>${escapeText(hero.h1a)}</span> <span class="d-soft">${escapeText(hero.h1b)}</span></h1>
<p class="d-lead">${escapeText(hero.lead)}</p>
<div class="d-actions">${link(LINKS.console, hero.primary, ' class="d-btn"')}<a href="${escapeAttribute(shell.quickstart)}" class="d-btn-text">${escapeText(hero.secondary)}<span aria-hidden="true">→</span></a></div>
<div class="d-stage" data-product-ui>
<div class="d-win" style="aspect-ratio:${w} / ${h}"><div aria-hidden="true" class="d-win-fill d-grain"></div><svg aria-hidden="true" class="d-win-line" viewBox="0 0 ${w} ${h}" fill="none" style="color:${INK}">${path(OUTLINE.OUTLINE_WINDOW.block)}${path(OUTLINE.OUTLINE_WINDOW.line)}</svg><div class="d-obj"><p class="d-obj-line">${escapeText(object.line)}</p><div aria-hidden="true" class="d-obj-track"><i class="l"></i><i class="r"></i></div><p class="d-obj-ev"><b translate="no">${escapeText(object.event)}</b></p></div></div>
${satellites}
</div>
</section>`;
}

function renderVerbs(page) {
  const verbs = page.verbs
    .map(
      (item, index) => `<div class="d-verb"><span aria-hidden="true" class="${index === 1 ? "d-tile live" : "d-tile"}"><span class="d-tile-strip">${GLYPH_FRAMES[index].map((glyph) => `<span>${glyph}</span>`).join("")}</span></span><div><h2 class="d-verb-h">${escapeText(item.verb)}</h2><p class="d-verb-p">${escapeText(item.desc)}</p></div></div>`,
    )
    .join("\n");
  return `<section id="how-it-works" aria-label="${escapeAttribute(page.verbs.map((v) => v.verb).join(" "))}" class="d-sec d-verbs-sec">
<div class="d-verbs">
${verbs}
</div>
</section>`;
}

function renderStack(page) {
  const { stack } = page;
  return `<section id="continue" aria-labelledby="stack-title" class="d-sec">
<div class="d-plate d-plate-mist d-grain">
<div class="d-stack" data-product-ui><i aria-hidden="true" class="d-stack-back b2"></i><i aria-hidden="true" class="d-stack-back b1"></i><div class="d-stack-card"><div class="d-stack-row"><span class="d-stack-label">${escapeText(stack.label)}</span><span class="d-stack-token" translate="no">${escapeText(stack.token)}</span></div><div aria-hidden="true" class="d-stack-track"><span class="d-stack-end"></span><span class="d-stack-rail"><span class="d-stack-knob"></span></span><span class="d-stack-end"></span></div><p class="d-stack-status">${escapeText(stack.status)}</p></div></div>
<div class="d-plate-cap"><h2 id="stack-title">${escapeText(stack.title)}</h2><p>${escapeText(stack.desc)}</p></div>
</div>
</section>`;
}

function renderSupply(page) {
  const { supply } = page;
  const cards = supply.cards
    .map(
      (card, index) => `<div class="d-mcard"><p class="d-mcard-hd">${escapeText(card.name)}<span class="d-badge" translate="no">${escapeText(card.badge)}</span></p><p class="d-mcard-val">${escapeText(card.value)}</p><p class="d-mcard-lab">${escapeText(card.label)}</p><p class="d-mcard-stat"><span aria-hidden="true" class="${index === LIVE_CARD ? "d-dot live" : "d-dot"}"></span>${escapeText(card.status)}</p></div>`,
    )
    .join("\n");
  return `<section id="runtimes" aria-labelledby="supply-title" class="d-sec">
<div class="d-supply">
<div aria-hidden="true" class="d-supply-field d-grain"></div>
<h2 id="supply-title" class="d-supply-h">${escapeText(supply.a)}<br /><span class="d-soft-42">${escapeText(supply.b)}</span></h2>
<div class="d-supply-cards" data-product-ui>
${cards}
</div>
</div>
</section>`;
}

function renderFaq(page) {
  const { faq } = page;
  const [w, h] = OUTLINE.OUTLINE_FAQ.vb;
  const indicator = `<svg aria-hidden="true" class="d-faq-ind" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${OUTLINE.OUTLINE_FAQ.block}" stroke="currentColor" stroke-width="1" /></svg>`;
  const items = faq.items
    .map(
      (item, index) => `<details name="faq" class="d-pc"${index === 0 ? " open" : ""}><summary>${corners("d-pc-c")}<span class="d-pc-q">${escapeText(item.q)}</span><span aria-hidden="true" class="d-pc-n">${indicator}${String(index + 1).padStart(2, "0")}</span></summary><p class="d-pc-a">${escapeText(item.a)}</p></details>`,
    )
    .join("\n");
  return `<section id="faq" aria-labelledby="faq-title" class="d-sec d-faq">
<div class="d-faq-side"><p class="d-badge d-badge-lg">${escapeText(faq.label)}</p><h2 id="faq-title" class="d-h2">${escapeText(faq.a)}<br /><span class="d-soft">${escapeText(faq.b)}</span></h2></div>
<div class="d-faq-list">
${items}
</div>
</section>`;
}

function renderClose(page) {
  const { close } = page;
  // Without JavaScript the button cannot reach the clipboard, so the static
  // page leaves it out; the sentence stays selectable.
  return `<section id="start" aria-labelledby="close-title" class="d-sec">
<div class="d-plate d-plate-field d-grain d-close">
<h2 id="close-title" class="d-close-h">${escapeText(close.a)}<br />${escapeText(close.b)}</h2>
<div class="d-ccard"><span class="d-ccard-legend">${escapeText(close.legend)}</span>${corners("d-ccard-c")}<div class="d-ccard-field" data-product-ui><span class="d-ccard-p">${escapeText(close.prompt)}</span></div><p class="d-ccard-fine">${escapeText(close.fine)}</p></div>
</div>
</section>`;
}

function renderCoda() {
  const [w, h] = OUTLINE.OUTLINE_NESTED.vb;
  const opacities = [0.22, 0.4, 1];
  const blocks = OUTLINE.OUTLINE_NESTED.blocks.map((d, index) => path(d, ` stroke-opacity="${opacities[index]}"`)).join("");
  return `<div class="d-coda" style="--coda-w:480px"><div class="d-nest" style="aspect-ratio:${w} / ${h}"><div aria-hidden="true" class="d-nest-dots"></div><svg aria-hidden="true" viewBox="0 0 ${w} ${h}" fill="none" style="color:${INK}">${blocks}${path(OUTLINE.OUTLINE_NESTED.line)}</svg></div></div>`;
}

function footerHref(locale, shell, index) {
  // Same order as shell.footer.groups.
  return [
    [LINKS.console, LINKS.computer, `/${locale}/use-cases`, shell.health],
    [
      shell.docs,
      shell.quickstart,
      shell.apiReferenceV2,
      LINKS.openApiV2,
      LINKS.openApiV1,
      shell.cli,
      LINKS.changelog,
      LINKS.llms,
    ],
    [LINKS.github, LINKS.releases, LINKS.spec, LINKS.driver, LINKS.license, LINKS.security, LINKS.incidents],
    [shell.blog, LINKS.x, LINKS.issues],
  ][index];
}

const NO_TRANSLATE = new Set(["Mosoo Computer", "OpenAPI v2", "OpenAPI v1", "CLI", "llms.txt", "GitHub", "Agent Driver", "X", "GitHub Issues"]);

function renderFooter(locale, shell) {
  const groups = shell.footer.groups
    .map(([heading, labels], index) => {
      const hrefs = footerHref(locale, shell, index);
      if (hrefs.length !== labels.length) {
        throw new Error(`Footer group ${heading} has ${labels.length} labels for ${hrefs.length} links`);
      }
      const items = labels
        .map((text, position) => {
          const href = hrefs[position];
          const english = locale !== "en" && href === LINKS.changelog ? ' hreflang="en"' : "";
          const keep = NO_TRANSLATE.has(text) ? ' translate="no"' : "";
          return `<li>${link(href, text, `${english}${keep}`)}</li>`;
        })
        .join("");
      return `<div><h2 class="d-footer-h">${escapeText(heading)}</h2><ul>${items}</ul></div>`;
    })
    .join("\n");
  const languages = LANGUAGES.map(
    (language) =>
      `<li>${link(
        `/${language.locale}`,
        language.label,
        ` hreflang="${language.lang}" lang="${language.lang}"${language.locale === locale ? ' aria-current="true"' : ""}`,
      )}</li>`,
  ).join("");

  return `<footer class="d-footer"><div class="d-footer-in">
<p class="d-footer-line">${escapeText(shell.footer.descriptor)}</p>
<nav aria-label="Footer" class="d-footer-cols">
${groups}
</nav>
<div class="d-footer-bottom"><p>${escapeText(shell.footer.copyright)}</p><ul aria-label="${escapeAttribute(shell.nav.language)}" class="d-lang">${languages}</ul></div>
</div></footer>`;
}

export function renderHomeFallback(locale) {
  const { shell, page } = copyFor(locale);
  return `<div class="mosoo-fallback landing-shell d-shell" data-theme="landing">
<a class="d-skip" href="#main">${escapeText(shell.nav.skip)}</a>
<div class="d-paper">
${renderNav(locale, shell)}
<main id="main" tabindex="-1" class="outline-none"><div class="d-home">
${renderHero(shell, page)}
${renderVerbs(page)}
${renderStack(page)}
${renderSupply(page)}
${renderFaq(page)}
${renderClose(page)}
${renderCoda()}
</div></main>
</div>
${renderFooter(locale, shell)}
</div>`;
}

// ---------------------------------------------------------------------------
// JSON-LD

export function homeStructuredData(locale) {
  const { shell } = copyFor(locale);
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
        inLanguage: shell.lang,
        description: shell.jsonLd.description,
        applicationCategory: "DeveloperApplication",
        applicationSubCategory: "Managed Agent runtime",
        operatingSystem: "Web",
        codeRepository: GITHUB,
        license: LINKS.license,
        softwareHelp: { "@type": "CreativeWork", url: shell.jsonLd.help },
        releaseNotes: LINKS.releases,
        featureList: shell.jsonLd.features,
        publisher: { "@id": `${SITE}/#organization` },
        sameAs: [GITHUB, LINKS.x],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        url,
        inLanguage: shell.lang,
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

// The static page uses the React page's classes from the linked d-object.css;
// this block only covers what differs before React mounts.
export const HOME_FALLBACK_STYLE = `<style>
.mosoo-fallback{min-height:100vh}
.mosoo-fallback .d-ccard-field{padding-right:22px}
</style>`;
