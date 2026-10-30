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
| `--logLevel` | `info` | Output level: silent, info, verbose |
| `--translationDir` | `i18n.translationDir` of nuxt.config | Translation directory, relative to the project |

## Setup and diagnostics

### `init`

Create a new Nuxt project wired to nuxt-i18n-micro

| Flag | Default | Description |
| --- | --- | --- |
| `--name` | — | Project directory name; asked for when omitted |

```bash
i18n-micro init --name shop
```

### `info`

Print the CLI version, the resolved project configuration and the environment

| Flag | Default | Description |
| --- | --- | --- |
| `--json` | `false` | Print JSON instead of text |
| `--debug` | `false` | Also print process and OS details |

## Translation workflow

### `extract`

Add the translation keys used in source files to the locale files

```bash
i18n-micro extract
i18n-micro extract && i18n-micro sync
```

### `translate`

Fill missing translations from the default locale through a translation service

| Flag | Default | Description |
| --- | --- | --- |
| `--service` | — | Translation service: ai, azure, baidu, deepl, google, libretranslate, mymemory, papago, systran, tencent, yandexcloud |
| `--token` | — | API key. Prefer the I18N_TRANSLATE_TOKEN environment variable: flags end up in shell history |
| `--options` | — | Service options as key:value pairs, separated by commas |
| `--replace` | `false` | Translate every key again, replacing existing values |
| `--chunkSize` | — | Strings per request; capped at what the service accepts |
| `--pluralSeparator` | `\|` | Separator of plural forms in messages |
| `--glossaryFile` | — | Glossary file, used by the `ai` service |

```bash
I18N_TRANSLATE_TOKEN=... i18n-micro translate --service deepl
i18n-micro translate --service ai --options provider:openai,model:gpt-4o-mini
i18n-micro translate --service libretranslate --options baseUrl:https://translate.example.com
```

### `sync`

Give every locale the key structure of the default locale, removing extra keys

### `sync-remote`

Pull translations from, or push them to, the remote described in .i18n-remote.json

| Flag | Default | Description |
| --- | --- | --- |
| `--pull` | `true` | Pull from the remote |
| `--push` | `false` | Push to the remote |
| `--force` | `false` | On a conflict, take the remote value |
| `--dryRun` | `false` | Report what would change; send and write nothing |

```bash
i18n-micro sync-remote --dryRun
i18n-micro sync-remote --no-pull --push
```

### `validate`

Fail when a locale misses keys of the default locale or has extra ones

### `stats`

Show translation completion per locale

| Flag | Default | Description |
| --- | --- | --- |
| `--full` | `false` | Show detailed statistics |
| `--html` | — | Also write an HTML report to this file |
| `--json` | `false` | Print JSON instead of text |
| `--baseRef` | — | Git ref to compare completion with, e.g. HEAD~1 or main |

```bash
i18n-micro stats --baseRef main
i18n-micro stats --html reports/i18n.html
```

### `lint`

Check translation quality; fails when issues remain

| Flag | Default | Description |
| --- | --- | --- |
| `--rules` | all, or `enabledRules` of .i18n-lintrc.json | Comma-separated rules to run |
| `--fix` | `false` | Fix what can be fixed, keeping a .bak copy of each file |
| `--json` | `false` | Print JSON instead of text |

```bash
i18n-micro lint --rules no-trailing-spaces,no-empty-translation --fix
```

### `clean`

Remove keys no source file uses

| Flag | Default | Description |
| --- | --- | --- |
| `--include` | — | Regular expression: consider only matching keys for removal |
| `--exclude` | — | Regular expression: never remove matching keys |
| `--dryRun` | `false` | List what would be removed; write nothing |
| `--force` | `false` | Remove keys even though some keys are computed at runtime |

```bash
i18n-micro clean --dryRun
i18n-micro clean --exclude '^errors\.'
```

### `search`

Search keys, values, source usages and hardcoded text across all layers

| Flag | Default | Description |
| --- | --- | --- |
| `<query>` | — | Text or key to search for |
| `--caseSensitive` | `false` | Match case |
| `--onlyUnused` | `false` | Only keys without source usages |
| `--preferUnused` | `false` | Rank unused keys first |
| `--scope` | `all` | Where to search: global, pages, all |
| `--limit` | — | Return at most this many keys |
| `--hardcodedOnly` | `false` | Report source text missing from translations; the query becomes optional |
| `--onlyVue` | `false` | Scan only .vue files |
| `--json` | `false` | Print JSON instead of text |

```bash
i18n-micro search "Welcome"
i18n-micro search --hardcodedOnly --onlyVue
```

## Refactoring

### `text-to-i18n`

Replace hardcoded text in templates and code with translation calls

| Flag | Default | Description |
| --- | --- | --- |
| `--translationFile` | `<translationDir>/<defaultLocale>.json` | File the new keys go to |
| `--path` | pages, components, plugins, layouts | File or directory to process |
| `--context` | — | Prefix for generated keys |
| `--dryRun` | `false` | Show what would change; write nothing |
| `--verbose` | `false` | List every file processed |
| `--extractOnlyDirs` | `plugins` | Comma-separated directories whose files are never rewritten |
| `--extractOnlyPatterns` | — | Comma-separated globs of such files; prefix with ! to exclude |
| `--interactive` | `false` | Confirm or edit every generated key |

```bash
i18n-micro text-to-i18n --dryRun
i18n-micro text-to-i18n --path components --context ui
```

### `rename`

Rename a key in every locale, in linked messages and in source files

| Flag | Default | Description |
| --- | --- | --- |
| `--from` **\*** | — | Current key |
| `--to` **\*** | — | New key |
| `--dryRun` | `false` | Report the changes; write nothing |

**\*** required.

```bash
i18n-micro rename --from common.save --to actions.save
```

### `replace-values`

Replace text in the values of every locale

| Flag | Default | Description |
| --- | --- | --- |
| `--search` **\*** | — | Text or regular expression to find |
| `--replace` **\*** | — | Replacement; with --useRegex, $1 is the first group |
| `--useRegex` | `false` | Treat --search as a regular expression |

**\*** required.

### `pseudo`

Fill a locale with pseudo-translations to find layout and hardcoded-text issues

| Flag | Default | Description |
| --- | --- | --- |
| `--sourceLocale` | the default locale | Locale to read |
| `--targetLocale` **\*** | — | Locale to fill |
| `--replace` | `false` | Overwrite existing values |

**\*** required.

### `optimize`

Report oversized files, deep nesting and duplicated values

| Flag | Default | Description |
| --- | --- | --- |
| `--minSize` | `1024` | Report files above this size in bytes |
| `--maxDepth` | `3` | Report keys nested deeper than this |
| `--dryRun` | `false` | Accepted for compatibility: this command never writes |
| `--json` | `false` | Print JSON instead of text |

### `format`

Rewrite locale files with sorted keys and uniform indentation

| Flag | Default | Description |
| --- | --- | --- |
| `--indent` | `2` | Spaces of indentation |
| `--sortKeys` | `true` | Sort keys; use --no-sortKeys to keep their order |

### `split`

Write each locale as smaller files grouped by top-level key, for review or hand-off

| Flag | Default | Description |
| --- | --- | --- |
| `--maxKeys` | `100` | Keys per file before a group is split further |
| `--maxDepth` | `2` | Levels joined into dotted keys |
| `--splitByPrefix` | `false` | Flatten keys fully before grouping |
| `--outputDir` | `<translationDir>/split` | Output directory, relative to the project |

## Import and export

### `export`

Export locale files to PO

| Flag | Default | Description |
| --- | --- | --- |
| `--potsDir` | `pots` | PO directory, relative to the project |

### `import`

Merge PO files into the locale files

| Flag | Default | Description |
| --- | --- | --- |
| `--potsDir` | `pots` | PO directory, relative to the project |

### `export-csv`

Export every locale to one CSV file, page files included

| Flag | Default | Description |
| --- | --- | --- |
| `--csvDir` | `csv_exports` | CSV directory, relative to the project |

### `import-csv`

Merge CSV files into the locale files

| Flag | Default | Description |
| --- | --- | --- |
| `--csvDir` | `csv_exports` | CSV directory, relative to the project |

### `diff`

List keys each locale misses compared with the default locale

| Flag | Default | Description |
| --- | --- | --- |
| `--json` | `false` | Print JSON instead of text |

### `check-duplicates`

List identical values under different keys, per locale

## Backup and planning

### `backup`

Archive the translation directory

| Flag | Default | Description |
| --- | --- | --- |
| `--backupDir` | `<translationDir>/backups` | Archive directory, relative to the project |
| `--password` | — | Encrypt the archive with AES-256-GCM |
| `--comment` | — | Added to the archive name |

### `restore`

List backups, or restore one over the translation directory

| Flag | Default | Description |
| --- | --- | --- |
| `--backupDir` | `<translationDir>/backups` | Archive directory, relative to the project |
| `--backup` | — | Archive to restore, or the start of its name |
| `--password` | — | Password of an encrypted archive |
| `--force` | `false` | Do not ask for confirmation |

### `estimate`

Estimate tokens and cost of a translate run

| Flag | Default | Description |
| --- | --- | --- |
| `--replace` | `false` | Estimate re-translating every key |
| `--inputCostPer1kTokens` | `0.5` | USD per 1k input tokens |
| `--outputCostPer1kTokens` | `1.5` | USD per 1k output tokens |
| `--outputTokenRatio` | `1.0` | Expected output/input token ratio |
| `--json` | `false` | Print JSON instead of text |

### `glossary`

Manage the glossary the `ai` translation service follows

| Flag | Default | Description |
| --- | --- | --- |
| `--file` | `.i18n-glossary.json` | Glossary file, relative to the project |
| `--action` | `list` | What to do: list, add, remove |
| `--source` | — | Source term |
| `--target` | — | Target term |
| `--from` | — | Limit to this source locale |
| `--to` | — | Limit to this target locale |
| `--json` | `false` | Print JSON instead of text |

```bash
i18n-micro glossary --action add --source Cart --target Warenkorb --to de
```

<!-- /generated:cli-commands -->
