import type { CSSProperties, ReactElement } from "react";

import { locale } from "@/shared/locale";

import { GithubMark } from "../github-mark";
import {
  MOSOO_API_REFERENCE_URL,
  MOSOO_BLOG_URL,
  MOSOO_DOCS_URL,
  MOSOO_GITHUB_URL,
  MOSOO_LICENSE_URL,
  MOSOO_RELEASES_URL,
  MOSOO_SECURITY_URL,
  MOSOO_X_URL,
} from "../links";
import { XMark } from "../x-mark";
import { t } from "./i18n";
import { DISPLAY_FONT } from "./typography";

type FooterLink = { label: string; href: string; internal?: boolean };

const RESOURCE_LINKS: readonly FooterLink[] = [
  { label: t("Pricing"), href: `/${locale}/pricing`, internal: true },
  { label: t("Use cases"), href: `/${locale}/use-cases`, internal: true },
  { label: t("Status"), href: `/${locale}/status`, internal: true },
  {
    label: t("Blog"),
    href: locale === "en" ? MOSOO_BLOG_URL : `${MOSOO_BLOG_URL}/${locale}`,
    internal: true,
  },
  { label: t("Docs"), href: MOSOO_DOCS_URL },
  { label: t("API docs"), href: MOSOO_API_REFERENCE_URL },
  { label: t("Releases"), href: MOSOO_RELEASES_URL },
];

const APP_LINKS: readonly FooterLink[] = [
  { label: "GitHub", href: MOSOO_GITHUB_URL },
  { label: t("License"), href: MOSOO_LICENSE_URL },
  { label: t("Security"), href: MOSOO_SECURITY_URL },
];

const TAGLINE_STYLE = {
  fontFamily: DISPLAY_FONT,
  fontSize: "clamp(30px, 4.6vw, 56px)",
  fontWeight: 500,
  letterSpacing: "-0.025em",
  lineHeight: 1.04,
} satisfies CSSProperties;

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: readonly FooterLink[];
}): ReactElement {
  return (
    <div>
      <p className="text-paper-100/70 text-[11px] font-semibold tracking-[0.14em] uppercase">
        {heading}
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              {...(link.internal ? {} : { target: "_blank", rel: "noreferrer noopener" })}
              className="text-paper-100/85 hover:text-paper-100 focus-visible:ring-paper-100/40 rounded-sm text-[13.5px] transition-colors outline-none focus-visible:ring-2"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactElement;
}): ReactElement {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      title={label}
      className="border-paper-100/15 text-paper-100/85 hover:bg-paper-100/10 hover:text-paper-100 focus-visible:ring-paper-100/40 inline-flex size-9 items-center justify-center rounded-md border transition-colors outline-none focus-visible:ring-2"
    >
      {children}
    </a>
  );
}

export function LandingFooter(): ReactElement {
  return (
    <footer className="text-paper-100 bg-[#050805] px-4 pt-16 pb-10 md:px-6 md:pt-20">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="max-w-[760px]">
          <p className="[text-wrap:balance]" style={TAGLINE_STYLE}>
            {t("Take root, and grow a bamboo sea.")}
          </p>
        </div>

        <div className="border-paper-100/10 mt-12 border-t pt-12">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
            <div>
              <img src="/brand/logo-wordmark-ondark.svg" alt="mosoo" className="block h-[22px]" />
              <p className="text-paper-100/55 mt-4 max-w-[260px] text-[13.5px] leading-[1.6]">
                {t("Open-source agent runtime and API for coding agents.")}
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
            <FooterColumn heading={t("Resources")} links={RESOURCE_LINKS} />
            <FooterColumn heading={t("App")} links={APP_LINKS} />
          </div>

          <div className="border-paper-100/10 mt-14 flex flex-col items-start justify-between gap-3 border-t pt-6 md:flex-row md:items-center">
            <p className="text-paper-100/70 font-mono text-[11px] leading-[1.6] tracking-[0.18em] uppercase">
              © 2026 LangGenius, Inc.
            </p>
            <p className="text-paper-100/70 font-mono text-[11px] leading-[1.6] tracking-[0.18em] uppercase">
              {t("Self-hostable · BYOK")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
