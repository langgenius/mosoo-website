import type { ReactElement } from "react";

import { KeyBoundary } from "@/product-kit/components/key-boundary";
import { RuntimeMatrix } from "@/product-kit/components/runtime-matrix";
import { SessionContinuation } from "@/product-kit/components/session-continuation";
import { TurnReceipt } from "@/product-kit/components/turn-receipt";
import { locale } from "@/shared/locale";

import { t } from "./i18n";
import { Fact, Lede, StageFigure, StageHeading } from "./stage";
import { WithCode } from "./ui";

// The four product moments after the hero, each one h2 assertion with the
// console's own DOM as its evidence (product kit PM-02, PM-04, PM-01, PM-08).
// All of them tell the hero's CSV story. Compositions alternate so no two
// neighbours share a layout: sticky text beside a tall stage, stage before
// text, a split header over a wide stage.

/** PM-02: the same Thread seven days later, on the sunken band. */
export function ContinueSection(): ReactElement {
  return (
    <section id="continue" aria-labelledby="continue-title" className="bg-paper-200 px-4 py-20 md:px-6 lg:py-28">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-14">
        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <StageHeading id="continue-title">{t("A follow-up 7 days later continues the same Session")}</StageHeading>
          <Lede>
            {t(
              "Follow-ups continue the same Session, even after the sandbox was reclaimed. The working directory, conversation, and files return from the last checkpoint.",
            )}
          </Lede>
          <Lede className="mt-3">
            <WithCode
              text={t(
                "Turn 2 finds `input.csv` and `.private/nonce` where turn 1 left them. The backend sends only the new message.",
              )}
            />
          </Lede>
          <Fact>
            {t(
              "If that checkpoint can’t be restored, the follow-up fails with an error. API Sessions have no inactivity deadline.",
            )}
          </Fact>
        </div>
        <StageFigure
          sizes="(max-width: 1023px) calc(100vw - 32px), 62vw"
          caption={t("One Thread in the console: turn 1, 7 idle days, turn 2 from the checkpoint, and a cancelled turn 3.")}
          windowClassName="bg-paper-100 p-3 sm:p-5"
        >
          <SessionContinuation locale={locale} animate showCancelledTurn />
        </StageFigure>
      </div>
    </section>
  );
}

/** PM-04: the stage first, the reading second; the matrix is clickable. */
export function RuntimesSection(): ReactElement {
  return (
    <section id="runtimes" aria-labelledby="runtimes-title" className="px-4 py-20 md:px-6 lg:py-28">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center lg:gap-14">
        <div className="min-w-0 lg:order-2">
          <StageHeading id="runtimes-title">
            {t("Runtime and model are separate choices, checked before anything runs")}
          </StageHeading>
          <Lede>
            {t(
              "Run OpenAI Codex, Claude Agent SDK, OpenCode, or Pi. Each Session freezes its runtime, model, and protocol, and nothing falls back silently.",
            )}
          </Lede>
          <Fact>{t("A runtime and model protocol that don’t match are rejected before anything runs.")}</Fact>
          <ul className="text-ink-500 mt-4 max-w-[34em] space-y-2 text-[16px] leading-[1.6]">
            <li>{t("Provider keys belong to your Project, and the provider bills your account directly.")}</li>
            <li>
              {t("Names and logos identify compatible services and don’t imply a partnership or endorsement.")}
            </li>
          </ul>
        </div>
        <StageFigure
          className="lg:order-1"
          sizes="(max-width: 1023px) calc(100vw - 32px), 58vw"
          caption={t("Click a runtime: the model list keeps only the models its protocols can serve.")}
        >
          <RuntimeMatrix locale={locale} />
        </StageFigure>
      </div>
    </section>
  );
}

/** A split header (heading left, reading right) over a wide stage. */
function SplitHeader({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactElement | ReactElement[];
}): ReactElement {
  return (
    <div className="grid grid-cols-1 gap-x-14 gap-y-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
      <StageHeading id={id} className="max-w-[16em]">
        {title}
      </StageHeading>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** PM-01: what "completed" means, as the receipt the console keeps. */
export function TurnsSection(): ReactElement {
  return (
    <section id="turns" aria-labelledby="turns-title" className="border-border-strong border-t px-4 py-20 md:px-6 lg:py-28">
      <div className="mx-auto max-w-[1280px]">
        <SplitHeader id="turns-title" title={t("A turn succeeds only when its results are saved")}>
          <Lede className="lg:mt-0">
            {t(
              "Completion means the events, usage, and a checkpoint were committed together. A failed or cancelled turn never overwrites the last good state.",
            )}
          </Lede>
          <Fact className="mt-4">{t("From the product spec: “Model or tool execution ending is not success.”")}</Fact>
        </SplitHeader>
        <StageFigure
          className="mt-12"
          padClassName="p-3 sm:p-8 lg:px-[12%] lg:py-14"
          sizes="(max-width: 1023px) calc(100vw - 32px), 90vw"
          caption={t("Turn 1’s events in the console, in the order mosoo saved them.")}
        >
          <TurnReceipt locale={locale} animate />
        </StageFigure>
      </div>
    </section>
  );
}

/** PM-08: the credential boundary, the widest stage on the page. */
export function KeysSection(): ReactElement {
  return (
    <section id="keys" aria-labelledby="keys-title" className="bg-paper-200 px-4 py-20 md:px-6 lg:py-28">
      <div className="mx-auto max-w-[1280px]">
        <SplitHeader id="keys-title" title={t("Provider keys never enter the sandbox")}>
          <Lede className="lg:mt-0">
            {t(
              "Provider keys and MCP credentials never enter the sandbox. The runtime reaches models and tools through mosoo’s proxies, which add the credential per request.",
            )}
          </Lede>
          <Fact className="mt-4">
            {t("The sandbox only gets expiring grants. Environment variables are different. Code in the sandbox can read them.")}
          </Fact>
        </SplitHeader>
        <StageFigure
          className="mt-12"
          accent
          example={false}
          padClassName="p-3 sm:p-8 lg:px-[8%] lg:py-14"
          sizes="(max-width: 1023px) calc(100vw - 32px), 90vw"
          caption={t("Drawn from the product spec and the architecture notes. The console has no such screen.")}
        >
          <KeyBoundary locale={locale} animate />
        </StageFigure>
      </div>
    </section>
  );
}
