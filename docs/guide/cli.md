---
title: CLI
description: Extract hardcoded strings, sync, validate and machine-translate locale files with nuxt-i18n-micro-cli.
outline: [2, 3]
---

# CLI

`nuxt-i18n-micro-cli` is a separate command-line tool that works on the JSON files in your `locales/` folder. It finds hardcoded strings and turns them into `$t()` calls, keeps every locale in sync with the default one, reports missing keys and fills them with a translation service. It is released on its own schedule, so check its [npm page](https://www.npmjs.com/package/nuxt-i18n-micro-cli) for the current version and every option.

## Install and run

::: code-group

```bash [pnpm]
pnpm add -D nuxt-i18n-micro-cli
pnpm exec i18n-micro stats
```

```bash [npm]
npm install -D nuxt-i18n-micro-cli
npx i18n-micro stats
```

:::

Run it from the project root (where `nuxt.config.ts` lives). It does not read `nuxt.config.ts`; pass `--translationDir` when your folder is not `locales`. Version 2.1.1 or newer also scans the Nuxt 4 `app/` directory.

Options shared by every command: `--cwd` (project directory, default `.`), `--translationDir` (default `locales`), `--logLevel` (`silent`, `info`, `verbose`).

## Turn hardcoded text into keys

```bash
i18n-micro text-to-i18n --translationFile locales/en.json --dryRun
```

`text-to-i18n` replaces literal text in templates and scripts with `$t('generated.key')` and adds the keys to `--translationFile`, keeping existing entries:

```vue
<!-- before -->
<h1>Welcome to our site</h1>
<!-- after -->
<h1>{{ $t('pages.home.welcome_to_our_site') }}</h1>
```

Run with `--dryRun` first and commit before a real run. `--path` limits it to one file or folder, `--context auth` prefixes the keys with `auth.`, `--interactive` asks before each key. Files in `plugins/` (or `--extractOnlyDirs`) get their keys extracted but are not rewritten.

## Keep locales in sync

| Command | What it does |
| --- | --- |
| `extract` | Collect the keys your code uses, grouped by page. |
| `sync` | Add the default locale's keys missing in the other locales. |
| `validate` | Report missing and extra keys against the default locale. |
| `diff` | Show the keys and values the default locale has and another one lacks. |
| `clean` | Remove keys the code no longer uses. |
| `stats` | Translated vs total keys per locale (`--full` for combined totals). |
| `check-duplicates` | Find different keys with the same value within a locale. |
| `replace-values` | Bulk-replace values: `--search`, `--replace`, `--useRegex` (with `$1` groups). |

A typical CI step: `i18n-micro validate` to fail on missing keys, `i18n-micro clean` before a release.

## Machine-translate missing keys

```bash
i18n-micro translate --service deepl --token "$DEEPL_API_KEY"
```

`translate` fills keys that are missing in each locale; `--replace` re-translates everything. Supported `--service` values include `google`, `deepl`, `openai`, `azure`, `yandex`, `libretranslate` and more (see the npm page). `--options` passes service settings as `key:value` pairs, for example `--options openaiModel:gpt-4o-mini`.

Read the token from an environment variable or your CI secret store; never commit it.

## Exchange files with translators

| Command | Format |
| --- | --- |
| `export` / `import` | Gettext PO files in `--potsDir` (default `pots`). |
| `export-csv` / `import-csv` | CSV with key, file path and value, in `--csvDir` (`--delimiter` to change `,`). |

For a translation platform, the [Crowdin](/guide/crowdin) setup syncs the JSON files directly.

## Related

- [Translation files](/guide/translations)
- [Crowdin](/guide/crowdin)
- [DevTools](/guide/devtools)
