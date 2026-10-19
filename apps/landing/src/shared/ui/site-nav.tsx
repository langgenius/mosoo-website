import type { ReactElement } from "react";

import { t } from "@/shared/i18n";
import { locale } from "@/shared/locale";

import { docsUrl, MOSOO_GITHUB_URL, MOSOO_LOGIN_URL, pathToUseCases } from "@/shared/config/external-links";

import { LogoMark } from "./outline";

/**
 * N1 (d-object PROPOSAL §5): a 64px bar on the paper. Left, the 20px solid
 * monochrome mark and the name; right, text links only. The hero carries the
 * primary button. Static: no hover motion on the mark.
 */
export function SiteNav({ active }: { active?: "use-cases" | undefined }): ReactElement {
  return (
    <header className="d-nav">
      <a href={`/${locale}`} className="d-nav-brand" aria-label={t("mosoo home")}>
        <LogoMark />
        <span aria-hidden="true">mosoo</span>
      </a>
      <nav aria-label={t("Main")} className="d-nav-links">
        <a href={docsUrl()}>{t("Docs")}</a>
        <a href={pathToUseCases()} aria-current={active === "use-cases" ? "page" : undefined} className="d-hide-sm">
          {t("Use cases")}
        </a>
        <a href={MOSOO_GITHUB_URL} translate="no" className="d-hide-sm">
          GitHub
        </a>
        <a href={MOSOO_LOGIN_URL}>{t("Sign in")}</a>
      </nav>
    </header>
  );
}
