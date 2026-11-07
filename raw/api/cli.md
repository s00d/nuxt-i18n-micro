# CLI commands

The [CLI guide](/guide/cli) shows the common workflows. This page lists everything, and is generated from the same table that drives `--help`.

## Common flags

<field-group>
<field name="--cwd" type="string">

Project directory

**Default** current directory

</field>

<field name="--logLevel" type="string">

Output level: `silent`, `info`

**Default** `info`

</field>

<field name="--debug" type="boolean">

Print a stack trace when a command fails

**Default** `false`

</field>
</field-group>

## Inspect

### `info`

Print the resolved i18n configuration of the project

<field-group>
<field name="--json" type="boolean">

Print JSON instead of text

**Default** `false`

</field>
</field-group>

### `check`

The CI gate: fail on missing, empty, extra, undefined or unused keys and broken placeholders

<field-group>
<field name="--translationDir" type="string">

Translation directory, relative to the project

**Default** `i18n.translationDir` of nuxt.config

</field>

<field name="--only" type="string">

Comma-separated checks to run: missing, empty, extra, placeholders, undefined, unused, duplicates. `unused` named here fails when it cannot run

**Default** all but duplicates

</field>

<field name="--duplicates" type="boolean">

Also report the same text under different keys

**Default** `false`

</field>

<field name="--ignore" type="string">

Comma-separated globs of source files to skip, relative to the project

</field>

<field name="--json" type="boolean">

Print JSON instead of text

**Default** `false`

</field>
</field-group>

```bash
i18n-micro check
i18n-micro check --only missing,placeholders --json
```

### `stats`

Show translation completion per locale

<field-group>
<field name="--translationDir" type="string">

Translation directory, relative to the project

**Default** `i18n.translationDir` of nuxt.config

</field>

<field name="--html" type="string">

Also write an HTML report to this file

</field>

<field name="--json" type="boolean">

Print JSON instead of text

**Default** `false`

</field>

<field name="--baseRef" type="string">

Git ref to compare completion with, e.g. HEAD~1 or main

</field>
</field-group>

```bash
i18n-micro stats --baseRef main
i18n-micro stats --html reports/i18n.html
```

### `lint`

Check the text of translations; fails when issues remain

<field-group>
<field name="--translationDir" type="string">

Translation directory, relative to the project

**Default** `i18n.translationDir` of nuxt.config

</field>

<field name="--rules" type="string">

Comma-separated rules to run: no-trailing-spaces, no-multiple-spaces, no-empty-translation, or a custom one

**Default** all, or `enabledRules` of .i18n-lintrc.json

</field>

<field name="--fix" type="boolean">

Fix what can be fixed: spaces, and custom rules with a replacement

**Default** `false`

</field>

<field name="--json" type="boolean">

Print JSON instead of text

**Default** `false`

</field>
</field-group>

```bash
i18n-micro lint --rules no-trailing-spaces --fix
```

### `search`

Search keys and values, and show where each key is used

<field-group>
<field name="--translationDir" type="string">

Translation directory, relative to the project

**Default** `i18n.translationDir` of nuxt.config

</field>

<field name="<query>" type="string">

Text or key to search for

</field>

<field name="--caseSensitive" type="boolean">

Match case

**Default** `false`

</field>

<field name="--onlyUnused" type="boolean">

Only keys `clean` would remove; the query becomes optional

**Default** `false`

</field>

<field name="--scope" type="string">

Where to search: `global`, `pages`, `all`

**Default** `all`

</field>

<field name="--limit" type="string">

Return at most this many keys

</field>

<field name="--ignore" type="string">

Comma-separated globs of source files to skip, relative to the project

</field>

<field name="--json" type="boolean">

Print JSON instead of text

**Default** `false`

</field>
</field-group>

```bash
i18n-micro search "Welcome"
i18n-micro search --onlyUnused
```

## Translation workflow

### `extract`

List the keys source files use that have no text yet, and add those with a default text to the default locale

<field-group>
<field name="--translationDir" type="string">

Translation directory, relative to the project

**Default** `i18n.translationDir` of nuxt.config

</field>

<field name="--ignore" type="string">

Comma-separated globs of source files to skip, relative to the project

</field>
</field-group>

```bash
i18n-micro extract
```

### `translate`

Fill missing translations from the default locale through a translation service

<field-group>
<field name="--translationDir" type="string">

Translation directory, relative to the project

**Default** `i18n.translationDir` of nuxt.config

</field>

<field name="--service" type="string">

Translation service: ai, azure, deepl, google, libretranslate, yandexcloud

</field>

<field name="--token" type="string">

API key. Prefer the I18N_TRANSLATE_TOKEN environment variable: flags end up in shell history

</field>

<field name="--options" type="string">

Service options as key:value pairs, separated by commas

</field>

<field name="--locale" type="string">

Comma-separated locales to fill

**Default** every locale but the default one

</field>

<field name="--replace" type="boolean">

Translate every key again, replacing existing values

**Default** `false`

</field>

<field name="--dryRun" type="boolean">

Count keys and characters per locale; send nothing

**Default** `false`

</field>

<field name="--chunkSize" type="string">

Strings per request; capped at what the service accepts

</field>

<field name="--pluralSeparator" type="string">

Separator of plural forms in messages

**Default** `|`

</field>

<field name="--glossaryFile" type="string">

Glossary file, used by the `ai` service

**Default** `.i18n-glossary.json` when it exists

</field>
</field-group>

```bash
i18n-micro translate --dryRun
I18N_TRANSLATE_TOKEN=... i18n-micro translate --service deepl --locale de,fr
i18n-micro translate --service ai --options provider:openai,model:gpt-4o-mini
i18n-micro translate --service libretranslate --options baseUrl:https://translate.example.com
```

### `sync`

Remove keys the default locale does not have; stops when that cannot be proven safe. Missing keys stay missing

<field-group>
<field name="--translationDir" type="string">

Translation directory, relative to the project

**Default** `i18n.translationDir` of nuxt.config

</field>

<field name="--ignore" type="string">

Comma-separated globs of source files to skip, relative to the project

</field>

<field name="--dryRun" type="boolean">

List what would be removed; write nothing

**Default** `false`

</field>

<field name="--force" type="boolean">

Remove keys even though it cannot be proven safe

**Default** `false`

</field>
</field-group>

```bash
i18n-micro sync --dryRun
```

### `clean`

Remove keys nothing in the project uses; stops when that cannot be proven

<field-group>
<field name="--translationDir" type="string">

Translation directory, relative to the project

**Default** `i18n.translationDir` of nuxt.config

</field>

<field name="--include" type="string">

Regular expression: consider only matching keys for removal

</field>

<field name="--exclude" type="string">

Regular expression: never remove matching keys

</field>

<field name="--ignore" type="string">

Comma-separated globs of source files to skip, relative to the project

</field>

<field name="--dryRun" type="boolean">

List what would be removed; write nothing

**Default** `false`

</field>

<field name="--force" type="boolean">

Remove keys even though usage cannot be proven for all of them

**Default** `false`

</field>
</field-group>

```bash
i18n-micro clean --dryRun
i18n-micro clean --exclude '^errors\.'
```

## Refactoring

### `text-to-i18n`

Replace hardcoded text in Vue templates with translation calls, and report hardcoded text in code

<field-group>
<field name="--translationFile" type="string">

File the new keys go to

**Default** `<translationDir>/<defaultLocale>.json`

</field>

<field name="--path" type="string">

File or directory to process

**Default** the whole project

</field>

<field name="--context" type="string">

Prefix for generated keys

</field>

<field name="--ignore" type="string">

Comma-separated globs of source files to skip, relative to the project

</field>

<field name="--dryRun" type="boolean">

Show what would change; write nothing

**Default** `false`

</field>

<field name="--interactive" type="boolean">

Confirm or edit every generated key

**Default** `false`

</field>
</field-group>

```bash
i18n-micro text-to-i18n --dryRun
i18n-micro text-to-i18n --path components --context ui
```

### `rename`

Rename a key or a namespace in every locale and in source files

<field-group>
<field name="--translationDir" type="string">

Translation directory, relative to the project

**Default** `i18n.translationDir` of nuxt.config

</field>

<field name="--from" type="string" :required="true">

Current key or namespace

</field>

<field name="--to" type="string" :required="true">

New key or namespace

</field>

<field name="--ignore" type="string">

Comma-separated globs of source files to skip, relative to the project

</field>

<field name="--dryRun" type="boolean">

Report the changes; write nothing

**Default** `false`

</field>
</field-group>

```bash
i18n-micro rename --from common.save --to actions.save
```

### `pseudo`

Fill a locale with pseudo-translations to find layout and hardcoded-text issues

<field-group>
<field name="--translationDir" type="string">

Translation directory, relative to the project

**Default** `i18n.translationDir` of nuxt.config

</field>

<field name="--sourceLocale" type="string">

Locale to read

**Default** the default locale

</field>

<field name="--targetLocale" type="string" :required="true">

Locale to fill

</field>

<field name="--replace" type="boolean">

Overwrite existing values

**Default** `false`

</field>
</field-group>

### `format`

Rewrite locale files with sorted keys and uniform indentation

<field-group>
<field name="--translationDir" type="string">

Translation directory, relative to the project

**Default** `i18n.translationDir` of nuxt.config

</field>

<field name="--indent" type="string">

Spaces of indentation

**Default** `2`

</field>

<field name="--sortKeys" type="boolean">

Sort keys; use --no-sortKeys to keep their order

**Default** `true`

</field>

<field name="--check" type="boolean">

Fail if a file would change; write nothing

**Default** `false`

</field>
</field-group>

```bash
i18n-micro format --check
```

## Exchange

### `export`

Export locale files to PO or CSV, with the default-locale text as the source

<field-group>
<field name="--translationDir" type="string">

Translation directory, relative to the project

**Default** `i18n.translationDir` of nuxt.config

</field>

<field name="--format" type="string">

File format: `po`, `csv`

**Default** `po`

</field>

<field name="--dir" type="string">

Output directory, relative to the project

**Default** `pots` for po, `csv_exports` for csv

</field>

<field name="--force" type="boolean">

Overwrite files changed since the last export and never imported

**Default** `false`

</field>
</field-group>

```bash
i18n-micro export --format csv
```

### `import`

Merge PO or CSV files into the locale files

<field-group>
<field name="--translationDir" type="string">

Translation directory, relative to the project

**Default** `i18n.translationDir` of nuxt.config

</field>

<field name="--format" type="string">

File format: `po`, `csv`

**Default** `po`

</field>

<field name="--dir" type="string">

Input directory, relative to the project

**Default** `pots` for po, `csv_exports` for csv

</field>

<field name="--dryRun" type="boolean">

Report what would be imported; write nothing

**Default** `false`

</field>
</field-group>

```bash
i18n-micro import --format csv --dryRun
```

### `sync-remote`

Pull global translations from, or push them to, the HTTP endpoint in .i18n-remote.json

<field-group>
<field name="--translationDir" type="string">

Translation directory, relative to the project

**Default** `i18n.translationDir` of nuxt.config

</field>

<field name="--pull" type="boolean">

Pull from the remote

**Default** `true`

</field>

<field name="--push" type="boolean">

Push to the remote

**Default** `false`

</field>

<field name="--force" type="boolean">

On a pull, take the remote value; on a push, overwrite text only the remote holds

**Default** `false`

</field>

<field name="--dryRun" type="boolean">

Report what a pull would change; write and push nothing

**Default** `false`

</field>
</field-group>

```bash
i18n-micro sync-remote --dryRun
i18n-micro sync-remote --no-pull --push
```

## Lint rules

<field-group>
<field name="no-trailing-spaces">

Spaces at the end of a value or a line

Fixed by `--fix`.

</field>

<field name="no-multiple-spaces">

Two or more spaces in a row

Fixed by `--fix`.

</field>

<field name="no-empty-translation">

An empty or blank value

</field>
</field-group>

## Exit codes

<field-group>
<field name="0">

Done, nothing to report

</field>

<field name="1">

Findings: `check`, `lint` or `format --check` found something, `clean` or `sync` could not prove a removal safe, `export` would overwrite unimported work, `translate` left keys out, `import` or `sync-remote` met a conflict, a `sync-remote` push would drop remote text. A `--dryRun` of `clean`, `sync` or a `sync-remote` pull reports these and exits `0`

</field>

<field name="2">

Failure: bad usage, unreadable project, network or file error

</field>
</field-group>

## Configuration files

<field-group>
<field name=".i18n-lintrc.json">

`lint`: `enabledRules`, `disabledRules`, `customRegexRules` (`name`, `pattern`, `flags`, `description`, `replacement`)

</field>

<field name=".i18n-remote.json">

`sync-remote`: `url`, `path`, `token`, `auth` (`username`, `password`). `type` may be left out; only `custom` exists

</field>

<field name=".i18n-glossary.json">

`translate --service ai`: `entries` of `source`, `target`, and optional `from`, `to`

</field>
</field-group>

## Environment variables

<field-group>
<field name="I18N_TRANSLATE_TOKEN">

API key of `translate`. Read from `.env` too

</field>

<field name="I18N_REMOTE_TOKEN">

Bearer token of `sync-remote`. Read from `.env` too

</field>

<field name="AI_GATEWAY_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY">

Key of the `ai` service, when `I18N_TRANSLATE_TOKEN` is not set

</field>

<field name="DEFAULT_LOCALE">

Overrides `defaultLocale`, as in the module

</field>
</field-group>

## Removed commands

<field-group>
<field name="validate">

Instead: check

</field>

<field name="diff">

Instead: check --only missing

</field>

<field name="check-duplicates">

Instead: check --only duplicates

</field>

<field name="export-csv">

Instead: export --format csv

</field>

<field name="import-csv">

Instead: import --format csv

</field>

<field name="estimate">

Instead: translate --dryRun

</field>

<field name="optimize">

Instead: check --only duplicates

</field>

<field name="backup">

Instead: git, which already keeps your locale files

</field>

<field name="restore">

Instead: git, which already keeps your locale files

</field>

<field name="init">

Instead: nuxi init, then add nuxt-i18n-micro to modules

</field>

<field name="split">

Instead: nothing: the module does not read split files

</field>

<field name="replace-values">

Instead: your editor or sed

</field>

<field name="glossary">

Instead: editing .i18n-glossary.json by hand

</field>
</field-group>
