---
title: Crowdin
description: Sync locales/ with a Crowdin project using the Crowdin CLI and a crowdin.yml that matches the module's file layout.
outline: [2, 3]
---

# Crowdin

[Crowdin](https://crowdin.com/) is a translation platform: you upload the default locale's files, translators work in Crowdin, and you download the other locales back. The module reads plain JSON files, so the Crowdin CLI only needs a `crowdin.yml` that maps `locales/` and `locales/pages/` correctly. No module setting changes.

## Configure crowdin.yml

```yml
# crowdin.yml
project_id_env: CROWDIN_PROJECT_ID
api_token_env: CROWDIN_PERSONAL_TOKEN
base_path: ./locales
preserve_hierarchy: true

files:
  - source: /en.json
    translation: /%two_letters_code%.json
  - source: /pages/**/en.json
    translation: /pages/**/%two_letters_code%.json
```

- `en` is your default locale; its files are the sources.
- `project_id_env` / `api_token_env` read the ID and token from environment variables, so no secret is committed.
- `preserve_hierarchy: true` keeps `pages/<page>/` folders as they are.
- The translated file name must equal the locale `code` in `nuxt.config.ts`. `%two_letters_code%` fits codes like `de`; for codes like `pt-BR` use `%locale%`, or map Crowdin's codes to yours with `languages_mapping`.

## Upload and download

```bash
npm install -g @crowdin/cli

export CROWDIN_PROJECT_ID=123456
export CROWDIN_PERSONAL_TOKEN=...   # from Crowdin account settings

crowdin upload sources   # push locales/en.json and locales/pages/**/en.json
crowdin download         # write locales/de.json, locales/pages/**/de.json, ...
```

Run both in CI to keep files current. Downloaded files land in your repository like hand-edited ones; the next build or dev reload picks them up.

## Before uploading

Clean the sources first so translators do not work on dead keys: [`i18n-micro clean`](/api/cli#clean) removes unused keys, `i18n-micro validate` reports gaps after a download.

## Related

- [Translation files](/guide/translations)
- [CLI](/guide/cli)
- [Crowdin CLI configuration](https://crowdin.github.io/crowdin-cli/configuration)
