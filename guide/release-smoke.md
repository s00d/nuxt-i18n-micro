---
url: 'https://s00d.github.io/nuxt-i18n-micro/guide/release-smoke.md'
description: >-
  Build a real app against the module — from this repo or from npm — and verify
  it works, optionally on Cloudflare Pages and Vercel.
---

# Release Smoke Checks

The unit, integration and e2e suites all run against the module's source. None of them
answer the question that actually matters after a release: **does the published package
install into a fresh app and work?**

That is what this workflow does. It builds a small real Nuxt app
([`test/deploy-smoke`](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/deploy-smoke))
against the module and asserts on the running result.

## Two sources, two different failures

| Source | What it installs | What it catches |
| --- | --- | --- |
| `git` | tarballs packed from the current checkout | packaging problems **before** you publish: missing files, unresolved `workspace:`/`catalog:` protocols, dependencies that were used but never declared |
| `npm` | `nuxt-i18n-micro@latest` (or a version you name) | what users actually get: a bad publish, a package that never reached the registry, a version mismatch between the module and `@i18n-micro/*` |

Both run by default. They fail for different reasons, so neither replaces the other.

::: tip Why `git` needs more than one tarball
`pnpm pack` rewrites `workspace:*` to the local version numbers — which are exactly the
ones not on npm yet. So [`scripts/src/commands/smoke-pack.ts`](https://github.com/s00d/nuxt-i18n-micro/blob/main/scripts/src/commands/smoke-pack.ts)
packs every workspace package and rewrites each tarball's `@i18n-micro/*` dependencies
to point at its siblings. Without that the install goes to the registry for a version
that does not exist.

Use `pnpm pack`, never `npm pack`: only pnpm substitutes the `workspace:` and `catalog:`
protocols, and a tarball still containing them cannot be installed at all.
:::

## Running it

**From the GitHub UI**: Actions → *release smoke* → *Run workflow*. Choose the source
(`both`, `git`, `npm`), optionally a specific npm version, and whether to deploy.

**Automatically**: on every published release, plus once a day — npm needs a few minutes
to serve a freshly published version, and the daily run catches a release that was not
yet queryable when the publish job finished.

**Locally**, against the current checkout:

```bash
# pack this checkout and point the app at it
pnpm run prepack
pnpm -C scripts cli smoke-pack --app test/deploy-smoke --out /tmp/tarballs

cd test/deploy-smoke
printf 'packages:\n  - .\n' > pnpm-workspace.yaml
pnpm install --no-frozen-lockfile
pnpm exec nuxt build
PORT=3000 node .output/server/index.mjs &

# back in the repo root
pnpm -C scripts cli smoke-verify --url http://127.0.0.1:3000
pnpm -C scripts cli smoke-browser --url http://127.0.0.1:3000
```

To check a published version instead, skip the packing and set the dependency to
`nuxt-i18n-micro@3.21.4` (or `latest`) before installing.

## What is asserted

[`scripts/src/commands/smoke-verify.ts`](https://github.com/s00d/nuxt-i18n-micro/blob/main/scripts/src/commands/smoke-verify.ts)
takes a base URL, so the same checks run against a local server, a Cloudflare Pages
deployment or a Vercel one:

* **SSR and localized routes** — `/`, `/de`, `/fr` and `/de/about` each render their own
  translations, interpolation and plurals resolve, and no page contains a raw
  translation key
* **Payload route** — `/_locales/index/de/data.json` returns the right chunk and is not
  served `no-store`
* **SEO** — `hreflang` for every locale plus `x-default`, a `canonical` link, `og:locale`,
  and `<html lang>` matching the locale

[`scripts/src/commands/smoke-browser.ts`](https://github.com/s00d/nuxt-i18n-micro/blob/main/scripts/src/commands/smoke-browser.ts)
adds what only a browser can see: hydration, client-side navigation between pages and
locales, that no raw key is ever visible mid-transition, and that nothing threw.

## Deploying from CI

Deployment is off unless you tick *deploy* on a manual run. It always uses the
**published** package — the point is to verify what a user would get, and a local
tarball would not survive the platform's own install step.

Create dedicated projects for this. Do not point it at a project you deploy by hand:
every run overwrites the deployment.

### Cloudflare Pages

**1. Create the project.** Open <https://dash.cloudflare.com>, pick your account, then
*Compute (Workers & Pages)* → **Create** → the **Pages** tab → **Upload assets**. Give it
a name — `nuxt-i18n-micro-smoke` — and drop in any file as a placeholder; CI replaces the
whole thing on its first run. A direct-upload project needs no Git connection, which is
what you want here: the deploys come from this workflow, not from a branch.

The name you typed is the value for `CLOUDFLARE_PROJECT_NAME`.

**2. Account ID.** Look at the dashboard URL while inside the account:

```
https://dash.cloudflare.com/8f1a2b3c4d5e6f7890abcdef12345678/workers-and-pages
                            └──────────── this is the account ID ────────────┘
```

It is also printed in the right-hand sidebar of the Workers & Pages overview, under
*Account details*. That value is `CLOUDFLARE_ACCOUNT_ID`.

**3. API token.** Go to <https://dash.cloudflare.com/profile/api-tokens> → **Create
Token** → scroll past the templates to **Custom token** → **Get started**.

Fill it in like this:

| Field | What to put |
| --- | --- |
| Token name | `nuxt-i18n-micro smoke deploy` — free text, only for you |
| Permissions | one row: **Account** · **Cloudflare Pages** · **Edit** |
| Account Resources | **Include** · the account you used in step 1 |
| Client IP Address Filtering | leave empty — GitHub runners have no fixed IP |
| TTL | leave empty, or set an expiry date if you rotate tokens |

**Edit** rather than **Read** because the token has to create deployments, not just list
them. One permission row is enough — nothing here touches DNS or zones.

Then **Continue to summary** → **Create Token**. The token appears **once**, on that
screen only. Copy it now; if you lose it, delete the token and make a new one. That value
is `CLOUDFLARE_API_TOKEN`.

### Vercel

**1. Create and link the project.** In `test/deploy-smoke`, run:

```bash
pnpm dlx vercel link
```

It asks four things: which scope (your personal account, or a team if you have one),
whether to link to an existing project (answer **no**), the project name
(`nuxt-i18n-micro-smoke`), and the directory (press enter for `./`). This creates the
project on Vercel and writes `test/deploy-smoke/.vercel/project.json`:

```json
{ "orgId": "team_xxxxxxxxxxxxxxxxxxxx", "projectId": "prj_xxxxxxxxxxxxxxxxxxxx" }
```

Newer CLI versions also write a `projectName`; ignore it, nothing reads it. Only `orgId`
and `projectId` matter — they become `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`. `orgId`
starts with `team_` for a team and is a plain user id for a personal account; copy either
verbatim. The same pair is in the dashboard under *Project Settings → General*.

**Do not commit `.vercel/`.** It is in `.gitignore` already. CI never reads the file: with
`VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` in the environment, `vercel pull` recreates it on
the runner. Locally the directory is only there to keep your own CLI linked — deleting it
unlinks the directory and nothing else.

**2. Token.** Open <https://vercel.com/account/tokens> → **Create Token**.

| Field | What to put |
| --- | --- |
| Token Name | `nuxt-i18n-micro smoke deploy` |
| Scope | the account or team that owns the project — this is where the ambiguity is: a personal token cannot deploy a team project, and vice versa. Pick the one whose name matches the scope you chose during `vercel link` |
| Expiration | your call; the workflow keeps working until it expires, then fails with a 403 |

Click **Create**. The value is shown **once** — that is `VERCEL_TOKEN`.

Prefer the CLI? `pnpm dlx vercel tokens add "nuxt-i18n-micro smoke deploy"` prints the
token to stdout. Add `--project prj_xxxxxxxxxxxxxxxxxxxx` to restrict it to this one
project, so a leak cannot touch anything else. Note that minting a token this way needs
an existing account-scoped token — a fresh `vercel login` session cannot do it, so the
first token has to come from the dashboard.

### After deploying

CI waits for the new deployment to answer, then runs the same HTTP and browser checks
against the live URL. A green deploy job means the published package works on that
platform's runtime — not just in a local Node server.
