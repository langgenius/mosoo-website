const buttons = document.querySelectorAll("[data-category-tabs] [data-category]");
const cards = document.querySelectorAll("[data-card]");

const select = (category) => {
  buttons.forEach((button) => {
    const isActive = button.dataset.category === category;
    button.classList.toggle("border-[color:var(--ink-900)]", isActive);
    button.classList.toggle("bg-[color:var(--ink-900)]", isActive);
    button.classList.toggle("text-white", isActive);
    button.classList.toggle("border-[color:var(--border)]", !isActive);
    button.classList.toggle("bg-[color:var(--surface)]", !isActive);
    button.classList.toggle("text-[color:var(--fg-secondary)]", !isActive);
  });

  cards.forEach((card) => {
    card.style.display =
      category === "All" || card.dataset.category === category ? "" : "none";
  });
};

buttons.forEach((button) => {
  button.addEventListener("click", () => select(button.dataset.category ?? "All"));
});
