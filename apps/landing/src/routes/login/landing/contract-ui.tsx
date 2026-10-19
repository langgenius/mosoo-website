import { useCallback, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";

import { MOSOO_SPEC_URL } from "../links";

/**
 * Citations in the left margin: the product spec section a block restates.
 * They are links to the source, not labels, so they read as plain text (no
 * capitals, no tracking). Section titles stay in English, as the spec does.
 */
export const SPEC_SECTIONS = {
  all: { label: "SPEC", title: "The product contract", anchor: "" },
  s1: { label: "SPEC §1", title: "Product", anchor: "#1-product" },
  s2: { label: "SPEC §2", title: "Projects, keys and credentials", anchor: "#2-projects-keys-and-credentials" },
  s3: { label: "SPEC §3", title: "Configuration and presets", anchor: "#3-configuration-and-presets" },
  s4: { label: "SPEC §4", title: "Sessions and durability", anchor: "#4-sessions-and-durability" },
  s5: { label: "SPEC §5", title: "Execution and usage", anchor: "#5-execution-and-usage" },
  s7: { label: "SPEC §7", title: "Acceptance", anchor: "#7-acceptance" },
  s8: { label: "SPEC §8", title: "Scope", anchor: "#8-scope" },
} as const;

export type SpecSection = keyof typeof SPEC_SECTIONS;

export function SpecCite({ section }: { section: SpecSection }): ReactElement {
  const { label, title, anchor } = SPEC_SECTIONS[section];
  return (
    <p className="ct-cite">
      <a href={`${MOSOO_SPEC_URL}${anchor}`} lang="en" translate="no">
        <span>{label}</span>
        <span className="ct-cite-title">{title}</span>
      </a>
    </p>
  );
}

/** One block of the document: heading, its citations, then the body. */
export function ContractSection({
  id,
  title,
  cites,
  children,
}: {
  id: string;
  title: string;
  cites: readonly SpecSection[];
  children: ReactNode;
}): ReactElement {
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId} className="ct-section">
      <div className="ct-head">
        <h2 id={titleId} className="ct-h2">
          {title}
        </h2>
        <div className="ct-cites">
          {cites.map((section) => (
            <SpecCite key={section} section={section} />
          ))}
        </div>
      </div>
      <div className="ct-body">{children}</div>
    </section>
  );
}

/** A product moment shown as a captioned exhibit, wider than the text. */
export function Exhibit({
  label,
  caption,
  children,
  after,
}: {
  label: string;
  caption: ReactNode;
  children: ReactNode;
  after?: ReactNode;
}): ReactElement {
  return (
    <figure className="ct-exhibit">
      <div className="ct-exhibit-frame">{children}</div>
      <figcaption className="ct-ui">
        <span className="ct-exhibit-label">{label}</span> {caption}
      </figcaption>
      {after}
    </figure>
  );
}

type SealState = "shown" | "waiting" | "stamping";

/**
 * The one "committed" seal. It renders stamped (the end state: no JavaScript,
 * reduced motion, screenshots). Inside a live page it watches the product
 * moment it sits on: while the moment replays its turn, the seal waits; when
 * the replay ends, the turn has committed and the seal is stamped once, then
 * stays still. Later replays leave it alone.
 */
export function useCommitSeal(): {
  frameRef: (node: HTMLDivElement | null) => void;
  state: SealState;
} {
  const [state, setState] = useState<SealState>("shown");
  const done = useRef(false);
  const observer = useRef<MutationObserver | null>(null);

  const frameRef = useCallback((node: HTMLDivElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (node === null || done.current) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      done.current = true;
      return;
    }
    let seen = false;
    const watch = new MutationObserver(() => {
      const replaying = node.querySelector("[data-replaying]") !== null;
      if (replaying && !seen) {
        seen = true;
        setState("waiting");
      } else if (!replaying && seen) {
        done.current = true;
        watch.disconnect();
        setState("stamping");
      }
    });
    watch.observe(node, { attributes: true, attributeFilter: ["data-replaying"], subtree: true });
    observer.current = watch;
  }, []);

  return { frameRef, state };
}

export function Seal({ turn, word, state }: { turn: string; word: string; state: SealState }): ReactElement {
  return (
    <span className="ct-seal" data-state={state === "shown" ? undefined : state} aria-hidden="true">
      <span>
        <span className="ct-seal-turn">{turn}</span>
        <span className="ct-seal-word">{word}</span>
      </span>
    </span>
  );
}

/** Renders the `backtick` spans of a translated string as inline code. */
export function Inline({ text }: { text: string }): ReactElement {
  const parts = text.split("`");
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          // Fragments of a static string: the index is a stable key.
          <code key={index} translate="no">
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}
