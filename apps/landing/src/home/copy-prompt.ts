// The closing card's Copy button (BRIEF §4 row 5: v4c's copy engine, ported from redesign/v4c
// apps/landing/src/effects/copy-prompt.ts with a cleanup added). Copy puts the [data-prompt] sentence on the
// clipboard; for 1.6 s the button carries data-done (and shows data-copied-label where its [data-copy-label] is
// visible) and the polite [data-copy-status] region says it, so the change reaches icon-only buttons and screen
// readers. If the clipboard write fails, the sentence is selected instead, ready for the reader's own copy.
// The button, the sentence and the status sit in one [data-product-ui] card. Without JS the button is hidden
// (system.css: html:not(.js) [data-copy]) and the sentence is plain, selectable text.

export function initCopyPrompt(root: ParentNode = document): () => void {
  const stops: (() => void)[] = [];
  for (const button of root.querySelectorAll<HTMLButtonElement>("[data-copy]")) {
    const card = button.closest("[data-product-ui]");
    const prompt = card?.querySelector("[data-prompt]");
    const status = card?.querySelector("[data-copy-status]");
    const label = button.querySelector("[data-copy-label]");
    const idle = label?.textContent ?? "";
    const done = button.dataset["copiedLabel"] ?? idle;
    let timer = 0;

    const selectPrompt = (): void => {
      const selection = window.getSelection();
      if (!prompt || !selection) {
        return;
      }
      const range = document.createRange();
      range.selectNodeContents(prompt);
      selection.removeAllRanges();
      selection.addRange(range);
    };

    const onClick = (): void => {
      const text = prompt?.textContent ?? "";
      const write = navigator.clipboard?.writeText(text) ?? Promise.reject(new Error("no clipboard"));
      write.then(() => {
        button.dataset["done"] = "";
        if (label) {
          label.textContent = done;
        }
        if (status) {
          status.textContent = done;
        }
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          delete button.dataset["done"];
          if (label) {
            label.textContent = idle;
          }
          if (status) {
            status.textContent = "";
          }
        }, 1600);
      }, selectPrompt);
    };

    button.addEventListener("click", onClick);
    stops.push(() => {
      button.removeEventListener("click", onClick);
      window.clearTimeout(timer);
    });
  }
  return () => {
    for (const stop of stops) {
      stop();
    }
  };
}
