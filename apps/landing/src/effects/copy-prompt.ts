// U06 closing card: Copy puts the one-line instruction on the clipboard. For 1.6 s the button shows a
// check mark (and "Copied" where the label is visible) and a polite live region says "Copied", so the
// state change reaches phones (icon-only button) and screen readers. If the clipboard write fails, the
// sentence is selected instead, ready for the reader's own copy. Without JS the sentence is plain,
// selectable text in the card.

export function initCopyPrompt(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-copy]")) {
    const card = button.closest("[data-product-ui]");
    const prompt = card?.querySelector("[data-prompt]");
    const status = card?.querySelector("[data-copy-status]");
    const text = prompt?.textContent ?? "";
    const label = button.querySelector("[data-copy-label]");
    const idle = label?.textContent ?? "";
    const done = button.dataset["copiedLabel"] ?? idle;
    let timer = 0;

    const selectPrompt = (): void => {
      const selection = window.getSelection();
      if (!prompt || !selection) return;
      const range = document.createRange();
      range.selectNodeContents(prompt);
      selection.removeAllRanges();
      selection.addRange(range);
    };

    button.addEventListener("click", () => {
      const write = navigator.clipboard?.writeText(text) ?? Promise.reject(new Error("no clipboard"));
      write.then(
        () => {
          button.dataset["done"] = "";
          if (label) label.textContent = done;
          if (status) status.textContent = done;
          window.clearTimeout(timer);
          timer = window.setTimeout(() => {
            delete button.dataset["done"];
            if (label) label.textContent = idle;
            if (status) status.textContent = "";
          }, 1600);
        },
        selectPrompt,
      );
    });
  }
}
