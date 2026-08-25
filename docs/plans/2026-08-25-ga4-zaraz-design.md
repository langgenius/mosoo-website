# GA4 via Cloudflare Zaraz

## Outcome

Collect consented page-view traffic for every public `mosoo.ai` page and, after verification, make the site's GA4 Sessions available to Similarweb. Do not include the authenticated product at `cloud.mosoo.ai`.

## Chosen approach

Use Cloudflare Zaraz rather than adding Google tags to both the website and documentation repositories. Zaraz already sits in front of the proxied domain, can inject Google Analytics 4 across the landing page, blog, and separately deployed documentation, and provides a multilingual consent modal.

Create a dedicated Google Analytics account and property:

- Account: `Mosoo`
- Property: `Mosoo Website`
- Web stream: `mosoo.ai` / `https://mosoo.ai`
- Reporting timezone: `Asia/Shanghai`
- Currency: `USD`
- Advertising signals and user IDs: disabled

Configure the Zaraz GA4 tool to fire only when the hostname is exactly `mosoo.ai` and the visitor grants the `analytics` purpose. Initial page loads and SPA history changes both produce one `page_view`.

## Existing analytics

Cloudflare Web Analytics remains enabled. Remove the blog's bespoke PostHog `page_viewed` script because GA4 replaces that single use case; keeping it would duplicate page counts and bypass the new consent boundary. Product analytics on `cloud.mosoo.ai` remain unchanged.

## Consent behavior

Use Zaraz's built-in consent manager with English, Simplified Chinese, and Japanese copy. Visitors can reject optional analytics or accept it. The preference persists across all paths on `mosoo.ai`.

Before analytics consent, GA4 does not load or send events. Necessary site behavior is unaffected by either choice. Analytics failures must never block navigation or rendering.

## Verification and rollout

1. Preview the Zaraz configuration before publishing.
2. Reject analytics and verify that `/en`, `/blog`, and `/docs` send no GA4 requests.
3. Accept analytics and verify one correctly attributed `page_view` per tested route in GA4 Realtime/DebugView.
4. Verify that `cloud.mosoo.ai` sends no events to this property.
5. Validate the website repository and confirm the removed PostHog call is absent from the production bundle.
6. Observe GA4 for 24–48 hours and compare trends with Cloudflare Web Analytics.
7. Only after the data is credible, request action-time approval and publicly connect GA4 to Similarweb.

## Rollback

Revert the published Zaraz version from Zaraz History to stop GA4 immediately. Revert the website commit to restore the prior blog PostHog page-view event if needed.

## Alternatives rejected

- Direct `gtag.js` integration requires duplicate code and consent handling in two repositories.
- Google Tag Manager adds an unnecessary management layer while GA4 is the only requested Google tag.

## References

- [Cloudflare: Using Google Analytics with Cloudflare](https://developers.cloudflare.com/fundamentals/reference/google-analytics/)
- [Cloudflare Zaraz consent management](https://developers.cloudflare.com/zaraz/consent-management/)
- [Google consent mode](https://developers.google.com/tag-platform/security/guides/consent)
- [Similarweb: Connecting GA4](https://support.similarweb.com/hc/en-us/articles/11550839331613-Connecting-GA4-to-Similarweb)
