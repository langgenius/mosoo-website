// The star count the bars show (apps/landing/src/shared/github-stars.ts), read once per build from the GitHub REST
// API by scripts/build-site.mjs, which hands the same number to the landing build (VITE_GITHUB_STARS: the subpages'
// bar) and to the home's static HTML (scripts/landing-locales.mjs). It never fails the build: no answer within 5 s,
// an error status (a used-up rate limit is 403 or 429), a body without a count, or a count of 0 all give null, and
// the bars show GitHub's mark alone.
//
// Without a token the request shares GitHub's 60 an hour per address (a build makes one, but a CI runner's address
// is shared); a GITHUB_TOKEN in the environment, if there is one, is sent for the higher limit. Nothing here needs
// one, and the deploy workflow passes none, so CI reads the count without one.
//
// VITE_GITHUB_STARS in the environment skips the request and is used as is: a whole number above zero is the count
// (VITE_GITHUB_STARS=1234 npm run build previews "1.2k"), anything else (empty, 0, off) is no count (an offline build).

import { GITHUB_REPO_API, starCount } from "../apps/landing/src/shared/github-stars.ts";

const TIMEOUT_MS = 5000;

export async function fetchGithubStars({
  env = process.env,
  fetch = globalThis.fetch,
  timeoutMs = TIMEOUT_MS,
  log = console,
} = {}) {
  if (env.VITE_GITHUB_STARS !== undefined) {
    const stars = starCount(Number(env.VITE_GITHUB_STARS));
    log.log(`GitHub stars: ${stars ?? "none"} (from VITE_GITHUB_STARS, no request)`);
    return stars;
  }
  const headers = { accept: "application/vnd.github+json", "user-agent": "mosoo-website-build" };
  if (env.GITHUB_TOKEN) {
    headers.authorization = `Bearer ${env.GITHUB_TOKEN}`;
  }
  try {
    const response = await fetch(GITHUB_REPO_API, { headers, signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) {
      const limited = response.headers.get("x-ratelimit-remaining") === "0" ? ", rate limit used up" : "";
      throw new Error(`HTTP ${response.status}${limited}`);
    }
    const stars = starCount((await response.json())?.stargazers_count);
    if (stars === null) {
      throw new Error("no stargazers_count above 0 in the answer");
    }
    log.log(`GitHub stars: ${stars} (${GITHUB_REPO_API})`);
    return stars;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    log.warn(`GitHub stars: none (${GITHUB_REPO_API}: ${reason}); the bars show GitHub's mark without a count.`);
    return null;
  }
}
