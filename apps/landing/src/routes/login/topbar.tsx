import type { ReactElement } from "react";

import { locale } from "@/shared/locale";

import { GithubMark } from "./github-mark";
import {
  blogUrl,
  docsUrl,
  MOSOO_CLOUD_URL,
  MOSOO_GITHUB_URL,
  MOSOO_LOGIN_URL,
  pathToUseCases,
} from "./links";
import { copy } from "./landing/home-copy";

export type TopbarNav = "use-cases";

/**
 * The site header (instrument canvas): 64px, the page's two rails run through
 * it, a 1px line under it with a 5px square where each rail crosses it
 * (Mintlify's rails, Lumen's crossings in issue #99). Left: the wordmark at
 * 17px, one ink. Right: two links, the GitHub mark, Sign in and the one filled
 * button (a13n and Mintlify keep their headers this short).
 */
export function LoginLandingTopbar({
  activeNav,
}: {
  activeNav?: TopbarNav | undefined;
  variant?: "bar" | "capsule";
}): ReactElement {
  return (
    <header className="i-nav">
      <div className="i-shell i-nav-shell">
        <a
          href={`/${locale}`}
          aria-label={copy.nav.home}
          className="i-nav-brand"
        >
          <span className="i-wordmark" aria-hidden="true" />
        </a>
        <nav className="i-nav-links" aria-label="Main">
          <a href={docsUrl()} className="i-nav-link">
            {copy.nav.docs}
          </a>
          <a href={blogUrl()} className="i-nav-link">
            {copy.nav.blog}
          </a>
          {activeNav === "use-cases" ? (
            <a
              href={pathToUseCases()}
              className="i-nav-link"
              aria-current="page"
            >
              Use cases
            </a>
          ) : null}
          <a
            href={MOSOO_GITHUB_URL}
            className="i-nav-icon"
            aria-label={copy.nav.github}
          >
            <GithubMark className="size-[18px]" />
          </a>
          <a href={MOSOO_LOGIN_URL} className="i-nav-link i-nav-signin">
            {copy.nav.signIn}
          </a>
          <a href={MOSOO_CLOUD_URL} className="i-btn i-btn-sm">
            {copy.nav.try}
          </a>
        </nav>
      </div>
    </header>
  );
}
