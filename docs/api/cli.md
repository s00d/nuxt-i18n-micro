---
title: CLI commands
description: Every command and flag of the i18n-micro CLI, generated from its command table.
outline: [2, 3]
---

# CLI commands

The [CLI guide](/guide/cli) shows the common workflows. This page lists everything, and is generated from the same table that drives `--help`.

<!-- generated:cli-commands — do not edit; run `pnpm run docs:generate` -->

## Common flags

| Flag | Default | Description |
| --- | --- | --- |
| `--cwd` | current directory | Project directory |
| `--logLevel` | `info` | Output level: silent, info |
| `--debug` | `false` | Print a stack trace when a command fails |

## Inspect

### `info`

Print the resolved i18n configuration of the project

| Flag | Default | Description |
| --- | --- | --- |
| `--json` | `false` | Print JSON instead of text |

### `check`

The CI gate: fail on missing, empty, extra, undefined or unused keys and broken placeholders

| Flag | Default | Description |
| --- | --- | --- |
| `--translationDir` | `i18n.translationDir` of nuxt.config | Translation directory, relative to the project |
| `--only` | all but duplicates | Comma-separated checks to run: missing, empty, extra, placeholders, undefined, unused, duplicates. `unused` named here fails when it cannot run |
| `--duplicates` | `false` | Also report the same text under different keys |
| `--ignore` | — | Comma-separated globs of source files to skip, relative to the project |
| `--json` | `false` | Print JSON instead of text |

```bash
i18n-micro check
i18n-micro check --only missing,placeholders --json
```

### `stats`

Show translation completion per locale

| Flag | Default | Description |
| --- | --- | --- |
| `--translationDir` | `i18n.translationDir` of nuxt.config | Translation directory, relative to the project |
| `--html` | — | Also write an HTML report to this file |
| `--json` | `false` | Print JSON instead of text |
| `--baseRef` | — | Git ref to compare completion with, e.g. HEAD~1 or main |

```bash
i18n-micro stats --baseRef main
i18n-micro stats --html reports/i18n.html
```

### `lint`

Check the text of translations; fails when issues remain

| Flag | Default | Description |
| --- | --- | --- |
| `--translationDir` | `i18n.translationDir` of nuxt.config | Translation directory, relative to the project |
| `--rules` | all, or `enabledRules` of .i18n-lintrc.json | Comma-separated rules to run: no-trailing-spaces, no-multiple-spaces, no-empty-translation, or a custom one |
| `--fix` | `false` | Fix what can be fixed: spaces, and custom rules with a replacement |
| `--json` | `false` | Print JSON instead of text |

```bash
i18n-micro lint --rules no-trailing-spaces --fix
```

### `search`

Search keys and values, and show where each key is used

| Flag | Default | Description |
| --- | --- | --- |
| `--translationDir` | `i18n.translationDir` of nuxt.config | Translation directory, relative to the project |
| `<query>` | — | Text or key to search for |
| `--caseSensitive` | `false` | Match case |
| `--onlyUnused` | `false` | Only keys `clean` would remove; the query becomes optional |
| `--scope` | `all` | Where to search: global, pages, all |
| `--limit` | — | Return at most this many keys |
| `--ignore` | — | Comma-separated globs of source files to skip, relative to the project |
| `--json` | `false` | Print JSON instead of text |

```bash
i18n-micro search "Welcome"
i18n-micro search --onlyUnused
```

## Translation workflow

### `extract`

List the keys source files use that have no text yet, and add those with a default text to the default locale

| Flag | Default | Description |
| --- | --- | --- |
| `--translationDir` | `i18n.translationDir` of nuxt.config | Translation directory, relative to the project |
| `--ignore` | — | Comma-separated globs of source files to skip, relative to the project |

```bash
i18n-micro extract
```

### `translate`

Fill missing translations from the default locale through a translation service

| Flag | Default | Description |
| --- | --- | --- |
| `--translationDir` | `i18n.translationDir` of nuxt.config | Translation directory, relative to the project |
| `--service` | — | Translation service: ai, azure, deepl, google, libretranslate, yandexcloud |
| `--token` | — | API key. Prefer the I18N_TRANSLATE_TOKEN environment variable: flags end up in shell history |
| `--options` | — | Service options as key:value pairs, separated by commas |
| `--locale` | every locale but the default one | Comma-separated locales to fill |
| `--replace` | `false` | Translate every key again, replacing existing values |
| `--dryRun` | `false` | Count keys and characters per locale; send nothing |
| `--chunkSize` | — | Strings per request; capped at what the service accepts |
| `--pluralSeparator` | `\|` | Separator of plural forms in messages |
| `--glossaryFile` | `.i18n-glossary.json` when it exists | Glossary file, used by the `ai` service |

```bash
i18n-micro translate --dryRun
I18N_TRANSLATE_TOKEN=... i18n-micro translate --service deepl --locale de,fr
i18n-micro translate --service ai --options provider:openai,model:gpt-4o-mini
i18n-micro translate --service libretranslate --options baseUrl:https://translate.example.com
```

### `sync`

Remove keys the default locale does not have; stops when that cannot be proven safe. Missing keys stay missing

| Flag | Default | Description |
| --- | --- | --- |
| `--translationDir` | `i18n.translationDir` of nuxt.config | Translation directory, relative to the project |
| `--ignore` | — | Comma-separated globs of source files to skip, relative to the project |
| `--dryRun` | `false` | List what would be removed; write nothing |
| `--force` | `false` | Remove keys even though it cannot be proven safe |

```bash
i18n-micro sync --dryRun
```

### `clean`

Remove keys nothing in the project uses; stops when that cannot be proven

| Flag | Default | Description |
| --- | --- | --- |
| `--translationDir` | `i18n.translationDir` of nuxt.config | Translation directory, relative to the project |
| `--include` | — | Regular expression: consider only matching keys for removal |
| `--exclude` | — | Regular expression: never remove matching keys |
| `--ignore` | — | Comma-separated globs of source files to skip, relative to the project |
| `--dryRun` | `false` | List what would be removed; write nothing |
| `--force` | `false` | Remove keys even though usage cannot be proven for all of them |

```bash
i18n-micro clean --dryRun
i18n-micro clean --exclude '^errors\.'
```

## Refactoring

### `text-to-i18n`

Replace hardcoded text in Vue templates with translation calls, and report hardcoded text in code

| Flag | Default | Description |
| --- | --- | --- |
| `--translationFile` | `<translationDir>/<defaultLocale>.json` | File the new keys go to |
| `--path` | the whole project | File or directory to process |
| `--context` | — | Prefix for generated keys |
| `--ignore` | — | Comma-separated globs of source files to skip, relative to the project |
| `--dryRun` | `false` | Show what would change; write nothing |
| `--interactive` | `false` | Confirm or edit every generated key |

```bash
i18n-micro text-to-i18n --dryRun
i18n-micro text-to-i18n --path components --context ui
```

### `rename`

Rename a key or a namespace in every locale and in source files

| Flag | Default | Description |
| --- | --- | --- |
| `--translationDir` | `i18n.translationDir` of nuxt.config | Translation directory, relative to the project |
| `--from` **\*** | — | Current key or namespace |
| `--to` **\*** | — | New key or namespace |
| `--ignore` | — | Comma-separated globs of source files to skip, relative to the project |
| `--dryRun` | `false` | Report the changes; write nothing |

**\*** required.

```bash
i18n-micro rename --from common.save --to actions.save
```

### `pseudo`

Fill a locale with pseudo-translations to find layout and hardcoded-text issues

| Flag | Default | Description |
| --- | --- | --- |
| `--translationDir` | `i18n.translationDir` of nuxt.config | Translation directory, relative to the project |
| `--sourceLocale` | the default locale | Locale to read |
| `--targetLocale` **\*** | — | Locale to fill |
| `--replace` | `false` | Overwrite existing values |

**\*** required.

### `format`

Rewrite locale files with sorted keys and uniform indentation

| Flag | Default | Description |
| --- | --- | --- |
| `--translationDir` | `i18n.translationDir` of nuxt.config | Translation directory, relative to the project |
| `--indent` | `2` | Spaces of indentation |
| `--sortKeys` | `true` | Sort keys; use --no-sortKeys to keep their order |
| `--check` | `false` | Fail if a file would change; write nothing |

```bash
i18n-micro format --check
```

## Exchange

### `export`

Export locale files to PO or CSV, with the default-locale text as the source

| Flag | Default | Description |
| --- | --- | --- |
| `--translationDir` | `i18n.translationDir` of nuxt.config | Translation directory, relative to the project |
| `--format` | `po` | File format: po, csv |
| `--dir` | `pots` for po, `csv_exports` for csv | Output directory, relative to the project |
| `--force` | `false` | Overwrite files changed since the last export and never imported |

```bash
i18n-micro export --format csv
```

### `import`

Merge PO or CSV files into the locale files

| Flag | Default | Description |
| --- | --- | --- |
| `--translationDir` | `i18n.translationDir` of nuxt.config | Translation directory, relative to the project |
| `--format` | `po` | File format: po, csv |
| `--dir` | `pots` for po, `csv_exports` for csv | Input directory, relative to the project |
| `--dryRun` | `false` | Report what would be imported; write nothing |

```bash
i18n-micro import --format csv --dryRun
```

### `sync-remote`

Pull global translations from, or push them to, the HTTP endpoint in .i18n-remote.json

| Flag | Default | Description |
| --- | --- | --- |
| `--translationDir` | `i18n.translationDir` of nuxt.config | Translation directory, relative to the project |
| `--pull` | `true` | Pull from the remote |
| `--push` | `false` | Push to the remote |
| `--force` | `false` | On a pull, take the remote value; on a push, overwrite text only the remote holds |
| `--dryRun` | `false` | Report what a pull would change; write and push nothing |

```bash
i18n-micro sync-remote --dryRun
i18n-micro sync-remote --no-pull --push
```

## Lint rules

| Rule | Finds | Fixed by `--fix` |
| --- | --- | --- |
| `no-trailing-spaces` | Spaces at the end of a value or a line | yes |
| `no-multiple-spaces` | Two or more spaces in a row | yes |
| `no-empty-translation` | An empty or blank value | no |

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Done, nothing to report |
| `1` | Findings: `check`, `lint` or `format --check` found something, `clean` or `sync` could not prove a removal safe, `export` would overwrite unimported work, `translate` left keys out, `import` or `sync-remote` met a conflict. A `--dryRun` of `clean`, `sync` or a `sync-remote` pull reports these and exits `0` |
| `2` | Failure: bad usage, unreadable project, network or file error |

## Configuration files

| File | Used by |
| --- | --- |
| `.i18n-lintrc.json` | `lint`: `enabledRules`, `disabledRules`, `customRegexRules` (`name`, `pattern`, `flags`, `description`, `replacement`) |
| `.i18n-remote.json` | `sync-remote`: `url`, `path`, `token`, `auth` (`username`, `password`). `type` may be left out; only `custom` exists |
| `.i18n-glossary.json` | `translate --service ai`: `entries` of `source`, `target`, and optional `from`, `to` |

## Environment variables

| Name | Used for |
| --- | --- |
| `I18N_TRANSLATE_TOKEN` | API key of `translate`. Read from `.env` too |
| `I18N_REMOTE_TOKEN` | Bearer token of `sync-remote`. Read from `.env` too |
| `AI_GATEWAY_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY` | Key of the `ai` service, when `I18N_TRANSLATE_TOKEN` is not set |
| `DEFAULT_LOCALE` | Overrides `defaultLocale`, as in the module |

## Removed commands

| Command | Instead |
| --- | --- |
| `validate` | check |
| `diff` | check --only missing |
| `check-duplicates` | check --only duplicates |
| `export-csv` | export --format csv |
| `import-csv` | import --format csv |
| `estimate` | translate --dryRun |
| `optimize` | check --only duplicates |
| `backup` | git, which already keeps your locale files |
| `restore` | git, which already keeps your locale files |
| `init` | nuxi init, then add nuxt-i18n-micro to modules |
| `split` | nothing: the module does not read split files |
| `replace-values` | your editor or sed |
| `glossary` | editing .i18n-glossary.json by hand |

<!-- /generated:cli-commands -->
