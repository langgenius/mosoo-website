import type { ReactElement } from "react";

import { ApiCall } from "@/product-kit/components/api-call";
import { locale } from "@/shared/locale";

import { docsUrl } from "../links";
import { t } from "./i18n";
import { Fact, Lede, StageFigure, StageHeading } from "./stage";
import { ArrowLink, WithCode } from "./ui";

// Copy deck §6, told with the hero's CSV story: the two calls on the right
// are the product kit's ApiCall (PM-11), the upload of input.csv and the
// Session that attaches it, with their 201 responses. From 768px the island
// is zoomed (.stage-zoom, 1.15), so --kit-code-size 0.875rem sets the code at
// about 16px, the body size; phones keep 1rem unzoomed.

function steps(): readonly { title: string; body: string; input: string; output: string }[] {
  return [
    {
      title: t("Add your model key."),
      body: t(
        "Add a provider key to your Project, then create a Project API key. It starts with `msp_` and is shown once.",
      ),
      input: t("your provider key"),
      output: t("a Project API key"),
    },
    {
      title: t("Start a Session."),
      body: t(
        "Send one request with the harness, provider, model, instructions, input, and any files. Save the `thread.id` you get back.",
      ),
      input: t("one request"),
      output: t("a `thread.id`"),
    },
    {
      title: t("mosoo runs the turn."),
      body: t("The harness writes code and runs tools in the Session’s own sandbox. Your keys stay outside it."),
      input: t("the turn"),
      output: t("events, artifacts, usage, and a checkpoint"),
    },
    {
      title: t("Follow, download, continue."),
      body: t(
        "Stream events over SSE, download files from `outputs/`, and read the usage of every model call. Reply to the same Thread whenever you’re ready.",
      ),
      input: t("a follow-up, now or days later"),
      output: t("the next turn in the same Session"),
    },
  ];
}

export function HowItWorks(): ReactElement {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="border-border-strong border-t px-4 py-20 md:px-6 lg:py-28">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <StageHeading id="how-title">{t("One request starts a Session and its first turn")}</StageHeading>
          <Lede>
            <WithCode
              text={t(
                "Your backend uploads `input.csv`, then starts a Session with the file attached.",
              )}
            />
          </Lede>
          <ol className="border-border-strong mt-8 border-t">
            {steps().map((step, index) => (
              <li
                key={step.title}
                className="border-border-strong grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 border-b py-5"
              >
                <span aria-hidden="true" className="text-ink-500 pt-[2px] font-mono text-[16px]">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-ink-900 text-[18px] leading-[1.35] font-semibold">{step.title}</h3>
                  <p className="text-ink-600 mt-1.5 text-[16px] leading-[1.6]">
                    <WithCode text={step.body} />
                  </p>
                  <p className="text-ink-500 mt-2 text-[16px] leading-[1.5]">
                    <span className="text-ink-900 font-semibold">{t("In")}</span> <WithCode text={step.input} />
                    <span aria-hidden="true" className="text-ink-300 px-2">
                      /
                    </span>
                    <span className="text-ink-900 font-semibold">{t("Out")}</span> <WithCode text={step.output} />
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <Fact>
            <WithCode
              text={t(
                "Attachments mount read-only. Anything the Agent writes under `outputs/` becomes a downloadable artifact. Watch progress over SSE or read the saved history.",
              )}
            />{" "}
            {t(
              "Events are saved before they’re sent, and stable IDs let a client reconnect without duplicates. There are no Webhooks.",
            )}
          </Fact>
        </div>

        <div className="min-w-0">
          <StageFigure
            sizes="(max-width: 1023px) calc(100vw - 32px), 56vw"
            caption={t("Model IDs change often. Check the models available in your Project before you copy this.")}
            windowClassName="md:[--kit-code-size:0.875rem]"
          >
            <ApiCall locale={locale} />
          </StageFigure>
          <ArrowLink href={docsUrl("api-reference-v2/")} className="mt-4">
            {t("Open the v2 API reference")}
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}
