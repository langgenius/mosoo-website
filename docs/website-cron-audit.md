# Website invocation and Cron audit (2026-09-10)

The website serves HTTP and consumes `mosoo-api-prod` Tail events. It has no
`scheduled` handler. Keep `/health`, its translations, `/status.json`, the
`StatusStore` binding/history, and the API's Tail consumer configuration.
The API's own one-minute maintenance Cron is a legitimate health signal.

## Deployment contract

Both default and production Wrangler environments explicitly set `crons = []`.
[Cloudflare documents](https://developers.cloudflare.com/workers/configuration/cron-triggers/#remove-a-cron-trigger)
that omitted triggers preserve remote schedules; an empty array removes them.
The historical website `*/5 * * * *` schedule was already removed on September 10
before this change. This change prevents future deployments retaining that drift.
Do not add a no-op scheduled handler or restore the obsolete schedule.

## Error classification

Classify live Tail output by event shape before interpreting counts:

| Event | Identification | Meaning |
| --- | --- | --- |
| Public HTTP | `event.request`, stateless execution | Check response status separately from Worker outcome. A 404 is not a thrown exception. |
| Tail consumer | `event.consumedEvents` | Website processing producer logs; not a visitor request. A rejection persisting observations is a website Tail failure. |
| Scheduled | `event.cron` / `scheduledTime` | Website Cron is obsolete; producer API Cron remains legitimate. |
| Durable Object | `executionModel=durableObject`, `entrypoint=StatusStore` | Internal health history reads/writes; not public page traffic. |
| Business Run | Structured `session.run.terminal` log | Separate Run completion/failure signal; a failed Run can coexist with an `ok` invocation. |

`/status.json` reports observed **API** invocation health, not website HTTP uptime.
The existing classifier counts severe Worker outcomes and HTTP 5xx as failures;
HTTP 4xx alone does not degrade platform health. Regression tests cover these
boundaries and `tail()` persistence/rejection without generating model traffic.

## August evidence and limits

Cloudflare GraphQL `workersInvocationsAdaptive`, UTC `[2026-08-01, 2026-09-01)`,
filtered to `mosoo-website-prod`, returned:

| Outcome | Requests | Errors | Average sample interval |
| --- | ---: | ---: | ---: |
| success | 637,720 | 0 | 16.3292 |
| scriptThrewException | 5,380 | 5,380 | 11.1157 |
| clientDisconnected | 20 | 0 | 10 |

Total 643,120 is sampled Worker invocation volume, not visitor count.
This dataset does not expose HTTP/tail/cron event-type dimensions.
Separate `workersInvocationsScheduled` queries, in disjoint windows of at most
seven days with limit 10,000, returned 8,930 August records: 5,340 exceptions and
3,590 successes, all for `*/5 * * * *`. Each window returned fewer than the limit.
This directly establishes historical Cron failures. It does not justify
subtracting 5,340 from sampled 5,380 to claim exactly 40 HTTP/Tail errors, nor
claiming every August exception came from Cron. Do not infer attacks from volume.

## Verify and roll back

Run `npm run validate` and Wrangler 4.115.0 `deploy --env prod --dry-run`.
Merge to main to use the existing deployment workflow. After deployment, read
`GET /accounts/{account}/workers/scripts/mosoo-website-prod/schedules` and require
`result.schedules=[]`; verify `/en`, `/health`, `/zh/health`, `/ja/health`,
`/status.json` and legacy status redirects. Observe real Tail consumption,
StatusStore writes, and advancing platform observations in the status feed.

Before release, record the active Worker version. For this release it was
`45309c48-dcc2-448c-9cc5-9446a6f1ba66` (main `914dcfc`). If needed, roll back
the Worker version using Wrangler and read back schedules and bindings again.
Keep schedules empty even after rollback. No storage migration, data deletion,
producer configuration changes, or traffic blocking is part of this change.
