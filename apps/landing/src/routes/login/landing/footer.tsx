import type { ReactElement } from "react";

import { locale, LOCALE_LABELS, LOCALES, localeHref } from "@/shared/locale";

import {
  blogUrl,
  docsUrl,
  MOSOO_API_REFERENCE_URL,
  MOSOO_GITHUB_URL,
  MOSOO_LICENSE_URL,
  MOSOO_RELEASES_URL,
  pathToUseCases,
  statusPath,
} from "../links";
import { copy } from "./home-copy";
import { PageEnd } from "./page-end";

// The assistants the "short version" row opens, each with a prefilled
// question (Ploy's footer Ask-AI, refs/devices/crops/ploy-footer-ask-ai-live.jpg).
// Names only, no third-party logos.
const ASSISTANTS = [
  { name: "ChatGPT", href: (q: string) => `https://chatgpt.com/?q=${q}` },
  { name: "Claude", href: (q: string) => `https://claude.ai/new?q=${q}` },
  {
    name: "Perplexity",
    href: (q: string) => `https://www.perplexity.ai/search?q=${q}`,
  },
  {
    name: "Gemini",
    href: (q: string) => `https://www.google.com/search?udm=50&q=${q}`,
  },
] as const;

function columns(): {
  title: string;
  links: { label: string; href: string }[];
}[] {
  const { links } = copy.footer;
  return [
    {
      title: copy.footer.columns.product,
      links: [
        { label: links.docs, href: docsUrl() },
        { label: links.quickstart, href: docsUrl("quickstart/") },
        { label: links.api, href: MOSOO_API_REFERENCE_URL },
        { label: links.pricing, href: `/${locale}/pricing` },
        { label: links.status, href: statusPath() },
      ],
    },
    {
      title: copy.footer.columns.source,
      links: [
        { label: links.github, href: MOSOO_GITHUB_URL },
        { label: links.releases, href: MOSOO_RELEASES_URL },
        { label: links.license, href: MOSOO_LICENSE_URL },
      ],
    },
    {
      title: copy.footer.columns.company,
      links: [
        { label: links.blog, href: blogUrl() },
        { label: links.useCases, href: pathToUseCases() },
        { label: links.llms, href: "/llms.txt" },
      ],
    },
  ];
}

/**
 * The site footer: the outline page end, then the Ask-AI board (UI-FORMS U07,
 * Ploy's footer, on #141513 for the dark canvas), the quiet link columns, and
 * the bottom row with the credit and the language switcher. No filled logo:
 * the page end already shows the outline at its large size.
 */
export function LandingFooter(): ReactElement {
  const question = encodeURIComponent(copy.footer.askPrompt);

  return (
    <footer className="i-footer">
      <div className="i-shell i-footer-shell">
        <PageEnd event={copy.end.event} status={copy.end.status} />

        <section className="i-ask" aria-labelledby="ask-title">
          <div className="i-ask-copy">
            <h2 id="ask-title" className="i-display i-ask-title">
              {copy.footer.askTitle}
            </h2>
            <p className="i-ask-lead">{copy.footer.askLead}</p>
          </div>
          <ul className="i-ask-pills">
            {ASSISTANTS.map((assistant) => (
              <li key={assistant.name}>
                <a
                  className="i-pill"
                  href={assistant.href(question)}
                  rel="noopener"
                  target="_blank"
                >
                  {assistant.name}
                  <span aria-hidden="true" className="i-pill-arrow">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <nav className="i-footer-cols" aria-label="Footer">
          {columns().map((column) => (
            <div key={column.title}>
              <p className="i-footer-head">{column.title}</p>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="i-footer-bottom">
          <p>{copy.footer.credit}</p>
          <ul className="i-lang" aria-label={copy.footer.language}>
            {LOCALES.map((next) => (
              <li key={next}>
                <a
                  href={localeHref(next)}
                  hrefLang={next === "zh" ? "zh-CN" : next}
                  lang={next === "zh" ? "zh-CN" : next}
                  aria-current={next === locale ? "true" : undefined}
                >
                  {LOCALE_LABELS[next].native}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
