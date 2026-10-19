// U06 closing card: Copy puts the one-line instruction on the clipboard and says "Copied" for 1.6 s
// (UI-FORMS U06: the conversion action is the object itself). Without JS the sentence is plain,
// selectable text in the card.

export function initCopyPrompt(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-copy]")) {
    const card = button.closest("[data-product-ui]");
    const text = card?.querySelector("[data-prompt]")?.textContent ?? "";
    const label = button.querySelector("[data-copy-label]");
    const idle = label?.textContent ?? "";
    let timer = 0;
    button.addEventListener("click", () => {
      void navigator.clipboard?.writeText(text).then(() => {
        if (!label) return;
        label.textContent = button.dataset["copiedLabel"] ?? idle;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => (label.textContent = idle), 1600);
      });
    });
  }
}
