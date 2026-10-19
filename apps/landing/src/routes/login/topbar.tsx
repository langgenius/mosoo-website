import { ChevronDown, Menu, X } from "lucide-react";
import { lazy, Suspense, useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactElement } from "react";

import { t } from "@/shared/i18n";
import { cn } from "@/shared/lib/class-names";
import { useIdleReady } from "@/shared/lib/use-idle-ready";
import {
  htmlLanguage,
  locale,
  LOCALE_LABELS,
  LOCALES,
  localeHref,
  rememberLocale,
} from "@/shared/locale";

import { GithubMark } from "./github-mark";
import {
  blogUrl,
  docsUrl,
  MOSOO_CLOUD_URL,
  MOSOO_GITHUB_URL,
  MOSOO_LOGIN_URL,
  pathToUseCases,
} from "./links";
import { productHost, PRODUCTS, PRODUCTS_TRIGGER_CLASS } from "./products";

export type TopbarNav = "use-cases";

const NAV_LINK_CLASS =
  "hover:text-fg-1 focus-visible:ring-ring inline-flex h-9 items-center rounded-md px-3 text-[14px] font-semibold transition-colors outline-none focus-visible:ring-2";

const ICON_LINK_CLASS =
  "text-fg-2 hover:bg-paper-200/70 hover:text-fg-1 focus-visible:ring-ring flex size-9 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2";

// One label per intent across the site: "Try mosoo" is the only filled button,
// "Sign in" stays a quieter text link (copy deck §1, D7, D11).
const PRIMARY_BUTTON_CLASS =
  "bg-ink-900 text-paper-100 hover:bg-ink-800 focus-visible:ring-ring focus-visible:ring-offset-paper-100 inline-flex shrink-0 items-center justify-center rounded-md px-4 font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const LazyLanguageMenu = lazy(async () => {
  const mod = await import("./language-menu");
  return { default: mod.LanguageMenu };
});

const LazyProductsMenu = lazy(async () => {
  const mod = await import("./products-menu");
  return { default: mod.ProductsMenu };
});

function Brand(): ReactElement {
  return (
    <a
      href={`/${locale}`}
      aria-label={t("mosoo home")}
      className="focus-visible:ring-ring inline-flex shrink-0 items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
    >
      <img
        src="/brand/logo-wordmark-onlight.svg"
        alt=""
        width={102}
        height={22}
        className="block h-[22px] w-auto"
      />
    </a>
  );
}

function ProductsMenuFallback(): ReactElement {
  return (
    <button type="button" disabled className={`${PRODUCTS_TRIGGER_CLASS} cursor-default`}>
      {t("Products")}
      <ChevronDown aria-hidden="true" className="size-3.5" />
    </button>
  );
}

function LanguageMenuFallback(): ReactElement {
  return (
    <button
      type="button"
      aria-label={t("Change language")}
      disabled
      className="text-fg-2 inline-flex h-9 min-w-[64px] cursor-default items-center justify-center gap-2 rounded-md border border-transparent px-2.5 font-mono text-[13px] font-semibold outline-none"
    >
      <span aria-hidden="true" className="bg-green-500 size-1.5 rounded-[1px]" />
      {LOCALE_LABELS[locale].short}
      <ChevronDown aria-hidden="true" className="size-3" />
    </button>
  );
}

function navLinks(activeNav: TopbarNav | undefined): readonly {
  href: string;
  label: string;
  current: boolean;
}[] {
  return [
    { href: docsUrl(), label: t("Docs"), current: false },
    { href: pathToUseCases(), label: t("Use cases"), current: activeNav === "use-cases" },
    { href: blogUrl(), label: t("Blog"), current: false },
  ];
}

/**
 * Below the lg breakpoint the links move into a disclosure panel under the
 * bar. It is a plain disclosure (button + region), not a modal: Escape and
 * the backdrop close it, and focus returns to the toggle.
 */
function MobileMenu({
  id,
  open,
  activeNav,
  onClose,
}: {
  id: string;
  open: boolean;
  activeNav: TopbarNav | undefined;
  onClose: () => void;
}): ReactElement {
  // Always rendered (hidden while closed) so the toggle's aria-controls
  // always points at a real element.
  return (
    <nav
      id={id}
      hidden={!open}
      className="border-border-strong bg-paper-100 absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b shadow-[var(--shadow-lg)] lg:hidden"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-5 md:px-6">
        <div>
          <p className="text-ink-500 px-3 text-[14px] font-semibold">{t("Products")}</p>
          <ul className="mt-1 flex flex-col">
            {PRODUCTS.map((product) => (
              <li key={product.id}>
                <a
                  href={product.href}
                  className="hover:bg-paper-200/70 focus-visible:ring-ring block rounded-md px-3 py-3 transition-colors outline-none focus-visible:ring-2"
                >
                  <span className="flex items-baseline justify-between gap-4">
                    <span translate="no" className="text-fg-1 text-[16px] font-semibold">
                      {product.name}
                    </span>
                    <span translate="no" className="text-ink-500 font-mono text-[13px]">
                      {productHost(product)}
                    </span>
                  </span>
                  <span className="text-ink-500 mt-1 block text-[14px] leading-[1.5]">
                    {product.description}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <ul className="border-border-soft flex flex-col border-t pt-4">
          {navLinks(activeNav).map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                aria-current={link.current ? "page" : undefined}
                className="text-fg-1 hover:bg-paper-200/70 focus-visible:ring-ring flex min-h-11 items-center rounded-md px-3 text-[16px] font-semibold transition-colors outline-none focus-visible:ring-2"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={MOSOO_GITHUB_URL}
              className="text-fg-1 hover:bg-paper-200/70 focus-visible:ring-ring flex min-h-11 items-center gap-2.5 rounded-md px-3 text-[16px] font-semibold transition-colors outline-none focus-visible:ring-2"
            >
              <GithubMark className="size-[18px]" />
              <span>{t("mosoo on GitHub")}</span>
            </a>
          </li>
        </ul>

        <div className="border-border-soft border-t pt-4">
          <p className="text-ink-500 px-3 text-[14px] font-semibold">{t("Change language")}</p>
          <ul className="mt-2 flex flex-wrap gap-2 px-1">
            {LOCALES.map((nextLocale) => (
              <li key={nextLocale}>
                <a
                  href={localeHref(nextLocale)}
                  lang={htmlLanguage[nextLocale]}
                  hrefLang={htmlLanguage[nextLocale]}
                  aria-current={nextLocale === locale ? "true" : undefined}
                  onClick={() => {
                    rememberLocale(nextLocale);
                    onClose();
                  }}
                  className={cn(
                    "focus-visible:ring-ring inline-flex min-h-11 items-center rounded-md border px-3.5 text-[15px] font-semibold transition-colors outline-none focus-visible:ring-2",
                    nextLocale === locale
                      ? "border-ink-900 text-fg-1"
                      : "border-border-strong text-fg-2 hover:text-fg-1",
                  )}
                >
                  {LOCALE_LABELS[nextLocale].native}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-border-soft flex flex-wrap gap-3 border-t pt-5">
          <a
            href={MOSOO_LOGIN_URL}
            className="border-border-strong text-fg-1 hover:bg-paper-200 focus-visible:ring-ring inline-flex min-h-11 flex-1 items-center justify-center rounded-md border px-4 text-[15px] font-semibold transition-colors outline-none focus-visible:ring-2"
          >
            {t("Sign in")}
          </a>
          <a href={MOSOO_CLOUD_URL} data-cta="primary" className={cn(PRIMARY_BUTTON_CLASS, "min-h-11 flex-1 text-[15px]")}>
            {t("Try mosoo")}
          </a>
        </div>
      </div>
    </nav>
  );
}

export function LoginLandingTopbar({
  activeNav,
  variant = "bar",
}: {
  activeNav?: TopbarNav | undefined;
  /** "capsule" floats the header as a low pill on tablets and up (home page, v2a). */
  variant?: "bar" | "capsule";
}): ReactElement {
  const loadDeferredMenus = useIdleReady();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMenu = (): void => {
    setMenuOpen(false);
  };

  const closeMenuOnEscape = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key === "Escape" && menuOpen) {
      event.stopPropagation();
      setMenuOpen(false);
      toggleRef.current?.focus();
    }
  };

  return (
    <>
      <header
        onKeyDown={closeMenuOnEscape}
        className={cn(
          "site-header border-border-soft bg-paper-100/85 sticky top-0 z-50 border-b backdrop-blur-md",
          variant === "capsule" ? "site-header-capsule" : null,
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 md:px-6">
          <Brand />

          <div className="hidden min-w-0 flex-1 items-center justify-between gap-4 lg:flex">
            <div className="flex items-center gap-1 pl-4">
              {loadDeferredMenus ? (
                <Suspense fallback={<ProductsMenuFallback />}>
                  <LazyProductsMenu />
                </Suspense>
              ) : (
                <ProductsMenuFallback />
              )}
              {navLinks(activeNav).map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={link.current ? "page" : undefined}
                  className={cn(NAV_LINK_CLASS, link.current ? "text-fg-1" : "text-fg-2")}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-1">
              {loadDeferredMenus ? (
                <Suspense fallback={<LanguageMenuFallback />}>
                  <LazyLanguageMenu />
                </Suspense>
              ) : (
                <LanguageMenuFallback />
              )}
              <a
                href={MOSOO_GITHUB_URL}
                aria-label={t("mosoo on GitHub")}
                title={t("mosoo on GitHub")}
                className={ICON_LINK_CLASS}
              >
                <GithubMark className="size-[18px]" />
              </a>
              <a href={MOSOO_LOGIN_URL} className={cn(NAV_LINK_CLASS, "text-fg-2")}>
                {t("Sign in")}
              </a>
              <a href={MOSOO_CLOUD_URL} data-cta="primary" className={cn(PRIMARY_BUTTON_CLASS, "ml-1 h-9 text-[14px]")}>
                {t("Try mosoo")}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <a href={MOSOO_CLOUD_URL} data-cta="primary" className={cn(PRIMARY_BUTTON_CLASS, "h-11 text-[15px]")}>
              {t("Try mosoo")}
            </a>
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? t("Close menu") : t("Open menu")}
              onClick={() => {
                setMenuOpen((open) => !open);
              }}
              className="text-fg-1 hover:bg-paper-200/70 focus-visible:ring-ring inline-flex size-11 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2"
            >
              {menuOpen ? (
                <X aria-hidden="true" className="size-5" />
              ) : (
                <Menu aria-hidden="true" className="size-5" />
              )}
            </button>
          </div>
        </div>

        <MobileMenu id={menuId} open={menuOpen} activeNav={activeNav} onClose={closeMenu} />
      </header>
      {menuOpen ? (
        // Click-away layer under the sticky header; the header itself stays
        // interactive above it.
        <div
          aria-hidden="true"
          onClick={closeMenu}
          className="bg-ink-900/20 fixed inset-0 z-40 lg:hidden"
        />
      ) : null}
    </>
  );
}
