import type { CSSProperties, FocusEvent, ReactElement, ReactNode } from "react";

import { t } from "@/shared/i18n";

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
  MOSOO_OPENAPI_V2_URL,
  MOSOO_RELEASES_URL,
  MOSOO_SECURITY_URL,
  MOSOO_SPEC_URL,
  MOSOO_X_URL,
  pathToUseCases,
  statusPath,
} from "../links";
import { XMark } from "../x-mark";

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
// version string and no self-hosting line.
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
        { label: "CLI", href: docsUrl("cli/overview/"), noTranslate: true },
        { label: t("Changelog"), href: MOSOO_CHANGELOG_URL, hrefLang: "en" },
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

const SIGN_OFF_STYLE = {
  fontSize: "clamp(28px, 3.4vw, 44px)",
  lineHeight: 1.1,
} satisfies CSSProperties;

const FOOTER_LINK_CLASS =
  "text-ink-700 hover:text-ink-900 focus-visible:ring-ring rounded-sm text-[15px] leading-[1.5] underline decoration-transparent underline-offset-4 transition-colors outline-none hover:decoration-current/40 focus-visible:ring-2";

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
      className="border-ink-900/15 text-ink-700 hover:bg-ink-900/[0.05] hover:text-ink-900 focus-visible:ring-ring inline-flex size-10 items-center justify-center rounded-md border transition-colors outline-none focus-visible:ring-2"
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

/**
 * The footer every landing page shares: the link groups on plain paper, then
 * the large lowercase wordmark resting on the static halftone bamboo landscape
 * (#127; scripts/brand-assets/MANIFEST.md, use (b)). The landscape is
 * decorative and ends the page after the links, never under them.
 */
/** Keeps 竹の海 / 竹海 whole in the tagline (it broke as 竹の / 海). */
function KeepTagline({ text }: { text: string }): ReactElement {
  const parts = text.split(/(竹の海|竹海)/);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <span key={index} className="whitespace-nowrap">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function LandingFooter(): ReactElement {
  return (
    <footer onFocus={revealPinnedFooter} className="landing-footer bg-paper-100 text-ink-900">
      <div className="px-4 pt-16 md:px-6 md:pt-20">
        <div className="mx-auto w-full max-w-[1280px]">
          <p className="landing-footer-signoff max-w-[760px] [text-wrap:balance]" style={SIGN_OFF_STYLE}>
            <KeepTagline text={t("Take root, and grow a bamboo sea.")} />
          </p>

          <div className="mt-12 border-t border-[rgba(109,120,106,0.35)] pt-12">
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
              <div className="col-span-2 md:col-span-3 lg:col-span-1">
                <p className="text-ink-700 max-w-[280px] text-[16px] leading-[1.6]">
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

              {footerGroups().map((group) => (
                <div key={group.heading}>
                  <h2 className="text-ink-900 text-[15px] font-semibold">{group.heading}</h2>
                  <ul className="mt-4 flex flex-col gap-2.5">
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
            </div>

            <p className="text-ink-500 mt-14 text-[14px] leading-[1.6]">© 2026 LangGenius, Inc.</p>
          </div>
        </div>
      </div>

      <div className="relative mt-10 overflow-hidden">
        <span role="img" aria-label="mosoo" className="landing-footer-wordmark" />
        <picture>
          <source
            media="(max-width: 640px)"
            srcSet="/landing/bamboo/bamboo-landscape-1200.png"
            width={1200}
            height={600}
          />
          <img
            src="/landing/bamboo/bamboo-landscape-2880.png"
            srcSet="/landing/bamboo/bamboo-landscape-1440.png 1440w, /landing/bamboo/bamboo-landscape-2880.png 2880w"
            sizes="100vw"
            width={2880}
            height={800}
            alt=""
            loading="lazy"
            decoding="async"
            className="landing-footer-landscape"
          />
        </picture>
      </div>
    </footer>
  );
}
