import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import type { ReactElement } from "react";

import { cn } from "@/shared/lib/class-names";
import { useMediaQuery } from "@/shared/lib/use-media-query";

import { FAQ_MESSAGES, t, tp } from "./i18n";
import { SectionHeading, WithCodeTokens } from "./ui";

// API names styled as code inside the answers. Only presentation changes: the
// text stays identical to the FAQPage JSON-LD and llms.txt answers.
const FAQ_CODE_TOKENS = [
  "/api/v2",
  "/api/v1",
  "outputs/",
  "runtime.capacity_exhausted",
  "Idempotency-Key",
] as const;

const QUESTION_CLASS = "faq-question text-ink-900 text-[17px] leading-[1.4] font-semibold";

function Answer({ id, text, hidden }: { id?: string; text: string; hidden?: boolean }): ReactElement {
  return (
    <p id={id} hidden={hidden} className="text-ink-700 mt-2 text-[16px] leading-[1.6]">
      <WithCodeTokens text={text} tokens={FAQ_CODE_TOKENS} />
    </p>
  );
}

/**
 * On phones each question is a disclosure: ten open answers ran to four
 * screens. The question stays an h3 with a button inside (the WAI-ARIA
 * accordion pattern), and the answer stays in the DOM while hidden.
 */
function Disclosure({ question, answer }: { question: string; answer: string }): ReactElement {
  const [open, setOpen] = useState(false);
  const answerId = useId();
  return (
    <div className="border-border-strong border-t">
      <h3 className={QUESTION_CLASS}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={answerId}
          onClick={() => {
            setOpen((value) => !value);
          }}
          className="focus-visible:ring-ring flex min-h-11 w-full items-start justify-between gap-4 rounded-sm py-4 text-left outline-none focus-visible:ring-2"
        >
          <span>{question}</span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "text-ink-500 mt-1 size-4 shrink-0 transition-transform duration-150 ease-out motion-reduce:transition-none",
              open ? "rotate-180" : undefined,
            )}
          />
        </button>
      </h3>
      <div className={open ? "pb-5" : undefined}>
        <Answer id={answerId} text={answer} hidden={!open} />
      </div>
    </div>
  );
}

/**
 * Copy deck §10: ten questions whose text matches the FAQPage structured data
 * and the crawlable fallback. Desktop shows every answer in two columns
 * (owner preference Q1: static cards, all open); phones fold them into
 * disclosures. id="faq" is the fragment the FAQPage @id points at
 * (https://mosoo.ai/en#faq).
 */
export function FaqSection(): ReactElement {
  const folded = useMediaQuery("(max-width: 767px)");
  return (
    <section id="faq" aria-labelledby="faq-title" className="px-4 py-16 md:px-6">
      <SectionHeading id="faq-title" scale="evidence" title={tp("Questions to ask before you build on mosoo")} />
      {folded ? (
        <div className="border-border-strong mt-8 border-b">
          {FAQ_MESSAGES.map((faq) => (
            <Disclosure key={faq.q} question={t(faq.q)} answer={t(faq.a)} />
          ))}
        </div>
      ) : (
        <div className="mt-8 gap-x-14 lg:columns-2">
          {FAQ_MESSAGES.map((faq) => (
            <div key={faq.q} className="border-border-strong break-inside-avoid border-t pt-4 pb-4">
              <h3 className={QUESTION_CLASS}>{t(faq.q)}</h3>
              <Answer text={t(faq.a)} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
