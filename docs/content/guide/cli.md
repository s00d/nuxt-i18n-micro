---
title: CLI
description: Check translations in CI, find unused keys, fill gaps through a translation service and exchange files with translators from the command line.
outline: [2, 3]
navigation:
  order: 200
  group: Tooling
---

# CLI

`@i18n-micro/cli` manages the locale files of a Nuxt project. It reads `locales`, `defaultLocale`, `translationDir` and your layers from `nuxt.config`, so it needs no configuration of its own.

![A terminal running i18n-micro check, which lists a missing, an undefined and four unused keys and fails, then extract, which adds the undefined key, then clean --dryRun, which lists the four keys it would remove](/cli/demo.gif){width="1200" height="640"}

| Command | Use it to |
| --- | --- |
| `check` | Fail a build on anything wrong with the locale files |
| `translate` | Fill missing keys through a translation service |
| `clean` | Remove keys nothing uses |
| `rename` | Move a key, or a whole namespace, everywhere at once |

```bash
npm install -D @i18n-micro/cli
npx i18n-micro --help
```

Run it from the app root, or point at it with `--cwd`. Every flag of every command is on the [command reference](/api/cli).

::tip
**Moving from nuxt-i18n-micro-cli?** `@i18n-micro/cli` replaces it; the bins `i18n-micro` and `i18n-micro-cli` stay. See the [table of old commands](#moving-from-nuxt-i18n-micro-cli).
::

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

- `--only missing,placeholders` runs some checks; a check named in `--only` that could not run fails.
- `--json` gives a report for tooling.
- `--ignore` skips source files.
- While keys are computed at runtime, `unused` is skipped and the report says why.

Every command exits with one of three codes, so a pipeline can tell a problem with your translations from a problem with the tool:

| Exit code | Meaning |
| --- | --- |
| `0` | Nothing to report |
| `1` | Findings |
| `2` | The command could not run: a usage error, a broken file, a failed request |

Other commands worth a CI step:

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

`sync` stops like `clean` does when it would remove a key it cannot prove unused, and also when the default locale has nothing to compare with. With nothing to remove it never stops, so `$t(item.label)` alone is no reason for `--force`.

::note
`extract` and `sync` never write `''` for a key without a translation. The key stays absent, so `fallbackLocale` applies at runtime and `check` reports it. An empty string would be a defined value and show a blank.
::

### What the commands read

`check`, `extract`, `sync`, `clean`, `search` and `rename` read source code across the whole project, not a fixed list of folders:

- **Read:** templates and scripts through a parser, `.html` and Pug as text, every layer, and folders outside the root that an alias or `components` points at.
- **Skipped:** `node_modules`, build output and the locale files. Add your own with `--ignore 'legacy/**,*.stories.ts'`.
- **Test code** counts as usage, so `clean` and `check --only unused` keep a key only a test reads. It never adds a key: `extract` skips such keys, and `check` does not report them as undefined.

Test code means the root folders `tests`, `test`, `__tests__`, `e2e`, `cypress` and `playwright`, plus `.spec` and `.test` JavaScript and TypeScript files (`.ts`, `.tsx`, `.mts`, `.js`, `.jsx`, `.mjs` and the like) anywhere. Only the root folders are exempt from the doubts below: `pages/tests/[id].vue` is a page like any other, and so are `public/` and minified files, whose code is not part of the app.

The commands recognise:

- `$t`, `$ts`, `$tc`, `$has` and `$_t(route)`;
- `t()` from `useI18n()` and `useTranslationServerMiddleware()`;
- `<i18n-t keypath>` in templates and JSX, and `<i18n-group prefix>`;
- aliases such as `const { t: tr } = useI18n()`.

### How `clean` decides

`clean` would rather leave a dead key than remove a live one. A key stays when any of this is true:

- a call uses it, or a key below or above it;
- a string in the code equals it: `const key = 'menu.home'`, `<Item label="menu.home" />`;
- a JSON, YAML or Markdown file in the project contains it;
- a computed key has a static start that covers it: `` $t(`status.${state}`) `` keeps everything under `status.`;
- a layer defines it.

`clean` stops without changing anything when it cannot know, and lists why:

- a key is fully computed, as in `$t(name)`, `<i18n-t :keypath="name" />` or `<i18n-t v-bind="props" />`;
- `$t` is passed around as a value, as in `items.map($t)`;
- a function called `t` gets a computed argument and comes from a parameter, an import or a call: it may be a wrapper around the real one. A function the same file defines does not count, because a wrapper would have its own call inside;
- a source file does not parse;
- no file uses any key at all, which usually means it is looking in the wrong place;
- a locale file is a symlink out of the project, so another app may read it.

::steps{level="4"}
#### Preview

Run `i18n-micro clean --dryRun` and review what it lists.

#### Protect keys

Keep keys that only look unused with `--exclude '^errors\.'`.

#### Remove

Run it again with `--force`.
::

## Translate missing keys

```bash
i18n-micro translate --dryRun                     # keys and characters per locale, nothing sent
export I18N_TRANSLATE_TOKEN=...                   # or put it in .env
i18n-micro translate --service deepl --locale de,fr
```

- `translate` fills keys that are missing or empty; `--replace` translates everything again.
- Placeholders and plural forms are protected. A translation that lost a placeholder is not written: the key is listed and the command exits `1`.
- Every batch is saved before the next request goes out, so a failure costs only the request that failed.

| `--service` | Service | `--token` | Useful `--options` |
| --- | --- | --- | --- |
| `ai` | Vercel AI Gateway, OpenAI, Anthropic or any OpenAI-compatible server | API key, or `AI_GATEWAY_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` | `provider`, `model`, `baseUrl`, `maxTokens` |
| `azure` | Azure Translator | Subscription key | `region` |
| `deepl` | DeepL, Free keys included | Auth key | `formality`, `glossaryId`, `context` |
| `google` | Google Cloud Translation v2 | API key | `model` |
| `libretranslate` | LibreTranslate | Optional | `baseUrl` |
| `yandexcloud` | Yandex Cloud Translate | API key, or IAM token with `authScheme:Bearer` | `folderId`, `model` |

Options are `key:value` pairs: `--options provider:openai,model:gpt-4o-mini`. All services also take `baseUrl`, `retries`, `retryDelayMs` and `timeoutMs`. A translation request may already be billed, so it is repeated only after a `429` or `503`, and not when the service asks to wait more than a minute.

::warning
Flags are visible in shell history and process lists, so pass the token through the environment variable. The CLI masks what it knows to be secret wherever it prints it, `--debug` included: tokens, provider keys, Basic credentials, and the query and credentials of a URL you configured. A server that reformats a key before echoing it is out of its reach, so treat logs of a failed run with care.
::

The `ai` service follows a glossary. When `.i18n-glossary.json` exists it is used without a flag; `--glossaryFile` picks another file.

```json [.i18n-glossary.json]
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

Only `.vue` templates of the project itself are rewritten, not those of a layer or an alias target. Every rewritten file is parsed again before it is written. These are listed and keep their text:

- text in `.ts` files and scripts, because `$t` is not in scope everywhere;
- text next to markup or an interpolation, such as `<p>Hello <b>world</b> today</p>`: half a sentence cannot be translated on its own;
- a generated key that would collide with another, as a parent page and its child can;
- a known key that cannot go between quotes.

::warning
Commit first, and review the diff.
::

## Rename a key

```bash
i18n-micro rename --from common.save --to actions.save
i18n-micro rename --from settings --to account.settings   # a whole namespace
```

`rename` edits the syntax tree, so comments and unrelated strings stay as they are, and aliases and `:keypath` are followed. A layer's own file is never changed. It warns about what it cannot rewrite, and leaves it alone:

- a computed key under the old name;
- each plain string equal to it;
- a Pug template;
- a source in a layer or in a folder outside the project.

`--to` has to be a key that can be written in code: no quotes, no backslash, no empty segment, no `__proto__`.

## Exchange files with translators

```bash
i18n-micro export --format csv
i18n-micro import --format csv --dryRun
```

**`export`** writes every key of every locale, untranslated ones included, with the default-locale text as the source: a `Source` column in CSV, a `#.` comment in PO.

- Without `--dir`, PO goes to `pots` and CSV to `csv_exports`.
- It records what it wrote in `.i18n-export.json`, in the output folder. It stops when a file has changed since then and holds translations the locale files do not have, fuzzy PO entries included; `--force` overwrites them. Ordinary edits of the locale files do not stop it.

**`import`** merges, skips empty cells, and skips PO entries marked `fuzzy`.

- A key that would overwrite a value, or a value over a whole group of keys, is listed and left out, and the command exits `1`.
- It stops with exit `2` on a catalog in an unexpected location, a page's catalog the last export did not write, a quote out of place in a CSV, or a page entry under `disablePageLocales`.

For a translation platform, use its own CLI: the [Crowdin](/guide/crowdin) setup syncs the JSON files, page files included.

## Sync with your own endpoint

`sync-remote` exchanges the global locale files with an HTTP endpoint you run. Page files stay local, and the command says so. Describe the endpoint in `.i18n-remote.json`:

```json [.i18n-remote.json]
{ "url": "https://translations.example.com", "path": "translations" }
```

The endpoint answers `GET` and `PUT` with a `{ locale: messages }` object. Authenticate with `auth: { username, password }`, or put a bearer token in `I18N_REMOTE_TOKEN`.

| | Pull | Push |
| --- | --- | --- |
| What moves | Fills what you do not have and keeps keys only you have | Sends the project's own keys, not those of a layer, and leaves your blanks out |
| Conflicts | A key that differs on both sides: nothing is written, exit `1`; `--force` takes the remote value | A PUT replaces the document, so a push first reads the endpoint and stops with exit `1` when it holds text you do not have; `--force` overwrites it. An endpoint that answers `404` has nothing to lose |
| `--dryRun` | Reads from the endpoint, lists the changes, writes nothing | Says what would be sent, without contacting the endpoint |

A locale you have not configured is skipped, and a blank remote value clears nothing.

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

**Removed services:** `googlefree`, `yandex` (use `yandexcloud`), `ibm`, `lingvatranslate`, `modernmt`, `lilt`, `unbabel`, `reverso`, `baidu`, `papago`, `tencent`, `systran`, `mymemory`.

**Removed `sync-remote` types:** `github`, `gitlab`, `crowdin`, `lokalise`, `tolgee`, `weblate`. Use the platform's own CLI, or `custom`, which needs no `type` any more.

### Changed behaviour

- `extract` and `sync` no longer write `''`. Keys stay absent, and `check` reports them. `extract` writes a key only when the code gives its text.
- `extract` writes page keys to `locales/pages/<route name>/`, where the module reads them, and scans `app/` on Nuxt 4. Move anything from directories such as `pages/_about` and `pages/blog_`, and delete a stray `locales/pages/<locale>.json`.
- `translationDir` from `nuxt.config` is respected; before, every command silently used `locales`.
- Without `defaultLocale`, the default is `en`, as in the module, and `DEFAULT_LOCALE` is honoured. It used to be the first locale.
- `check` and `sync` use the default locale as the reference and check page files. `"a.b"` and `a: { b }` count as one key.
- `clean` keeps a key used anywhere, in any scope, and stops when usage cannot be proven. `--include` and `--exclude` choose what may be removed.
- `sync` stops the same way, and when the default locale has no keys to compare with. `--force` overrides it. It also stops when `DEFAULT_LOCALE` chose another reference than `nuxt.config`.
- Single-dash long flags and stray arguments are errors: `clean -dryRun` no longer runs `clean`.
- A read-only file, or a file that is not UTF-8, cannot be saved: the command stops before it changes anything. Reading such a file is fine. A repeated key, a key called `__proto__` and an integer above 2^53 stop a command, because a save would lose them.
- A flag that needs a value and is followed by another flag is an error; write `--flag=--value` for a value that starts with a dash. A boolean flag takes only `true` or `false`.
- `export` stops rather than overwrite translations that were never imported.
- Exit codes are `0`, `1` and `2`; failures used to be `1`, and `diff` and `check-duplicates` always `0`.
- `lint --fix` no longer leaves `.bak` files.
- A save keeps a file's indentation, line endings, final newline, symlink and hard link, and leaves files it did not change alone.
- A mistyped or removed flag is now an error, not silently ignored.
- Paths such as `--dir` are relative to the project, not to the shell.
- `ai` no longer loads `@ai-sdk/*` packages: use `provider` `gateway`, `openai` or `anthropic`, or `baseUrl` for an OpenAI-compatible server.

## Related

::card-group
  :::card{title="CLI commands" icon="i-lucide-braces" to="/api/cli"}
  :::
  :::card{title="Translation files" icon="i-lucide-book-open" to="/guide/translations"}
  :::
  :::card{title="Crowdin" icon="i-lucide-book-open" to="/guide/crowdin"}
  :::
  :::card{title="DevTools" icon="i-lucide-book-open" to="/guide/devtools"}
  :::
::
