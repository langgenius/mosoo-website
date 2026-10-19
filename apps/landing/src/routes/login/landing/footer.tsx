import type { CSSProperties, FocusEvent, ReactElement, ReactNode } from "react";

import { t, tp } from "@/shared/i18n";

import { GithubMark } from "../github-mark";
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
  MOSOO_LLMS_TXT_URL,
  MOSOO_OPENAPI_V1_URL,
  MOSOO_OPENAPI_V2_URL,
  MOSOO_RELEASES_URL,
  MOSOO_SPEC_URL,
  MOSOO_X_URL,
  pathToUseCases,
  statusPath,
} from "../links";
import { XMark } from "../x-mark";
import { displayTracking, DISPLAY_FONT } from "./typography";
import { PHRASE_CLASS, Phrases } from "./ui";

type FooterLink = {
  label: string;
  href: string;
  /** Brand and protocol names that browser translation should leave alone. */
  noTranslate?: boolean;
  /** Set when the target page exists only in English. */
  hrefLang?: string;
};

type FooterGroup = { heading: string; links: readonly FooterLink[] };

// Copy deck §12: four groups, the brand sign-off and the company line. No
// version string and no self-hosting line. The links match the static
// fallback's footer (scripts/landing-home.mjs), OpenAPI v1 and llms.txt
// included. There is no Security link while the repository has no security
// policy.
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
        { label: "llms.txt", href: MOSOO_LLMS_TXT_URL, noTranslate: true },
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

const SIGN_OFF_STYLE = {
  fontFamily: DISPLAY_FONT,
  fontSize: "clamp(32px, 4.6vw, 56px)",
  fontWeight: 500,
  letterSpacing: displayTracking("-0.025em"),
  lineHeight: 1.06,
} satisfies CSSProperties;

const FOOTER_LINK_CLASS =
  "text-paper-100/85 hover:text-paper-100 focus-visible:ring-paper-100 rounded-sm text-[15px] leading-[1.5] transition-colors outline-none focus-visible:ring-2";

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}): ReactElement {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      className="border-paper-100/20 text-paper-100/85 hover:bg-paper-100/10 hover:text-paper-100 focus-visible:ring-paper-100 inline-flex size-10 items-center justify-center rounded-md border transition-colors outline-none focus-visible:ring-2"
    >
      {children}
    </a>
  );
}

// On large viewports the footer is pinned under the content layer (see
// .landing-footer in app.css). Keyboard focus landing on a footer link there
// would sit behind the content, so scroll to the end to reveal it first.
function revealPinnedFooter(event: FocusEvent<HTMLElement>): void {
  if (getComputedStyle(event.currentTarget).position !== "sticky") {
    return;
  }

  const { scrollHeight } = document.documentElement;
  if (window.scrollY + window.innerHeight < scrollHeight - 1) {
    window.scrollTo({ top: scrollHeight });
  }
}

export function LandingFooter(): ReactElement {
  return (
    <footer
      onFocus={revealPinnedFooter}
      className="landing-footer text-paper-100 bg-[#050805] px-4 pt-14 pb-10 md:px-6"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <p className={`${PHRASE_CLASS} max-w-[760px] [text-wrap:balance]`} style={SIGN_OFF_STYLE}>
          <Phrases text={tp("Take root, and grow a bamboo sea.")} />
        </p>

        <div className="border-paper-100/15 mt-10 border-t pt-10">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-[1.3fr_4fr]">
            <div>
              <img
                src="/brand/logo-wordmark-ondark.svg"
                alt="mosoo"
                width={102}
                height={22}
                className="block h-[22px] w-auto"
              />
              <p className="text-paper-100/70 mt-4 max-w-[280px] text-[16px] leading-[1.6]">
                {t("An open-source, API-first managed Agent runtime for application backends.")}
              </p>
              <div className="mt-5 flex items-center gap-2.5">
                <SocialLink href={MOSOO_GITHUB_URL} label={t("mosoo on GitHub")}>
                  <GithubMark className="size-[18px]" />
                </SocialLink>
                <SocialLink href={MOSOO_X_URL} label={t("mosoo on X")}>
                  <XMark className="size-4" />
                </SocialLink>
              </div>
            </div>

            <nav aria-label={t("Footer")} className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
              {footerGroups().map((group, index) => (
                <div key={group.heading}>
                  {/* Plain labels, not headings: the page outline stays the
                      page's sections. Each list is named by its label. */}
                  <p id={`footer-group-${index}`} className="text-paper-100 text-[15px] font-semibold">
                    {group.heading}
                  </p>
                  <ul aria-labelledby={`footer-group-${index}`} className="mt-4 flex flex-col gap-2">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          translate={link.noTranslate === true ? "no" : undefined}
                          hrefLang={link.hrefLang}
                          className={FOOTER_LINK_CLASS}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="border-paper-100/15 mt-10 border-t pt-6">
            <p className="text-paper-100/70 text-[14px] leading-[1.6]">© 2026 LangGenius, Inc.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
