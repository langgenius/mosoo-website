import { useState } from "react";
import type { CSSProperties, ReactElement } from "react";

import { dockOnScroll, shouldUndock } from "@/effects/dock";
import { revealOnce } from "@/effects/reveal";
import { RuntimeIcon } from "@/shared/ui/brand-icons";
import { Check, CircleDashed, Copy, FileText, Loader2, RotateCcw, SquareTerminal } from "@/shared/ui/console-glyphs";
import { FaqIndicator, OutlineNested, OutlineWindow } from "@/shared/ui/outline";

import { docsUrl, MOSOO_CLOUD_URL } from "../links";
import { CARD_GLYPH_KEYS, HARNESS_SATELLITE, home, LIVE_CARD } from "./home-copy";

// d-object home (staging v4d/UI-LOCK.md). Six sections, each one form from
// UI-FORMS §f: U09 hero object, U02 verbs, F19 stacked turn, U03 overflow
// cards, U05 punch-card FAQ, U06 corner-dot card on a grain field; then the
// page-end nested outline (§d). Every product object is wrapped in
// data-product-ui.

/** Four corner marks (Ramp crop marks / Ploy punch-card dots). */
function Corners({ className }: { className: string }): ReactElement {
  return (
    <>
      <i aria-hidden="true" className={`${className} c1`} />
      <i aria-hidden="true" className={`${className} c2`} />
      <i aria-hidden="true" className={`${className} c3`} />
      <i aria-hidden="true" className={`${className} c4`} />
    </>
  );
}

function Hero(): ReactElement {
  const { hero, object } = home;
  return (
    <section id="hero" aria-labelledby="hero-title" className="d-hero">
      <h1 id="hero-title" className="d-h1">
        <span>{hero.h1a}</span> <span className="d-soft">{hero.h1b}</span>
      </h1>
      <p className="d-lead">{hero.lead}</p>
      <div className="d-actions">
        <a href={MOSOO_CLOUD_URL} className="d-btn">
          {hero.primary}
        </a>
        <a href={docsUrl("quickstart/")} className="d-btn-text">
          {hero.secondary}
          <span aria-hidden="true">→</span>
        </a>
      </div>
      {/* U09: centre outline window + four satellites; the signature dock. */}
      <div
        className="d-stage"
        data-product-ui
        data-dock={shouldUndock() ? "out" : undefined}
        ref={(el) => (el ? dockOnScroll(el) : undefined)}
      >
        <OutlineWindow
          className="d-win"
          fill={<div aria-hidden="true" className="d-win-fill d-grain" />}
        >
          <div className="d-obj">
            <p className="d-obj-line">{object.line}</p>
            <div aria-hidden="true" className="d-obj-track">
              <i className="l" />
              <i className="r" />
            </div>
            <p className="d-obj-ev">
              <b translate="no">{object.event}</b>
            </p>
          </div>
        </OutlineWindow>
        {object.satellites.map((sat, index) => (
          <div key={sat.key} className={`d-sat s${index + 1}`} data-sat>
            <Corners className="d-sat-c" />
            <p className="d-sat-k">{sat.key}</p>
            <p className="d-sat-v">
              {index === HARNESS_SATELLITE ? (
                <RuntimeIcon runtimeId="openai-runtime" size={16} className="d-glyph" />
              ) : null}
              {sat.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// Ploy's braille tiles: eight frames per tile, each frame a row of three
// cells read off the same cycle at offsets 0 / 3 / 6. Tile states follow the
// console's pending / running / completed (thread-state-icon.tsx).
// The middle (lime) tile spins: every frame lights 3 to 4 dots per cell, so
// the tile never reads as a few dead pixels.
const GLYPH_CYCLES = [
  ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"],
  ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧"],
  ["⠀", "⠄", "⠤", "⠦", "⠶", "⠷", "⠿", "⠷"],
];
const GLYPH_FRAMES = GLYPH_CYCLES.map((cycle) =>
  cycle.map((_, k) => `${cycle[k]}${cycle[(k + 3) % 8]}${cycle[(k + 6) % 8]}`),
);

function Verbs(): ReactElement {
  return (
    <section id="how-it-works" aria-label={home.verbs.map((v) => v.verb).join(" ")} className="d-sec d-verbs-sec">
      <div className="d-verbs">
        {home.verbs.map((item, index) => (
          <div key={item.verb} className="d-verb">
            <span aria-hidden="true" className={index === 1 ? "d-tile live" : "d-tile"}>
              <span className="d-tile-strip">
                {GLYPH_FRAMES[index]?.map((glyph, frame) => (
                  <span key={frame}>{glyph}</span>
                ))}
              </span>
            </span>
            <div>
              <h2 className="d-verb-h">{item.verb}</h2>
              <p className="d-verb-p">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stack(): ReactElement {
  const { stack } = home;
  return (
    <section id="continue" aria-labelledby="stack-title" className="d-sec">
      <div className="d-plate d-plate-mist d-grain">
        <div className="d-stack" data-product-ui>
          <i aria-hidden="true" className="d-stack-back b2" />
          <i aria-hidden="true" className="d-stack-back b1" />
          <div className="d-stack-card">
            <div className="d-stack-row">
              <span className="d-stack-label">{stack.label}</span>
              <span className="d-stack-token" translate="no">
                {stack.token}
              </span>
            </div>
            <div aria-hidden="true" className="d-stack-track">
              <span className="d-stack-end">
                <RuntimeIcon runtimeId="openai-runtime" size={18} className="d-glyph" />
              </span>
              <span className="d-stack-rail">
                <span className="d-stack-knob" />
              </span>
              <span className="d-stack-end">
                <FileText className="d-stack-file" />
              </span>
            </div>
            <p className="d-stack-status">
              <Loader2 className="d-stack-spin" />
              {stack.status}
            </p>
          </div>
        </div>
        <div className="d-plate-cap">
          <h2 id="stack-title">{stack.title}</h2>
          <p>{stack.desc}</p>
        </div>
      </div>
    </section>
  );
}

// U03 card-name glyphs: console glyphs that name the card's idea, not a
// third-party runtime mark (the console's KeyRound is not inlined here, so
// Keys takes CircleDashed).
const CARD_GLYPHS = { terminal: SquareTerminal, resume: RotateCcw, keys: CircleDashed } as const;

function CardGlyph({ glyph }: { glyph: keyof typeof CARD_GLYPHS }): ReactElement {
  const Glyph = CARD_GLYPHS[glyph];
  return <Glyph className="d-mcard-glyph" />;
}

function Supply(): ReactElement {
  const { supply } = home;
  return (
    <section id="runtimes" aria-labelledby="supply-title" className="d-sec">
      <div className="d-supply">
        <div aria-hidden="true" className="d-supply-field d-grain" />
        <h2 id="supply-title" className="d-supply-h">
          {supply.a}
          <br />
          <span className="d-soft-42">{supply.b}</span>
        </h2>
        <div className="d-supply-cards" data-product-ui>
          {supply.cards.map((card, index) => (
            <div key={card.name} className="d-mcard">
              <p className="d-mcard-hd">
                <CardGlyph glyph={CARD_GLYPH_KEYS[index] ?? "terminal"} />
                {card.name}
                <span className="d-badge" translate="no">
                  {card.badge}
                </span>
              </p>
              <p className="d-mcard-val">{card.value}</p>
              <p className="d-mcard-lab">{card.label}</p>
              <p className="d-mcard-stat">
                <span aria-hidden="true" className={index === LIVE_CARD ? "d-dot live" : "d-dot"} />
                {card.status}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection(): ReactElement {
  const { faq } = home;
  return (
    <section id="faq" aria-labelledby="faq-title" className="d-sec d-faq">
      <div className="d-faq-side">
        <p className="d-badge d-badge-lg">{faq.label}</p>
        <h2 id="faq-title" className="d-h2">
          {faq.a}
          <br />
          <span className="d-soft">{faq.b}</span>
        </h2>
      </div>
      <div className="d-faq-list">
        {faq.items.map((item, index) => (
          <details key={item.q} name="faq" open={index === 0} className="d-pc">
            <summary>
              <Corners className="d-pc-c" />
              <span className="d-pc-q">{item.q}</span>
              <span aria-hidden="true" className="d-pc-n">
                <FaqIndicator />
                {String(index + 1).padStart(2, "0")}
              </span>
            </summary>
            <p className="d-pc-a">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Close(): ReactElement {
  const { close } = home;
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(close.prompt).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };
  return (
    <section id="start" aria-labelledby="close-title" className="d-sec">
      <div className="d-plate d-plate-field d-grain d-close">
        <h2 id="close-title" className="d-close-h">
          {close.a}
          <br />
          {close.b}
        </h2>
        <div className="d-ccard">
          <span className="d-ccard-legend">{close.legend}</span>
          <Corners className="d-ccard-c" />
          <div className="d-ccard-field" data-product-ui>
            <span className="d-ccard-p">{close.prompt}</span>
            <button
              type="button"
              className="d-btn d-btn-sm d-ccard-btn"
              onClick={copy}
              aria-label={copied ? close.done : close.button}
              aria-live="polite"
            >
              <span className="d-ccard-btn-t">{copied ? close.done : close.button}</span>
              {copied ? <Check className="d-ccard-btn-i" /> : <Copy className="d-ccard-btn-i" />}
            </button>
          </div>
          <p className="d-ccard-fine">{close.fine}</p>
        </div>
      </div>
    </section>
  );
}

const CODA_STYLE = { "--coda-w": "480px" } as CSSProperties;

/** Page-end nested outline with the S3 dot field rising once (§d). */
function Coda(): ReactElement {
  return (
    <div className="d-coda" style={CODA_STYLE} ref={(el) => (el ? revealOnce(el) : undefined)}>
      <OutlineNested className="d-nest">
        <div aria-hidden="true" className="d-nest-dots" />
      </OutlineNested>
    </div>
  );
}

export function LoginLanding(): ReactElement {
  return (
    <div className="d-home">
      <Hero />
      <Verbs />
      <Stack />
      <Supply />
      <FaqSection />
      <Close />
      <Coda />
    </div>
  );
}
