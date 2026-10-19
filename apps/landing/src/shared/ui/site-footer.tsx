import type { ReactElement } from "react";

import { t } from "@/shared/i18n";
import { LOCALE_LABELS, LOCALES, locale, localeHref, rememberLocale } from "@/shared/locale";

import {
  blogUrl,
  docsUrl,
  MOSOO_AGENT_DRIVER_URL,
  MOSOO_CHANGELOG_URL,
  MOSOO_CLOUD_URL,
  MOSOO_COMPUTER_URL,
  MOSOO_GITHUB_URL,
  MOSOO_INCIDENTS_URL,
  MOSOO_ISSUES_LIST_URL,
  MOSOO_LICENSE_URL,
  MOSOO_LLMS_URL,
  MOSOO_OPENAPI_V1_URL,
  MOSOO_OPENAPI_V2_URL,
  MOSOO_RELEASES_URL,
  MOSOO_SECURITY_URL,
  MOSOO_SPEC_URL,
  MOSOO_X_URL,
  pathToUseCases,
  statusPath,
} from "@/shared/config/external-links";

type FooterLink = {
  label: string;
  href: string;
  /** Brand and protocol names that browser translation should leave alone. */
  noTranslate?: boolean;
  /** Set when the target page exists only in English. */
  hrefLang?: string;
};

type FooterGroup = { heading: string; links: readonly FooterLink[] };

function footerGroups(): readonly FooterGroup[] {
  return [
    {
      heading: t("Product"),
      links: [
        { label: t("mosoo console"), href: MOSOO_CLOUD_URL },
        { label: "Mosoo Computer", href: MOSOO_COMPUTER_URL, noTranslate: true },
        { label: t("Use cases"), href: pathToUseCases() },
        { label: t("Status"), href: statusPath() },
      ],
    },
    {
      heading: t("Developers"),
      links: [
        { label: t("Docs"), href: docsUrl() },
        { label: t("Quickstart"), href: docsUrl("quickstart/") },
        { label: t("API reference v2"), href: docsUrl("api-reference-v2/") },
        { label: "OpenAPI v2", href: MOSOO_OPENAPI_V2_URL, noTranslate: true },
        { label: "OpenAPI v1", href: MOSOO_OPENAPI_V1_URL, noTranslate: true },
        { label: "CLI", href: docsUrl("cli/overview/"), noTranslate: true },
        { label: t("Changelog"), href: MOSOO_CHANGELOG_URL, hrefLang: "en" },
        { label: "llms.txt", href: MOSOO_LLMS_URL, noTranslate: true },
      ],
    },
    {
      heading: t("Open source"),
      links: [
        { label: "GitHub", href: MOSOO_GITHUB_URL, noTranslate: true },
        { label: t("Releases"), href: MOSOO_RELEASES_URL },
        { label: t("Product spec"), href: MOSOO_SPEC_URL },
        { label: "Agent Driver", href: MOSOO_AGENT_DRIVER_URL, noTranslate: true },
        { label: t("License"), href: MOSOO_LICENSE_URL },
        { label: t("Security"), href: MOSOO_SECURITY_URL },
        { label: t("Incident postmortems"), href: MOSOO_INCIDENTS_URL },
      ],
    },
    {
      heading: t("Community"),
      links: [
        { label: t("Blog"), href: blogUrl() },
        { label: "X", href: MOSOO_X_URL, noTranslate: true },
        { label: "GitHub Issues", href: MOSOO_ISSUES_LIST_URL, noTranslate: true },
      ],
    },
  ];
}

/**
 * Site footer on the stone frame (d-object: Supabase-quiet four columns, the
 * positioning line, then one bottom row with the credit and the language
 * switcher). No solid logo here: the page end already carries the large
 * outline (UI-FORMS §d rule 6).
 */
export function SiteFooter(): ReactElement {
  return (
    <footer className="d-footer">
      <div className="d-footer-in">
        <p className="d-footer-line">
          {t("An open-source, API-first managed Agent runtime for application backends.")}
        </p>
        <nav aria-label={t("Footer")} className="d-footer-cols">
          {footerGroups().map((group) => (
            <div key={group.heading}>
              <h2 className="d-footer-h">{group.heading}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} hrefLang={link.hrefLang} translate={link.noTranslate ? "no" : undefined}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="d-footer-bottom">
          <p>© 2026 LangGenius, Inc.</p>
          <ul aria-label={t("Change language")} className="d-lang">
            {LOCALES.map((code) => (
              <li key={code}>
                <a
                  href={localeHref(code)}
                  hrefLang={code === "zh" ? "zh-CN" : code}
                  lang={code === "zh" ? "zh-CN" : code}
                  aria-current={code === locale ? "true" : undefined}
                  onClick={() => rememberLocale(code)}
                >
                  {LOCALE_LABELS[code].native}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
