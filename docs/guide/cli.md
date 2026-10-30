---
title: CLI
description: Check translations in CI, find unused keys, fill gaps through a translation service and exchange files with translators from the command line.
outline: [2, 3]
---

# CLI

`@i18n-micro/cli` manages the locale files of a Nuxt project: `check` fails a build on anything wrong with them, `translate` fills gaps through a service, `clean` removes keys nothing uses, and `rename` moves a key everywhere at once. It reads `locales`, `defaultLocale`, `translationDir` and your layers from `nuxt.config`, so it needs no configuration of its own.

```bash
npm install -D @i18n-micro/cli
npx i18n-micro --help
```

Run it from the app root, or point at it with `--cwd`. Every flag of every command is on the [command reference](/api/cli).

::: tip Moving from nuxt-i18n-micro-cli
`@i18n-micro/cli` replaces `nuxt-i18n-micro-cli`. The bins, `i18n-micro` and `i18n-micro-cli`, stay. See the [table of old commands](#moving-from-nuxt-i18n-micro-cli).
:::

## Use it in CI

```bash
i18n-micro check
```

`check` is the gate. It reports:

| Check | Means |
| --- | --- |
| `missing` | A key of the default locale is absent from a locale |
| `empty` | A value is `''`. The app shows a blank, not the fallback |
| `extra` | A locale has a key the default locale does not |
| `placeholders` | `{name}` was lost or added, or a plural lost its forms |
| `undefined` | The code uses a key the default locale does not have |
| `unused` | Nothing in the project uses a key |
| `duplicates` | The same text under different keys. Off by default: pass `--duplicates` |

`--only missing,placeholders` picks some, `--json` gives a report for tooling, and `--ignore` skips source files. While keys are computed at runtime `unused` is skipped, and the report says why.

Every command exits `0` when there is nothing to report, `1` on findings, and `2` when it could not run: a usage error, a broken file, a failed request. A pipeline can tell a problem with your translations from a problem with the tool.

```bash
i18n-micro format --check      # fails if a file is not formatted
i18n-micro lint                # stray spaces, empty values, your own regex rules
i18n-micro stats --baseRef main
```

## Keep locales in step

| Command | What it does |
| --- | --- |
| `extract` | Lists the keys the code uses that have no text yet. A default text, as in `$t('key', {}, 'Welcome')`, goes to the default locale. |
| `sync` | Removes keys the default locale does not have. Try `--dryRun` first. |
| `clean` | Removes keys nothing uses. Try `--dryRun` first. |
| `search` | Finds keys and values, and shows where each key is used. |
| `stats` | Completion per locale; `--baseRef main` compares with a git ref. |

`extract` and `sync` never write `''` for a key without a translation. The key stays absent, so `fallbackLocale` applies at runtime, and `check` reports it. An empty string would be a defined value: it would show a blank.

All of them read the whole project, not a fixed list of folders: templates and scripts through a parser, `.html` and Pug as text, every layer, and folders outside the root that an alias or `components` points at. `node_modules`, build output and the locale files are skipped; add your own with `--ignore 'legacy/**,*.stories.ts'`. A file under `tests/` counts as usage, but `extract` and `check` do not treat its keys as ones the app needs.

They understand `$t`, `$ts`, `$tc`, `$has`, `$_t(route)`, `t()` from `useI18n()`, `<i18n-t keypath>`, `<i18n-group prefix>`, and aliases such as `const { t: tr } = useI18n()`.

### How `clean` decides

`clean` would rather leave a dead key than remove a live one. A key stays when any of this is true:

- a call uses it, or a key below or above it;
- a string in the code equals it: `const key = 'menu.home'`, `<Item label="menu.home" />`;
- a JSON, YAML or Markdown file in the project contains it;
- a computed key has a static start that covers it: `` $t(`status.${state}`) `` keeps everything under `status.`;
- a layer defines it.

`clean` stops without changing anything when it cannot know, and lists why:

- a key is fully computed, as in `$t(name)`, or `$t` is passed around as a value, as in `items.map($t)`;
- a source file does not parse;
- no file uses any key at all, which usually means it is looking in the wrong place;
- a locale file is a symlink out of the project, so another app may read it.

Review what `--dryRun` lists, protect keys with `--exclude '^errors\.'`, then pass `--force`.

## Translate missing keys

```bash
i18n-micro translate --dryRun                     # keys and characters per locale, nothing sent
export I18N_TRANSLATE_TOKEN=...                   # or put it in .env
i18n-micro translate --service deepl --locale de,fr
```

`translate` fills keys that are missing or empty; `--replace` translates everything again. Placeholders and plural forms are protected, and a translation that lost a placeholder is not written: the key is listed and the command exits `1`. Every batch is saved before the next request goes out, so a failure costs only the request that failed.

| `--service` | Service | `--token` | Useful `--options` |
| --- | --- | --- | --- |
| `ai` | Vercel AI Gateway, OpenAI, Anthropic or any OpenAI-compatible server | API key, or `AI_GATEWAY_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` | `provider`, `model`, `baseUrl`, `maxTokens` |
| `azure` | Azure Translator | Subscription key | `region` |
| `deepl` | DeepL, Free keys included | Auth key | `formality`, `glossaryId`, `context` |
| `google` | Google Cloud Translation v2 | API key | `model` |
| `libretranslate` | LibreTranslate | Optional | `baseUrl` |
| `yandexcloud` | Yandex Cloud Translate | API key, or IAM token with `authScheme:Bearer` | `folderId`, `model` |

Options are `key:value` pairs: `--options provider:openai,model:gpt-4o-mini`. All services also take `baseUrl`, `retries`, `retryDelayMs` and `timeoutMs`.

Flags are visible in shell history and process lists, so prefer the environment variable for the token. Tokens are masked in everything the CLI prints.

The `ai` service follows a glossary. When `.i18n-glossary.json` exists it is used without a flag; `--glossaryFile` picks another file.

```json
{ "entries": [{ "source": "Cart", "target": "Warenkorb", "to": "de" }] }
```

## Turn hardcoded text into keys

```bash
i18n-micro text-to-i18n --dryRun   # list what would change
i18n-micro text-to-i18n            # rewrite the templates
```

```vue
<!-- before -->
<h1>Welcome to our site</h1>
<!-- after -->
<h1>{{ $t('pages.index.welcome-to-our') }}</h1>
```

Only `.vue` templates are rewritten. Text in `.ts` files and scripts is listed, because `$t` is not in scope everywhere. So is text next to markup or an interpolation, such as `<p>Hello <b>world</b> today</p>`: half a sentence cannot be translated on its own. Commit first, and review the diff.

## Rename a key

```bash
i18n-micro rename --from common.save --to actions.save
i18n-micro rename --from settings --to account.settings   # a whole namespace
```

`rename` edits the syntax tree, so comments and unrelated strings stay as they are, and aliases and `:keypath` are followed. It warns about what it cannot rewrite: a computed key under the old name, a plain string equal to it, or a Pug template. A layer's own file is never changed.

## Exchange files with translators

```bash
i18n-micro export --format csv
i18n-micro import --format csv --dryRun
```

`export` writes every key of every locale, including untranslated ones, with the default-locale text as the source: a `Source` column in CSV, a `#.` comment in PO. Without `--dir`, PO goes to `pots` and CSV to `csv_exports`. `import` merges, skips empty cells, and skips PO entries marked `fuzzy`. A key that would overwrite a value, or a value over a whole group of keys, is listed and left out, and the command exits `1`.

For a translation platform, use its own CLI: the [Crowdin](/guide/crowdin) setup syncs the JSON files, page files included.

## Sync with your own endpoint

`sync-remote` exchanges the global locale files with an HTTP endpoint you run. Page files stay local, and the command says so. Describe it in `.i18n-remote.json`:

```json
{ "url": "https://translations.example.com", "path": "translations" }
```

The endpoint answers `GET` and `PUT` with a `{ locale: messages }` object. Authenticate with `auth: { username, password }`, or put a bearer token in `I18N_REMOTE_TOKEN`.

A pull fills what you do not have and keeps keys only you have. If a key differs on both sides, nothing is written and the command exits `1`; `--force` takes the remote value. A locale you have not configured is skipped, a blank remote value clears nothing, and a push leaves your blanks out. `--dryRun` lists the changes and neither writes nor sends anything.

## Moving from nuxt-i18n-micro-cli

| Old command | Now |
| --- | --- |
| `validate` | `check` |
| `diff` | `check --only missing` |
| `check-duplicates` | `check --only duplicates` |
| `export-csv`, `import-csv` | `export --format csv`, `import --format csv` |
| `--potsDir`, `--csvDir` | `--dir` |
| `estimate` | `translate --dryRun` |
| `glossary` | Edit `.i18n-glossary.json`; `translate` reads it by itself |
| `backup`, `restore` | Git, which already keeps your locale files |
| `init` | `nuxi init`, then add `nuxt-i18n-micro` to `modules` |
| `split` | Removed: the module does not read split files |
| `optimize` | `check --only duplicates` |
| `replace-values` | Your editor or `sed` |
| `stats --full` | `stats`; [DevTools](/guide/devtools) has the details |
| `search --hardcodedOnly` | `text-to-i18n --dryRun` |
| `search --preferUnused`, `--onlyVue` | Removed |
| `lint` rules `no-html-tags`, `no-special-chars`, `no-mixed-case`, `no-missing-punctuation`, `no-inconsistent-pluralization` | Removed: they flagged normal text. Write a `customRegexRules` entry if you need one |
| `text-to-i18n --extractOnlyDirs`, `--extractOnlyPatterns`, `--verbose` | Removed: code is never rewritten |
| `--logLevel verbose` | Removed: it did nothing |

Removed services: `googlefree`, `yandex` (use `yandexcloud`), `ibm`, `lingvatranslate`, `modernmt`, `lilt`, `unbabel`, `reverso`, `baidu`, `papago`, `tencent`, `systran`, `mymemory`.

Removed `sync-remote` types: `github`, `gitlab`, `crowdin`, `lokalise`, `tolgee`, `weblate`. Use the platform's own CLI, or `custom`, which needs no `type` any more.

Changed behaviour:

- `extract` and `sync` no longer write `''`. Keys stay absent, and `check` reports them. `extract` writes a key only when the code gives its text.
- `extract` writes page keys to `locales/pages/<route name>/`, where the module reads them, and scans `app/` on Nuxt 4. Move anything from directories such as `pages/_about` and `pages/blog_`, and delete a stray `locales/pages/<locale>.json`.
- `translationDir` from `nuxt.config` is respected; before, every command silently used `locales`.
- Without `defaultLocale`, the default is `en`, as in the module, and `DEFAULT_LOCALE` is honoured. It used to be the first locale.
- `check` and `sync` use the default locale as the reference and check page files. `"a.b"` and `a: { b }` count as one key.
- `clean` keeps a key used anywhere, in any scope, and stops when usage cannot be proven. `--include` and `--exclude` choose what may be removed.
- Exit codes are `0`, `1` and `2`; failures used to be `1`, and `diff` and `check-duplicates` always `0`.
- `lint --fix` no longer leaves `.bak` files.
- A save keeps a file's indentation, final newline and symlink, and leaves files it did not change alone.
- A mistyped or removed flag is now an error, not silently ignored.
- Paths such as `--dir` are relative to the project, not to the shell.
- `ai` no longer loads `@ai-sdk/*` packages: use `provider` `gateway`, `openai` or `anthropic`, or `baseUrl` for an OpenAI-compatible server.

## Related

- [CLI commands](/api/cli)
- [Translation files](/guide/translations)
- [Crowdin](/guide/crowdin)
- [DevTools](/guide/devtools)
