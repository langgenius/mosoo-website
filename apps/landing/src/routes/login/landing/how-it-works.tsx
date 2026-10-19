import type { ReactElement } from "react";

import { locale } from "@/shared/locale";

import { docsUrl } from "../links";
import { t } from "./i18n";
import { ArrowLink, WithCode, Phrases, SpecCite } from "./ui";

// Copy deck §6 with the one example story: the request is the product kit's
// (upload input.csv, then start the Session with it attached), the same CSV
// run the hero shows. Each step names what goes in, what changes and what
// comes out (#128).
function steps(): readonly { title: string; body: string; input: string; change: string; output: string }[] {
  return [
    {
      title: t("Add your model key."),
      body: t(
        "Add a provider key to your Project, then create a Project API key. It starts with `msp_` and is shown once.",
      ),
      input: t("your provider key"),
      change: t("The key is stored with your Project, outside every sandbox."),
      output: t("a Project API key"),
    },
    {
      title: t("Start a Session."),
      body: t(
        "Send one request with the harness, provider, model, instructions, input, and any files. Save the `thread.id` you get back.",
      ),
      input: t("one request"),
      change: t("mosoo creates a durable Session, a Thread in the API, and runs the first turn."),
      output: t("a `thread.id`"),
    },
    {
      title: t("mosoo runs the turn."),
      body: t("The harness writes code and runs tools in the Session’s own sandbox. Your keys stay outside it."),
      input: t("the turn"),
      change: t("Events, usage, and a checkpoint are committed together."),
      output: t("events, artifacts, usage, and a checkpoint"),
    },
    {
      title: t("Follow, download, continue."),
      body: t(
        "Stream events over SSE, download files from `outputs/`, and read the usage of every model call. Reply to the same Thread whenever you’re ready.",
      ),
      input: t("a follow-up, now or days later"),
      change: t("mosoo restores the working directory and the conversation from the last checkpoint."),
      output: t("the next turn in the same Session"),
    },
  ];
}

/** Keeps hyphenated words such as "follow-up" whole when a heading wraps. */
function KeepHyphenated({ text }: { text: string }): ReactElement {
  const parts = text.split(/(\S+-\S+)/);
  return (
    <>
      {parts.map((part, index) =>
        /\S+-\S+/.test(part) ? (
          // Pieces of a fixed string: the index is a stable key.
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

export function HowItWorks(): ReactElement {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="v2a-section v2a-band v2a-roomy">
      <span aria-hidden="true" className="v2a-node" style={{ top: 134 }} />
      <div className="grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:gap-14">
        <div>
          <h2 id="how-title" className="v2a-display v2a-h2">
            {locale === "en" ? (
              <KeepHyphenated text={t("One request starts a Session. A follow-up continues it.")} />
            ) : (
              <Phrases text={t("One request starts a Session. A follow-up continues it.")} />
            )}
          </h2>
          <SpecCite section="s4" />
          <p className="v2a-intro">
            <WithCode
              text={t(
                "Say your backend needs a report on a CSV file. It calls mosoo over HTTPS with a Project API key, and the report comes back as files under `outputs/`.",
              )}
            />
          </p>
          <ol className="mt-10">
            {steps().map((step, index) => (
              <li
                key={step.title}
                className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-x-4 border-t border-[rgba(109,120,106,0.35)] py-7"
              >
                {/* A short culm per step: the steps are one Session's growth. */}
                <span aria-hidden="true" className="flex flex-col items-center pt-1.5">
                  <span className="block h-[22px] w-[10px] rounded-[1px] border border-[#6d786a] bg-[#e3e8d9]" />
                  <span
                    className={
                      index === 2
                        ? "mt-[2px] block h-[3px] w-[10px] rounded-[1px] border border-[#3a6e0e] bg-[#6fd305]"
                        : "mt-[2px] block h-[3px] w-[10px] rounded-[1px] bg-[#6d786a]"
                    }
                  />
                </span>
                <div>
                  <h3 className="text-ink-900 text-[19px] leading-[1.35] font-semibold">{step.title}</h3>
                  <p className="text-ink-700 mt-2 text-[16px] leading-[1.6]">
                    <WithCode text={step.body} />
                  </p>
                  <dl className="mt-4 grid gap-y-2 text-[16px] leading-[1.5]">
                    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3">
                      <dt className="v2a-label pt-px">{t("In")}</dt>
                      <dd className="text-ink-900">
                        <WithCode text={step.input} />
                      </dd>
                    </div>
                    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3">
                      <dt className="v2a-label pt-px">{t("Change")}</dt>
                      <dd className="text-ink-700">
                        <WithCode text={step.change} />
                      </dd>
                    </div>
                    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3">
                      <dt className="v2a-label pt-px">{t("Out")}</dt>
                      <dd className="text-ink-900">
                        <WithCode text={step.output} />
                      </dd>
                    </div>
                  </dl>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="self-start xl:sticky xl:top-24">
          <div className="mt-5 flex flex-col gap-2">
            <ArrowLink href={docsUrl("api-reference-v2/")} className="self-start">
              {t("Open the v2 API reference")}
            </ArrowLink>
            <p className="text-ink-500 text-[16px] leading-[1.6]">
              {t("Model IDs change often. Check the models available in your Project before you copy this.")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
