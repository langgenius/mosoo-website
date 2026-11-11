// mosoo's GitHub star count in the bars (the home's src/home/sections/nav.ts, the subpages' shared/ui/site-nav.tsx),
// as nod.n8n.io shows its own: read once when the site is built (scripts/github-stars.mjs, scripts/build-site.mjs),
// never in the reader's browser. A build that cannot read it ships the bars with GitHub's mark alone, never "0" or
// "NaN". Erasable TypeScript, no imports: Node loads this file as is at build time and in the tests, Vite in the
// browser.

/** The repository the bars link to (copy.ts LINKS.github, config/external-links.ts MOSOO_GITHUB_URL). */
export const GITHUB_REPO = "langgenius/mosoo";

/** The GitHub REST API's repository endpoint, whose stargazers_count is the number shown. */
export const GITHUB_REPO_API = `https://api.github.com/repos/${GITHUB_REPO}`;

/** A count worth showing: a whole number above zero. Anything else (none, 0, NaN, a string) is null: no count. */
export function starCount(value: unknown): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : null;
}

/**
 * The count as the bar shows it: 166, then 1.2k, 12.3k, 123k, 1.2M (GitHub's own short form). Rounded down, so it
 * never shows more stars than there are (1,299 is 1.2k); integer division keeps 8,200 at 8.2k, not 8.1k.
 */
export function formatStars(count: number): string {
  if (count < 1000) {
    return String(count);
  }
  const [size, unit]: [number, string] = count < 1_000_000 ? [1000, "k"] : [1_000_000, "M"];
  const whole = Math.floor(count / size);
  return whole < 100 ? `${Math.floor(count / (size / 10)) / 10}${unit}` : `${whole}${unit}`;
}

/** The link's accessible name: the copy's template with the whole count in place of {count} (1,234). */
export function starsLabel(template: string, count: number): string {
  return template.replace("{count}", count.toLocaleString("en-US"));
}
