// The v4c "Stage" home as static HTML: the build writes it into en/zh/ja.html (scripts/landing-home.mjs)
// and the page works without JavaScript; src/main.tsx only adds the effects (src/effects/*).
// Erasable TypeScript only, so Node can import this file as is at build time.
//
// Forms (mosoo-website-redesign-staging/refs/UI-FORMS.md §c, assignment §f "c-stage"):
//   hero   logo-outline window (S2 ripple) + centred two-value H1 + one button + four runtime tiles (F28)
//   stage  portal transition into a pinned three-act stage: U10 spec table -> U04 split feed -> U14 ruler (night)
//   U15    statement with inline glyph circles
//   U16    FAQ, narrow-column skin (F42), outline indicator
//   U06    closing card, legend variant, on the session line
//   U07    footer Ask-AI plate
// Every product object carries data-product-ui (its words count in the object budget, UI-FORMS §g).

import { HOME_COPY, LINKS } from "./copy.ts";
import type { HomeCopy, HomeLocale } from "./copy.ts";
import { FAQ_INDICATOR, HERO_WINDOW, NAV_MARK, SESSION_LINE } from "./outline-geometry.ts";
import { RUNTIME_GLYPHS, UI_GLYPHS } from "./runtime-glyphs.ts";

const LOCALES: readonly HomeLocale[] = ["en", "zh", "ja"];
const LOCALE_NAMES: Record<HomeLocale, string> = { en: "English", zh: "简体中文", ja: "日本語" };

export function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function runtimeGlyph(id: string, cls: string): string {
  const glyph = RUNTIME_GLYPHS.find((g) => g.id === id);
  if (!glyph) throw new Error(`unknown runtime glyph ${id}`);
  return `<svg class="${cls}" viewBox="${glyph.viewBox}" fill="currentColor" fill-rule="evenodd" aria-hidden="true" focusable="false">${glyph.body}</svg>`;
}

function uiGlyph(id: string, cls: string): string {
  const glyph = UI_GLYPHS.find((g) => g.id === id);
  if (!glyph) throw new Error(`unknown ui glyph ${id}`);
  const stroke = glyph.stroke ? ' stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"' : "";
  return `<svg class="${cls}" viewBox="${glyph.viewBox}" fill="none"${stroke} aria-hidden="true" focusable="false">${glyph.body}</svg>`;
}

/** The solid monochrome nav mark: the logo's block and bar in currentColor, 20 px wide. */
function navMark(): string {
  return `<svg class="brand-mark" viewBox="${NAV_MARK.vb}" aria-hidden="true" focusable="false"><path d="${NAV_MARK.block}" fill="currentColor"/><rect x="0" y="${NAV_MARK.bar.y}" width="51.51" height="${NAV_MARK.bar.h}" fill="currentColor"/></svg>`;
}

function homeHref(locale: HomeLocale): string {
  return `/${locale}`;
}

export function renderNav(locale: HomeLocale, copy: HomeCopy = HOME_COPY[locale]): string {
  return `<a class="v4-skip" href="#main">${esc(copy.nav.skip)}</a>
<header class="v4-nav" data-nav>
  <div class="v4-nav-in">
    <a class="v4-brand" href="${homeHref(locale)}" aria-label="mosoo">${navMark()}<span class="v4-brand-word">mosoo</span></a>
    <nav class="v4-nav-links" aria-label="Primary">
      <a class="v4-nav-link" href="${LINKS.docs}">${esc(copy.nav.docs)}</a>
      <a class="v4-nav-link" href="${LINKS.github}">${esc(copy.nav.github)}</a>
      <a class="v4-btn v4-btn-ink v4-btn-sm" href="${LINKS.console}">${esc(copy.nav.cta)}</a>
    </nav>
  </div>
</header>`;
}

function renderHero(copy: HomeCopy): string {
  const tiles = ["openai-runtime", "claude-agent-sdk", "acp-fallback", "pi"]
    .map((id, i) => `<li class="tile tile-${i + 1}">${runtimeGlyph(id, "tile-glyph")}</li>`)
    .join("");
  return `<section class="hero" aria-labelledby="hero-title">
  <div class="hero-in">
    <ul class="hero-tiles" aria-hidden="true">${tiles}</ul>
    <div class="hero-window" data-hero-window aria-hidden="true">
      <div class="hero-ripple"><i></i><i></i><i></i><i></i></div>
      <svg class="hero-outline" viewBox="${HERO_WINDOW.viewBox}" fill="none"><path d="${HERO_WINDOW.block}"/><path d="${HERO_WINDOW.line}"/></svg>
    </div>
    <h1 id="hero-title" class="hero-title"><span class="hero-a">${esc(copy.hero.lineA)}</span> <span class="hero-b">${esc(copy.hero.lineB)}</span></h1>
    <p class="hero-lead">${esc(copy.hero.lead)}</p>
    <a class="v4-btn v4-btn-ink v4-btn-lg hero-cta" href="${LINKS.console}">${esc(copy.hero.cta)}</a>
  </div>
</section>`;
}

function renderAct1(copy: HomeCopy): string {
  const a = copy.act1;
  const rest = a.harnesses.slice(1);
  const harnessIds = ["openai-runtime", "claude-agent-sdk", "acp-fallback", "pi"];
  const faces = a.harnesses
    .map((name, i) => `<span class="spec-face${i === 0 ? " is-on" : ""}" data-face="${i}"${i === 0 ? "" : ' aria-hidden="true"'}>${runtimeGlyph(harnessIds[i] ?? "pi", "spec-glyph")}<span>${esc(name)}</span></span>`)
    .join("");
  return `<article class="act act-1" data-act="1" aria-labelledby="act1-title">
  <div class="act-in">
    <h2 id="act1-title" class="act-title">${esc(a.titleA)} <span class="soft">${esc(a.titleB)}</span></h2>
    <dl class="spec" data-product-ui>
      <div class="spec-row spec-first"><dt>${esc(a.rows[0])}</dt><dd><span class="spec-flip" data-flip>${faces}</span><span class="spec-others">${esc(rest.join(" · "))}</span></dd></div>
      <div class="spec-row"><dt>${esc(a.rows[1])}</dt><dd>${uiGlyph("key", "spec-ico")}<span>${esc(a.model)}</span></dd></div>
      <div class="spec-row"><dt>${esc(a.rows[2])}</dt><dd>${uiGlyph("environments", "spec-ico")}<span>${esc(a.sandbox)}</span></dd></div>
      <div class="spec-row"><dt>${esc(a.rows[3])}</dt><dd><code class="spec-tok">${esc(a.files)}</code></dd></div>
      <div class="spec-row"><dt>${esc(a.rows[4])}</dt><dd><span>${esc(a.resume)}</span></dd></div>
    </dl>
  </div>
</article>`;
}

function renderAct2(copy: HomeCopy): string {
  const a = copy.act2;
  const cards = a.cards
    .map(
      (c, i) => `<li class="fc" data-card="${i}"><div class="fc-row"><span class="fc-time">${esc(c.time)}</span><span class="fc-pill"><i class="dot${c.live ? " live" : ""}"></i>${esc(c.event)}</span></div><p class="fc-title">${esc(c.title)}</p><p class="fc-result">${esc(c.result)}</p></li>`,
    )
    .join("");
  return `<article class="act act-2" data-act="2" aria-labelledby="act2-title">
  <div class="act-in">
    <div class="field">
      <h2 id="act2-title" class="field-title"><span class="field-a">${esc(a.halfA)}</span> <span class="field-b">${esc(a.halfB)}</span></h2>
      <div class="feed" data-product-ui><ol class="feed-list" data-feed>${cards}</ol></div>
    </div>
  </div>
</article>`;
}

function renderAct3(copy: HomeCopy): string {
  const a = copy.act3;
  const xs = [0, 22, 44, 70, 96];
  const majors = xs
    .map((x, i) => `<i class="mj" style="left:${x}%"></i><span class="lb${i === 0 ? " first" : ""}${i === 4 ? " last" : ""}${i === 1 || i === 3 ? " mob-hide" : ""}" style="left:${x}%">${esc(a.ticks[i] ?? "")}</span>`)
    .join("");
  return `<article class="act act-3" data-act="3" aria-labelledby="act3-title">
  <div class="act-in">
    <h2 id="act3-title" class="act-title">${esc(a.titleA)} <span class="soft">${esc(a.titleB)}</span></h2>
    <div class="ruler-card" data-product-ui>
      <div class="ruler" data-ruler>
        <i class="ticks"></i><i class="base base-a"></i><i class="gap"></i><i class="base base-b"></i>
        ${majors}
        <i class="now" data-now></i>
      </div>
      <p class="ruler-note"><b>${esc(a.noteStrong)}</b> ${esc(a.note)}</p>
    </div>
  </div>
</article>`;
}

function renderStage(copy: HomeCopy): string {
  return `<section class="stage" data-stage aria-label="${esc(copy.act1.rows[0])}">
  <div class="stage-pin" data-pin>
    <div class="stage-acts" data-portal>
      <div class="portal-veil" data-portal-veil aria-hidden="true"></div>
${renderAct1(copy)}
${renderAct2(copy)}
${renderAct3(copy)}
    </div>
    <svg class="portal-frame" data-portal-frame viewBox="${HERO_WINDOW.viewBox}" fill="none" aria-hidden="true"><path d="${HERO_WINDOW.block}"/><path d="${HERO_WINDOW.line}"/></svg>
  </div>
</section>`;
}

function renderStatement(copy: HomeCopy): string {
  const [p0, p1, p2, p3, tail] = copy.statement.parts;
  const g = (id: string) => `<span class="g">${runtimeGlyph(id, "g-glyph")}</span>`;
  return `<section class="statement" aria-label="${esc(copy.act1.rows[0])}">
  <p class="statement-text"><span class="nw">${esc(p0)} ${g("openai-runtime")}</span> <span class="nw">${esc(p1).replace(/,$/, "")} ${g("claude-agent-sdk")},</span> <span class="nw">${esc(p2)} ${g("acp-fallback")}</span> <span class="nw">${esc(p3)} ${g("pi")}</span> ${esc(tail)}</p>
</section>`;
}

function renderFaq(copy: HomeCopy): string {
  const indicator = `<svg class="faq-ind" viewBox="0 0 ${FAQ_INDICATOR.w} ${FAQ_INDICATOR.h}" aria-hidden="true" focusable="false"><path d="${FAQ_INDICATOR.d}"/></svg>`;
  const items = copy.faq.items
    .map(
      (item, i) => `<details class="faq-row" name="faq"${i === 0 ? " open" : ""}><summary>${indicator}<span class="faq-q">${esc(item.q)}</span></summary><p class="faq-a">${esc(item.a)}</p></details>`,
    )
    .join("");
  return `<section class="faq" aria-labelledby="faq-title">
  <h2 id="faq-title" class="faq-title">${esc(copy.faq.title)}</h2>
  <div class="faq-rows">${items}</div>
</section>`;
}

function renderClosing(copy: HomeCopy): string {
  const c = copy.closing;
  const line = SESSION_LINE;
  return `<section class="closing" aria-labelledby="closing-title">
  <h2 id="closing-title" class="closing-title"><span>${esc(c.lineA)}</span> <span>${esc(c.lineB)}</span></h2>
  <div class="closing-card" data-product-ui>
    <span class="legend">${esc(c.legend)}</span>
    <div class="prompt-field"><span class="prompt-text" data-prompt>${esc(c.prompt)}</span><button class="v4-btn v4-btn-ink prompt-copy" type="button" data-copy data-copied-label="${esc(c.copied)}" aria-label="${esc(`${c.copy}: ${c.prompt}`)}">${uiGlyph("copy", "copy-ico")}<span data-copy-label>${esc(c.copy)}</span></button></div>
    <p class="closing-fine">${esc(c.fine)}</p>
  </div>
  <div class="session-line" aria-hidden="true"><i class="sl-rule"></i><svg class="sl-window" viewBox="${line.x0 - 0.5} 0 ${line.bw + 1} ${line.h}" fill="none"><path d="${line.window}"/></svg></div>
</section>`;
}

export function renderFooter(locale: HomeLocale, copy: HomeCopy = HOME_COPY[locale]): string {
  const f = copy.footer;
  const q = encodeURIComponent(f.askPrompt);
  const assistants = [
    { name: "ChatGPT", href: `https://chatgpt.com/?q=${q}` },
    { name: "Claude", href: `https://claude.ai/new?q=${q}` },
    { name: "Perplexity", href: `https://www.perplexity.ai/search?q=${q}` },
    { name: "Gemini", href: `https://gemini.google.com/app?q=${q}` },
  ];
  const pills = assistants
    .map((a) => `<a class="ask-pill" href="${a.href}" rel="noopener" target="_blank">${esc(a.name)}<em aria-hidden="true">↗</em></a>`)
    .join("");
  const links = f.links
    .map((l) => `<li><a href="${l.href.startsWith("/") ? `/${locale}${l.href}` : l.href}">${esc(l.label)}</a></li>`)
    .join("");
  const langs = LOCALES.map(
    (l) => `<li><a href="/${l}" hreflang="${l === "zh" ? "zh-CN" : l}" lang="${l === "zh" ? "zh-CN" : l}"${l === locale ? ' aria-current="true"' : ""}>${LOCALE_NAMES[l]}</a></li>`,
  ).join("");
  return `<footer class="v4-foot">
  <div class="v4-foot-in">
    <div class="ask">
      <h2 class="ask-title">${esc(f.askTitle)}</h2>
      <p class="ask-note">${esc(f.askNote)}</p>
      <div class="ask-pills">${pills}</div>
    </div>
    <nav class="foot-links" aria-label="Footer"><ul>${links}</ul></nav>
    <div class="foot-bottom">
      <nav class="foot-langs" aria-label="${esc(f.languageLabel)}"><ul>${langs}</ul></nav>
      <p class="foot-credit">${esc(f.credit)}</p>
    </div>
  </div>
</footer>`;
}

/** The whole home body (inside #root): nav, the five sections, footer. */
export function renderHome(locale: HomeLocale): string {
  const copy = HOME_COPY[locale];
  return `<div class="v4" data-v4-home>
${renderNav(locale, copy)}
<main id="main" tabindex="-1">
${renderHero(copy)}
${renderStage(copy)}
${renderStatement(copy)}
${renderFaq(copy)}
${renderClosing(copy)}
</main>
${renderFooter(locale, copy)}
</div>`;
}
