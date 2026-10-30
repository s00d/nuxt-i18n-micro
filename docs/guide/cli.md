---
title: CLI
description: Extract keys, keep locales in sync, translate through a service and exchange files with translators from the command line.
outline: [2, 3]
---

# CLI

`@i18n-micro/cli` manages the locale files of a Nuxt project: it finds the keys your code uses, keeps every locale in step with the default one, fills gaps through a translation service, and moves files to and from translation platforms. It reads `locales`, `defaultLocale`, `translationDir` and your layers from `nuxt.config`, so it needs no configuration of its own.

```bash
npm install -D @i18n-micro/cli
npx i18n-micro --help
```

Run it from the app root, or point at it with `--cwd`. Every flag of every command is on the [command reference](/api/cli).

::: tip Moving from nuxt-i18n-micro-cli
`@i18n-micro/cli` replaces `nuxt-i18n-micro-cli`. The bins, `i18n-micro` and `i18n-micro-cli`, and the flags stay. See [what changed](#moving-from-nuxt-i18n-micro-cli).
:::

## Turn hardcoded text into keys

```bash
i18n-micro text-to-i18n --dryRun   # list what would change
i18n-micro text-to-i18n            # rewrite the files
```

```vue
<!-- before -->
<h1>Welcome to our site</h1>
<!-- after -->
<h1>{{ $t('pages.index.welcome-to-our') }}</h1>
```

Text next to an interpolation stays as it is: half a sentence cannot be translated on its own. Commit first, and review the diff.

## Keep locales in sync

| Command | What it does |
| --- | --- |
| `extract` | Add the keys your code uses: page keys to `locales/pages/<route name>/`, the rest to the global files. |
| `sync` | Give every locale the keys of the default locale, removing extra ones. |
| `validate` | Fail on missing or extra keys. Fits a CI step. |
| `clean` | Remove keys no source file uses. Try `--dryRun` first. |
| `stats` | Completion per locale; `--baseRef main` compares with a git ref. |

`extract` and `clean` read templates and scripts with a parser, and understand `$t`, `$ts`, `$tc`, `$has`, `t()` from `useI18n()` and `<i18n-t keypath>`. A key built at runtime cannot be found this way. `$t(\`status.${state}\`)` protects everything under `status.` from `clean`; `$t(name)` is reported as a warning, so review what `clean --dryRun` lists.

Keys a layer provides are read, never copied into the app's files.

## Translate missing keys

```bash
export I18N_TRANSLATE_TOKEN=...
i18n-micro translate --service deepl
```

`translate` fills keys that are missing or empty; `--replace` translates everything again. Placeholders and plural forms are protected, and a translation that lost a placeholder is not written. Each finished locale is saved as whole files, so a failed run keeps the work it paid for and never leaves a broken file. Run `estimate` first to see the size of the job.

| `--service` | Service | `--token` | Useful `--options` |
| --- | --- | --- | --- |
| `ai` | Vercel AI Gateway, OpenAI, Anthropic or any OpenAI-compatible server | API key, or `AI_GATEWAY_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` | `provider`, `model`, `baseUrl`, `maxTokens` |
| `azure` | Azure Translator | Subscription key | `region` |
| `baidu` | Baidu Translate | Secret key | `appId` |
| `deepl` | DeepL, Free keys included | Auth key | `formality`, `glossaryId`, `context` |
| `google` | Google Cloud Translation v2 | API key | `model` |
| `libretranslate` | LibreTranslate | Optional | `baseUrl` |
| `mymemory` | MyMemory, free tier | Optional | `email` |
| `papago` | Papago on NAVER Cloud | Client secret | `clientId` |
| `systran` | SYSTRAN Translate | API key | |
| `tencent` | Tencent Machine Translation | Secret key | `secretId`, `region` |
| `yandexcloud` | Yandex Cloud Translate | API key, or IAM token with `authScheme:Bearer` | `folderId`, `model` |

Options are `key:value` pairs: `--options provider:openai,model:gpt-4o-mini`. All services also take `baseUrl`, `retries`, `retryDelayMs` and `timeoutMs`.

Flags are visible in shell history and process lists, so prefer the environment variable for the token. The `ai` service follows a glossary:

```bash
i18n-micro glossary --action add --source Cart --target Warenkorb --to de
i18n-micro translate --service ai --glossaryFile .i18n-glossary.json
```

## Sync with a translation platform

`sync-remote` exchanges the global locale files, not page files, with a remote described in `.i18n-remote.json`:

```json
{ "type": "lokalise", "projectId": "123.abc" }
```

Put the token in `I18N_REMOTE_TOKEN` rather than in the file.

| `type` | Required fields | Notes |
| --- | --- | --- |
| `github`, `gitlab` | `url` | One `<locale>.json` per language under `path` (default `translations`) on `branch` (default `main`). |
| `lokalise` | `projectId` | |
| `crowdin` | `projectId` | Uses the project's first JSON file, or `fileId`. |
| `tolgee` | `projectId` | `url` for a self-hosted server. |
| `weblate` | `url`, `projectId`, `component` | The component has to use a JSON format. |
| `custom` | `url` | `GET` and `PUT` a `{ locale: messages }` object at `path`, with `auth` or `token`. |

`languageMapping` renames locales for the remote: `{ "de": "de-DE" }`. `apiUrl` overrides the API root.

A pull merges into your files and keeps keys only you have. If a key differs on both sides the command stops; `--force` takes the remote value. `--dryRun` reports the differences and neither writes nor sends anything.

## Exchange files with translators

| Command | Format |
| --- | --- |
| `export` / `import` | Gettext PO files in `--potsDir`. |
| `export-csv` / `import-csv` | One CSV per locale in `--csvDir`: file, key, translation. |

Imports merge into the existing files. For a Crowdin project, the [Crowdin](/guide/crowdin) setup syncs the JSON files with Crowdin's own CLI.

## Moving from nuxt-i18n-micro-cli

Removed services, because the vendor closed them or they no longer work: `googlefree`, `yandex` (use `yandexcloud`), `ibm`, `lingvatranslate`, `modernmt`, `lilt`, `unbabel`, `reverso`.

Changed behaviour:

- `extract` writes page keys to `locales/pages/<route name>/`, where the module reads them, and scans `app/` on Nuxt 4. Move anything from directories such as `pages/_about` and `pages/blog_`, and delete a stray `locales/pages/<locale>.json`.
- `translationDir` from `nuxt.config` is respected; before, every command silently used `locales`.
- `sync` and `validate` use the default locale as the reference, and `validate` checks page files.
- `clean --include` and `--exclude` now choose what may be removed. They used to remove everything else.
- `optimize` only reports: its write mode broke the layout the module reads, so `--updatePaths` is gone.
- Paths such as `--csvDir` are relative to the project, not to the shell.
- `ai` no longer loads `@ai-sdk/*` packages: use `provider` `gateway`, `openai` or `anthropic`, or `baseUrl` for an OpenAI-compatible server.
- Password-protected backups from the old CLI cannot be restored. It could not restore them either.

## Related

- [CLI commands](/api/cli)
- [Translation files](/guide/translations)
- [Crowdin](/guide/crowdin)
- [DevTools](/guide/devtools)
