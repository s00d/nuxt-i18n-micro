# CLI

`@i18n-micro/cli` manages the locale files of a Nuxt project. It reads `locales`, `defaultLocale`, `translationDir` and your layers from `nuxt.config`, so it needs no configuration of its own.

![A terminal running i18n-micro check, which lists a missing, an undefined and four unused keys and fails, then extract, which adds the undefined key, then clean --dryRun, which lists the four keys it would remove](/cli/demo.gif)

<table>
<thead>
  <tr>
    <th>
      Command
    </th>
    
    <th>
      Use it to
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        check
      </code>
    </td>
    
    <td>
      Fail a build on anything wrong with the locale files
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        translate
      </code>
    </td>
    
    <td>
      Fill missing keys through a translation service
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        clean
      </code>
    </td>
    
    <td>
      Remove keys nothing uses
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        rename
      </code>
    </td>
    
    <td>
      Move a key, or a whole namespace, everywhere at once
    </td>
  </tr>
</tbody>
</table>

```bash
npm install -D @i18n-micro/cli
npx i18n-micro --help
```

Run it from the app root, or point at it with `--cwd`. Every flag of every command is on the [command reference](/api/cli).

<tip>

**Moving from nuxt-i18n-micro-cli?** `@i18n-micro/cli` replaces it; the bins `i18n-micro` and `i18n-micro-cli` stay. See the [table of old commands](#moving-from-nuxt-i18n-micro-cli).

</tip>

## Use it in CI

```bash
i18n-micro check
```

`check` is the gate. It reports:

<table>
<thead>
  <tr>
    <th>
      Check
    </th>
    
    <th>
      Means
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        missing
      </code>
    </td>
    
    <td>
      A key of the default locale is absent from a locale
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        empty
      </code>
    </td>
    
    <td>
      A value is <code>
        ''
      </code>
      
      . The app shows a blank, not the fallback
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        extra
      </code>
    </td>
    
    <td>
      A locale has a key the default locale does not
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        placeholders
      </code>
    </td>
    
    <td>
      <code>
        {name}
      </code>
      
       was lost or added, or a plural lost its forms
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      The code uses a key the default locale does not have
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        unused
      </code>
    </td>
    
    <td>
      Nothing in the project uses a key
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        duplicates
      </code>
    </td>
    
    <td>
      The same text under different keys. Off by default: pass <code>
        --duplicates
      </code>
    </td>
  </tr>
</tbody>
</table>

- `--only missing,placeholders` runs some checks; a check named in `--only` that could not run fails.
- `--json` gives a report for tooling.
- `--ignore` skips source files.
- While keys are computed at runtime, `unused` is skipped and the report says why.

Every command exits with one of three codes, so a pipeline can tell a problem with your translations from a problem with the tool:

<table>
<thead>
  <tr>
    <th>
      Exit code
    </th>
    
    <th>
      Meaning
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        0
      </code>
    </td>
    
    <td>
      Nothing to report
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        1
      </code>
    </td>
    
    <td>
      Findings
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        2
      </code>
    </td>
    
    <td>
      The command could not run: a usage error, a broken file, a failed request
    </td>
  </tr>
</tbody>
</table>

Other commands worth a CI step:

```bash
i18n-micro format --check      # fails if a file is not formatted
i18n-micro lint                # stray spaces, empty values, your own regex rules
i18n-micro stats --baseRef main
```

## Keep locales in step

<table>
<thead>
  <tr>
    <th>
      Command
    </th>
    
    <th>
      What it does
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        extract
      </code>
    </td>
    
    <td>
      Lists the keys the code uses that have no text yet. A default text, as in <code>
        $t('key', {}, 'Welcome')
      </code>
      
      , goes to the default locale.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        sync
      </code>
    </td>
    
    <td>
      Removes keys the default locale does not have. Try <code>
        --dryRun
      </code>
      
       first.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        clean
      </code>
    </td>
    
    <td>
      Removes keys nothing uses. Try <code>
        --dryRun
      </code>
      
       first.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        search
      </code>
    </td>
    
    <td>
      Finds keys and values, and shows where each key is used.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        stats
      </code>
    </td>
    
    <td>
      Completion per locale; <code>
        --baseRef main
      </code>
      
       compares with a git ref.
    </td>
  </tr>
</tbody>
</table>

`sync` stops like `clean` does when it would remove a key it cannot prove unused, and also when the default locale has nothing to compare with. With nothing to remove it never stops, so `$t(item.label)` alone is no reason for `--force`.

<note>

`extract` and `sync` never write `''` for a key without a translation. The key stays absent, so `fallbackLocale` applies at runtime and `check` reports it. An empty string would be a defined value and show a blank.

</note>

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
- a computed key has a static start that covers it: `$t(`status.${state}`)` keeps everything under `status.`;
- a layer defines it.

`clean` stops without changing anything when it cannot know, and lists why:

- a key is fully computed, as in `$t(name)`, `<i18n-t :keypath="name" />` or `<i18n-t v-bind="props" />`;
- `$t` is passed around as a value, as in `items.map($t)`;
- a function called `t` gets a computed argument and comes from a parameter, an import or a call: it may be a wrapper around the real one. A function the same file defines does not count, because a wrapper would have its own call inside;
- a source file does not parse;
- no file uses any key at all, which usually means it is looking in the wrong place;
- a locale file is a symlink out of the project, so another app may read it.

<steps level="4">

#### Preview

Run `i18n-micro clean --dryRun` and review what it lists.

#### Protect keys

Keep keys that only look unused with `--exclude '^errors\.'`.

#### Remove

Run it again with `--force`.

</steps>

## Translate missing keys

```bash
i18n-micro translate --dryRun                     # keys and characters per locale, nothing sent
export I18N_TRANSLATE_TOKEN=...                   # or put it in .env
i18n-micro translate --service deepl --locale de,fr
```

- `translate` fills keys that are missing or empty; `--replace` translates everything again.
- Placeholders and plural forms are protected. A translation that lost a placeholder is not written: the key is listed and the command exits `1`.
- Every batch is saved before the next request goes out, so a failure costs only the request that failed.

<table>
<thead>
  <tr>
    <th>
      <code>
        --service
      </code>
    </th>
    
    <th>
      Service
    </th>
    
    <th>
      <code>
        --token
      </code>
    </th>
    
    <th>
      Useful <code>
        --options
      </code>
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        ai
      </code>
    </td>
    
    <td>
      Vercel AI Gateway, OpenAI, Anthropic or any OpenAI-compatible server
    </td>
    
    <td>
      API key, or <code>
        AI_GATEWAY_API_KEY
      </code>
      
      , <code>
        OPENAI_API_KEY
      </code>
      
      , <code>
        ANTHROPIC_API_KEY
      </code>
    </td>
    
    <td>
      <code>
        provider
      </code>
      
      , <code>
        model
      </code>
      
      , <code>
        baseUrl
      </code>
      
      , <code>
        maxTokens
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        azure
      </code>
    </td>
    
    <td>
      Azure Translator
    </td>
    
    <td>
      Subscription key
    </td>
    
    <td>
      <code>
        region
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        deepl
      </code>
    </td>
    
    <td>
      DeepL, Free keys included
    </td>
    
    <td>
      Auth key
    </td>
    
    <td>
      <code>
        formality
      </code>
      
      , <code>
        glossaryId
      </code>
      
      , <code>
        context
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        google
      </code>
    </td>
    
    <td>
      Google Cloud Translation v2
    </td>
    
    <td>
      API key
    </td>
    
    <td>
      <code>
        model
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        libretranslate
      </code>
    </td>
    
    <td>
      LibreTranslate
    </td>
    
    <td>
      Optional
    </td>
    
    <td>
      <code>
        baseUrl
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        yandexcloud
      </code>
    </td>
    
    <td>
      Yandex Cloud Translate
    </td>
    
    <td>
      API key, or IAM token with <code>
        authScheme:Bearer
      </code>
    </td>
    
    <td>
      <code>
        folderId
      </code>
      
      , <code>
        model
      </code>
    </td>
  </tr>
</tbody>
</table>

Options are `key:value` pairs: `--options provider:openai,model:gpt-4o-mini`. All services also take `baseUrl`, `retries`, `retryDelayMs` and `timeoutMs`. A translation request may already be billed, so it is repeated only after a `429` or `503`, and not when the service asks to wait more than a minute.

<warning>

Flags are visible in shell history and process lists, so pass the token through the environment variable. The CLI masks what it knows to be secret wherever it prints it, `--debug` included: tokens, provider keys, Basic credentials, and the query and credentials of a URL you configured. A server that reformats a key before echoing it is out of its reach, so treat logs of a failed run with care.

</warning>

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

<warning>

Commit first, and review the diff.

</warning>

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

**export** writes every key of every locale, untranslated ones included, with the default-locale text as the source: a `Source` column in CSV, a `#.` comment in PO.

- Without `--dir`, PO goes to `pots` and CSV to `csv_exports`.
- It records what it wrote in `.i18n-export.json`, in the output folder. It stops when a file has changed since then and holds translations the locale files do not have, fuzzy PO entries included; `--force` overwrites them. Ordinary edits of the locale files do not stop it.

**import** merges, skips empty cells, and skips PO entries marked `fuzzy`.

- A key that would overwrite a value, or a value over a whole group of keys, is listed and left out, and the command exits `1`.
- It stops with exit `2` on a catalog in an unexpected location, a page's catalog the last export did not write, a quote out of place in a CSV, or a page entry under `disablePageLocales`.

For a translation platform, use its own CLI: the [Crowdin](/guide/crowdin) setup syncs the JSON files, page files included.

## Sync with your own endpoint

`sync-remote` exchanges the global locale files with an HTTP endpoint you run. Page files stay local, and the command says so. Describe the endpoint in `.i18n-remote.json`:

```json [.i18n-remote.json]
{ "url": "https://translations.example.com", "path": "translations" }
```

The endpoint answers `GET` and `PUT` with a `{ locale: messages }` object. Authenticate with `auth: { username, password }`, or put a bearer token in `I18N_REMOTE_TOKEN`.

<table>
<thead>
  <tr>
    <th>
      
    </th>
    
    <th>
      Pull
    </th>
    
    <th>
      Push
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      What moves
    </td>
    
    <td>
      Fills what you do not have and keeps keys only you have
    </td>
    
    <td>
      Sends the project's own keys, not those of a layer, and leaves your blanks out
    </td>
  </tr>
  
  <tr>
    <td>
      Conflicts
    </td>
    
    <td>
      A key that differs on both sides: nothing is written, exit <code>
        1
      </code>
      
      ; <code>
        --force
      </code>
      
       takes the remote value
    </td>
    
    <td>
      A PUT replaces the document, so a push first reads the endpoint and stops with exit <code>
        1
      </code>
      
       when it holds text you do not have; <code>
        --force
      </code>
      
       overwrites it. An endpoint that answers <code>
        404
      </code>
      
       has nothing to lose
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --dryRun
      </code>
    </td>
    
    <td>
      Reads from the endpoint, lists the changes, writes nothing
    </td>
    
    <td>
      Says what would be sent, without contacting the endpoint
    </td>
  </tr>
</tbody>
</table>

A locale you have not configured is skipped, and a blank remote value clears nothing.

## Moving from nuxt-i18n-micro-cli

<table>
<thead>
  <tr>
    <th>
      Old command
    </th>
    
    <th>
      Now
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        validate
      </code>
    </td>
    
    <td>
      <code>
        check
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        diff
      </code>
    </td>
    
    <td>
      <code>
        check --only missing
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        check-duplicates
      </code>
    </td>
    
    <td>
      <code>
        check --only duplicates
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        export-csv
      </code>
      
      , <code>
        import-csv
      </code>
    </td>
    
    <td>
      <code>
        export --format csv
      </code>
      
      , <code>
        import --format csv
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --potsDir
      </code>
      
      , <code>
        --csvDir
      </code>
    </td>
    
    <td>
      <code>
        --dir
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        estimate
      </code>
    </td>
    
    <td>
      <code>
        translate --dryRun
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        glossary
      </code>
    </td>
    
    <td>
      Edit <code>
        .i18n-glossary.json
      </code>
      
      ; <code>
        translate
      </code>
      
       reads it by itself
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        backup
      </code>
      
      , <code>
        restore
      </code>
    </td>
    
    <td>
      Git, which already keeps your locale files
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        init
      </code>
    </td>
    
    <td>
      <code>
        nuxi init
      </code>
      
      , then add <code>
        nuxt-i18n-micro
      </code>
      
       to <code>
        modules
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        split
      </code>
    </td>
    
    <td>
      Removed: the module does not read split files
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        optimize
      </code>
    </td>
    
    <td>
      <code>
        check --only duplicates
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        replace-values
      </code>
    </td>
    
    <td>
      Your editor or <code>
        sed
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        stats --full
      </code>
    </td>
    
    <td>
      <code>
        stats
      </code>
      
      ; <a href="/guide/devtools">
        DevTools
      </a>
      
       has the details
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        search --hardcodedOnly
      </code>
    </td>
    
    <td>
      <code>
        text-to-i18n --dryRun
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        search --preferUnused
      </code>
      
      , <code>
        --onlyVue
      </code>
    </td>
    
    <td>
      Removed
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        lint
      </code>
      
       rules <code>
        no-html-tags
      </code>
      
      , <code>
        no-special-chars
      </code>
      
      , <code>
        no-mixed-case
      </code>
      
      , <code>
        no-missing-punctuation
      </code>
      
      , <code>
        no-inconsistent-pluralization
      </code>
    </td>
    
    <td>
      Removed: they flagged normal text. Write a <code>
        customRegexRules
      </code>
      
       entry if you need one
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        text-to-i18n --extractOnlyDirs
      </code>
      
      , <code>
        --extractOnlyPatterns
      </code>
      
      , <code>
        --verbose
      </code>
    </td>
    
    <td>
      Removed: code is never rewritten
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --logLevel verbose
      </code>
    </td>
    
    <td>
      Removed: it did nothing
    </td>
  </tr>
</tbody>
</table>

**Removed services:** `googlefree`, `yandex` (use `yandexcloud`), `ibm`, `lingvatranslate`, `modernmt`, `lilt`, `unbabel`, `reverso`, `baidu`, `papago`, `tencent`, `systran`, `mymemory`.

**Removed sync-remote types:** `github`, `gitlab`, `crowdin`, `lokalise`, `tolgee`, `weblate`. Use the platform's own CLI, or `custom`, which needs no `type` any more.

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

<card-group>
<card icon="i-lucide-braces" title="CLI commands" to="/api/cli">



</card>

<card icon="i-lucide-book-open" title="Translation files" to="/guide/translations">



</card>

<card icon="i-lucide-book-open" title="Crowdin" to="/guide/crowdin">



</card>

<card icon="i-lucide-book-open" title="DevTools" to="/guide/devtools">



</card>
</card-group>
