import type { ReactElement } from "react";

import { GithubMark } from "@/routes/login/github-mark";
import { productHost, PRODUCTS } from "@/routes/login/products";
import type { Product } from "@/routes/login/products";
import { t } from "@/shared/i18n";
import { htmlLanguage, LOCALE_LABELS, LOCALES, locale, localeHref, rememberLocale } from "@/shared/locale";

import { docsUrl, MOSOO_GITHUB_URL, MOSOO_LOGIN_URL, pathToUseCases } from "@/shared/config/external-links";

import "@/shared/styles/site-nav.css";

import { BRAND_MARK } from "./brand-v5.generated";
import { LogoMark } from "./outline";

/**
 * N1 (d-object PROPOSAL §5): a 64px bar on the paper. Left, the 20px solid
 * monochrome mark and the name; right, the home bar's row (owner 2026-10-20
 * 17:15, staging v5/polish/nav/DESIGN.md; src/home/sections/nav.ts): Products ▾,
 * Docs, Use cases, GitHub (its mark), the language ▾ and Sign in. The hero
 * carries the primary button. Static: no hover motion on the mark.
 *
 * Products and the language each open a native popover (popover +
 * popovertarget: open, light dismiss and Esc come from the browser) holding
 * real links: the two products, and this page in the three languages. Up to
 * 860px the whole <nav> is itself the popover the menu button opens, a sheet
 * under the bar with the two panels inline, so every link is in the markup
 * once. The look is shared/styles/site-nav.css.
 */

/** The current language on the bar's switch, as the home's bar shows it (copy/nav.json langShort). */
const LANG_SHORT = { en: "EN", zh: "中文", ja: "日本語" } as const;

/** Production's hero chip says New in every language (origin/main landing/hero.tsx L63-66); the home's panel too. */
const NEW = "New";

const svgHidden = { "aria-hidden": true, focusable: "false" } as const;

/** ▾ in the page's line; it turns over while its panel is open. */
function Chevron(): ReactElement {
  return (
    <svg
      className="d-nav-chev"
      viewBox="0 0 10 6"
      width="10"
      height="6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...svgHidden}
    >
      <path d="M1 1l4 4 4-4" />
    </svg>
  );
}

/** A circle, one meridian and the equator: before the bar's language and the footer's (site-footer.tsx). */
export function Globe({ className }: { className: string }): ReactElement {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      {...svgHidden}
    >
      <circle cx="8" cy="8" r="6.4" />
      <path d="M1.6 8h12.8M8 1.6c1.7 1.8 2.6 4 2.6 6.4S9.7 12.6 8 14.4C6.3 12.6 5.4 10.4 5.4 8S6.3 3.4 8 1.6z" />
    </svg>
  );
}

/**
 * The 12px ink glyph on a product's 20px lime tile: mosoo's own mark (the
 * block and the bar); mosoo computer has no mark on this site, so a line
 * drawing of a screen on a stand stands in (a glyph, not a logo).
 */
function ProductGlyph({ id }: { id: Product["id"] }): ReactElement {
  if (id === "mosoo") {
    return (
      <svg className="d-nav-tile-g" viewBox={BRAND_MARK.vb.join(" ")} fill="currentColor" {...svgHidden}>
        <path d={BRAND_MARK.fill} />
        <path d={BRAND_MARK.bar} fill="none" stroke="currentColor" strokeWidth={BRAND_MARK.stroke} />
      </svg>
    );
  }
  return (
    <svg
      className="d-nav-tile-g"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...svgHidden}
    >
      <rect x="1.1" y="1.6" width="9.8" height="6.6" rx="1.2" />
      <path d="M6 8.2v2.2M3.6 10.4h4.8" />
    </svg>
  );
}

/**
 * What the browser does not do for the popovers, as the home's nav engine does
 * it (src/effects/v5/nav.ts): close an open panel, or the phone sheet, once
 * focus lands outside it and its button (Tab past its last link), so it never
 * covers where focus went (WCAG 2.4.11); and once its button is no longer shown
 * (a tablet turned to landscape with the sheet open: the bar is a row again).
 * focusin, not focusout: focus has already moved, so closing never sends it
 * back to the button. Without JS the menus still open, close and link.
 */
function wirePopovers(bar: HTMLElement | null): (() => void) | undefined {
  if (!bar) {
    return undefined;
  }
  const popovers = [...bar.querySelectorAll<HTMLElement>("[popover]")].map((panel) => ({
    panel,
    button: bar.querySelector(`[popovertarget="${CSS.escape(panel.id)}"]`),
  }));
  const onFocusIn = (event: FocusEvent): void => {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    for (const { panel, button } of popovers) {
      if (panel.matches(":popover-open") && !panel.contains(target) && !button?.contains(target)) {
        panel.hidePopover();
      }
    }
  };
  const onResize = (): void => {
    for (const { panel, button } of popovers) {
      if (panel.matches(":popover-open") && button && button.getClientRects().length === 0) {
        panel.hidePopover();
      }
    }
  };
  document.addEventListener("focusin", onFocusIn);
  window.addEventListener("resize", onResize, { passive: true });
  return () => {
    document.removeEventListener("focusin", onFocusIn);
    window.removeEventListener("resize", onResize);
  };
}

export function SiteNav({ active }: { active?: "use-cases" | undefined }): ReactElement {
  const langShort = LANG_SHORT[locale];
  return (
    <header className="d-nav" ref={wirePopovers}>
      <a href={`/${locale}`} className="d-nav-brand" aria-label={t("mosoo home")}>
        <LogoMark />
        <span aria-hidden="true">mosoo</span>
      </a>
      <div className="d-nav-end">
        <nav aria-label={t("Main")} className="d-nav-row" id="d-nav-menu" popover="auto">
          <div className="d-nav-dd d-nav-dd--products">
            <button type="button" className="d-nav-tg" popoverTarget="d-nav-products">
              {t("Products")}
              <Chevron />
            </button>
            <div className="d-nav-pop d-nav-pop--products" id="d-nav-products" popover="auto">
              <p className="d-nav-pop-h" id="d-nav-products-h">
                {t("Products")}
              </p>
              <ul className="d-nav-prods" aria-labelledby="d-nav-products-h">
                {PRODUCTS.map((product) => (
                  <li key={product.id}>
                    {/* The spaces between the parts are the link's text (its name reads "mosoo Open-source …"); the
                        grid drops them from the layout. */}
                    <a className="d-nav-prod" href={product.href}>
                      <span className="d-nav-tile" aria-hidden="true">
                        <ProductGlyph id={product.id} />
                      </span>{" "}
                      <span className="d-nav-prod-name">
                        <span translate="no">{product.name}</span>
                        {product.id === "computer" ? (
                          <>
                            {" "}
                            <span className="d-nav-new">{NEW}</span>
                          </>
                        ) : null}
                      </span>{" "}
                      <span className="d-nav-prod-line">{product.description}</span>{" "}
                      <span className="d-nav-prod-host" translate="no">
                        {productHost(product)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <a className="d-nav-a" href={docsUrl()}>
            {t("Docs")}
          </a>
          <a className="d-nav-a" href={pathToUseCases()} aria-current={active === "use-cases" ? "page" : undefined}>
            {t("Use cases")}
          </a>
          <a className="d-nav-a d-nav-gh" href={MOSOO_GITHUB_URL} translate="no">
            <GithubMark className="d-nav-ghm" width={18} height={18} focusable="false" />
            <span className="d-nav-gh-t">GitHub</span>
          </a>
          <div className="d-nav-dd d-nav-dd--lang">
            <button
              type="button"
              className="d-nav-tg"
              popoverTarget="d-nav-lang"
              aria-label={t("Language ({lang})").replace("{lang}", langShort)}
            >
              <Globe className="d-nav-globe" />
              <span>{langShort}</span>
              <Chevron />
            </button>
            <div className="d-nav-pop d-nav-pop--lang" id="d-nav-lang" popover="auto">
              <p className="d-nav-pop-h" id="d-nav-lang-h">
                <Globe className="d-nav-globe" />
                <span>{t("Language")}</span>
              </p>
              <ul className="d-nav-langs" aria-labelledby="d-nav-lang-h">
                {LOCALES.map((code) => (
                  <li key={code}>
                    {/* This page in that language; the worker's "/" redirect reads the cookie first. */}
                    <a
                      href={localeHref(code)}
                      hrefLang={htmlLanguage[code]}
                      lang={htmlLanguage[code]}
                      aria-current={code === locale ? "true" : undefined}
                      onClick={() => rememberLocale(code)}
                    >
                      <svg
                        className="d-nav-check"
                        viewBox="0 0 12 12"
                        width="12"
                        height="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        {...svgHidden}
                      >
                        <path d="M2.5 6.2l2.3 2.3 4.7-5" />
                      </svg>
                      <span>{LOCALE_LABELS[code].native}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <a className="d-nav-a d-nav-signin" href={MOSOO_LOGIN_URL}>
            {t("Sign in")}
          </a>
        </nav>
        <button type="button" className="d-nav-menu" popoverTarget="d-nav-menu" aria-label={t("Menu")}>
          <svg
            className="d-nav-burger"
            viewBox="0 0 18 18"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            {...svgHidden}
          >
            <path className="d-nav-burger-a" d="M2 6.25h14" />
            <path className="d-nav-burger-b" d="M2 11.75h14" />
          </svg>
        </button>
      </div>
    </header>
  );
}
