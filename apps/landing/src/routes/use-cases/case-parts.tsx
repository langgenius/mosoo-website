import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { m, useReducedMotion } from "motion/react";
import type { ReactElement, ReactNode } from "react";

import { GithubMark } from "../login/github-mark";
import { Reveal } from "../login/landing/motion";
import { EASE_OUT, fadeUp, REVEAL_VIEWPORT } from "../login/landing/motion-variants";
import { MOSOO_DOCS_URL, MOSOO_LOGIN_URL, pathToUseCases } from "../login/links";
import { displayStyle, sectionHeadingStyle } from "./display";
import { t } from "./i18n";
import type { UseCase } from "./use-cases-data";

/**
 * The parts every use-case detail page is made of (#143, staging committee/PLAN.md 2-4: clean up, no new layout).
 * They draw in the home's system (app.css "use cases", .sub-btn): ink on the paper, the frame as the one neutral
 * ground, the home's two hairlines, no outlined boxes and no kicker over the title. The case name moved from the
 * kicker into the back link ("← Use cases / Blueprint"). Lime is for the one button that goes to mosoo (the closing
 * "Start on mosoo Cloud"); "Open the live app" leaves for someone else's site, so it is the grey secondary.
 * The words stay the pages' own (./i18n.ts), passed in by each page.
 */

const PAGE_HEADLINE_STYLE = displayStyle("clamp(36px, 4.6vw, 60px)", "-0.028em", 1.04);

/** The page body: the home's 1120px column. */
export function CasePage({ children }: { children: ReactNode }): ReactElement {
  return <div className="uc">{children}</div>;
}

/** The first screen: the way back with the case's name, the title, the lead, who sent it in, the actions. */
export function CaseHeader({
  actions,
  lead,
  title,
  useCase,
}: {
  actions: ReactNode;
  lead: string;
  title: string;
  useCase: UseCase;
}): ReactElement {
  return (
    <Reveal className="uc-head">
      <nav aria-label={t("Breadcrumb")}>
        <ol className="uc-crumb">
          <li>
            <a href={pathToUseCases()}>
              <ArrowLeft aria-hidden="true" />
              {t("Use cases")}
            </a>
          </li>
          <li aria-current="page" translate="no">
            {useCase.name}
          </li>
        </ol>
      </nav>
      <h1 className="uc-h1" style={PAGE_HEADLINE_STYLE}>
        {title}
      </h1>
      <p className="uc-lead">{lead}</p>
      <p className="uc-by">
        <span>{t("Submitted by")}</span>
        <img src={useCase.author.avatar} alt="" width={20} height={20} />
        <span className="uc-by-name">{useCase.author.name}</span>
      </p>
      <div className="sub-actions uc-head-actions">{actions}</div>
    </Reveal>
  );
}

/** An outbound link drawn as the grey secondary button (the case's live app is someone else's site). */
export function OutboundButton({ children, href }: { children: ReactNode; href: string }): ReactElement {
  return (
    <a className="sub-btn sub-btn--grey" href={href} target="_blank" rel="noreferrer noopener">
      {children}
      <ArrowUpRight aria-hidden="true" />
    </a>
  );
}

/** The case's live app: the first action of most headers. */
export function LiveAppButton({ href }: { href: string }): ReactElement {
  return <OutboundButton href={href}>{t("Open the live app")}</OutboundButton>;
}

/** The case's repository, as a text link beside the live app, or as the grey button where it is the only action. */
export function RepositoryLink({ href, primary = false }: { href: string; primary?: boolean }): ReactElement {
  return (
    <a
      className={primary ? "sub-btn sub-btn--grey" : "sub-tlink"}
      href={href}
      target="_blank"
      rel="noreferrer noopener"
    >
      <GithubMark />
      {t("View the repository")}
    </a>
  );
}

/** An outbound text link with the external arrow (go-gym's API docs). */
export function OutboundLink({ children, href }: { children: ReactNode; href: string }): ReactElement {
  return (
    <a className="sub-tlink" href={href} target="_blank" rel="noreferrer noopener">
      {children}
      <ArrowUpRight aria-hidden="true" />
    </a>
  );
}

/** A screenshot on the frame: a white card on the neutral board, the caption under it. */
export function CaseShot({
  alt,
  caption = alt,
  eager = false,
  height,
  src,
  width,
}: {
  alt: string;
  caption?: string;
  eager?: boolean;
  height: number;
  src: string;
  width: number;
}): ReactElement {
  return (
    <figure className="uc-shot">
      <div className="uc-board">
        <img
          className="uc-shot-img"
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={eager ? "eager" : "lazy"}
        />
      </div>
      <figcaption className="uc-cap">{caption}</figcaption>
    </figure>
  );
}

/** A section: its display-face heading and an optional intro, then the content. */
export function CaseSection({
  children,
  intro,
  title,
}: {
  children?: ReactNode;
  intro?: string;
  title: string;
}): ReactElement {
  return (
    <section className="uc-sec">
      <Reveal>
        <h2 className="uc-h2" style={sectionHeadingStyle}>
          {title}
        </h2>
        {intro === undefined ? null : <p className="uc-intro">{intro}</p>}
      </Reveal>
      {children}
    </section>
  );
}

/** A list item that fades up into view, as Reveal does for a div (a list keeps <li> children). */
function RevealItem({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}): ReactElement {
  const reduceMotion = useReducedMotion();
  return (
    <m.li
      className={className}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
      variants={fadeUp}
      transition={{ duration: 0.24, ease: EASE_OUT, delay }}
    >
      {children}
    </m.li>
  );
}

export interface CaseItem {
  body: string;
  title: string;
}

// The lists below set list-style: none (their numbers and dots are drawn by app.css), and Safari's VoiceOver then
// stops announcing them as lists; role="list" keeps it.

/** Steps that happen in order: an ordered list, each number in ink-3-text before its title (app.css .uc-steps). */
export function CaseSteps({ items }: { items: readonly CaseItem[] }): ReactElement {
  return (
    <ol className="uc-items uc-steps" role="list">
      {items.map((item, index) => (
        <RevealItem key={item.title} className="uc-item" delay={index * 0.06}>
          <h3 className="uc-item-h">{item.title}</h3>
          <p className="uc-item-p">{item.body}</p>
        </RevealItem>
      ))}
    </ol>
  );
}

/** Points side by side with no order between them: no numbers. */
export function CasePoints({ items }: { items: readonly CaseItem[] }): ReactElement {
  return (
    <ul className="uc-items" role="list">
      {items.map((item, index) => (
        <RevealItem key={item.title} className="uc-item" delay={index * 0.06}>
          <h3 className="uc-item-h">{item.title}</h3>
          <p className="uc-item-p">{item.body}</p>
        </RevealItem>
      ))}
    </ul>
  );
}

/** The request path: the hops in order on the frame, a note under it. */
export function RequestPath({ note, stages }: { note: string; stages: readonly string[] }): ReactElement {
  return (
    <Reveal className="uc-sec uc-sec--near">
      <div className="uc-path">
        <p className="uc-path-h">{t("The request path")}</p>
        <ol className="uc-path-list" role="list">
          {stages.map((stage) => (
            <li key={stage}>{stage}</li>
          ))}
        </ol>
      </div>
      <p className="uc-note">{note}</p>
    </Reveal>
  );
}

/** One fact under a hairline: a short heading and either a sentence or the stack. */
export function CaseFact({ children, title }: { children: ReactNode; title: string }): ReactElement {
  return (
    <div className="uc-fact">
      <h3 className="uc-item-h">{title}</h3>
      {children}
    </div>
  );
}

export function CaseFactText({ children }: { children: string }): ReactElement {
  return <p className="uc-item-p">{children}</p>;
}

/** The stack: names in a row, a middle dot between them (none at a line start), no chips. */
export function CaseTags({ tags }: { tags: readonly string[] }): ReactElement {
  return (
    <div className="uc-tags">
      <ul role="list">
        {tags.map((tag) => (
          <li key={tag} translate="no">
            {tag}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Facts in columns: two on blueprint, three on ghfind and pitchpilot. */
export function CaseFacts({ children, columns }: { children: ReactNode; columns: 2 | 3 }): ReactElement {
  return (
    <section className="uc-sec uc-sec--near">
      <Reveal className={`uc-facts uc-facts--${columns}`}>{children}</Reveal>
    </section>
  );
}

/** The page's end: a heading, a sentence, the one lime button (to mosoo) and the docs. */
export function ClosingCta({ body, title }: { body: string; title: string }): ReactElement {
  return (
    <Reveal className="uc-close">
      <h2 className="uc-h2 uc-close-h" style={sectionHeadingStyle}>
        {title}
      </h2>
      <p className="uc-close-p">{body}</p>
      <div className="sub-actions uc-close-actions">
        <a className="sub-btn sub-btn--lime" href={MOSOO_LOGIN_URL}>
          {t("Start on mosoo Cloud")}
        </a>
        <a className="sub-btn sub-btn--grey" href={MOSOO_DOCS_URL}>
          {t("Read the docs")}
        </a>
      </div>
    </Reveal>
  );
}
