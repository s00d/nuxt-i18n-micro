# @i18n-micro/cli

Command-line tools for [nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro): a CI gate for your translations, safe removal of unused keys, translation of what is missing, and a rename that follows the code.

```bash
npm install -D @i18n-micro/cli
npx i18n-micro check                                       # the CI gate: exit 0, 1 on findings, 2 on failure
npx i18n-micro translate --dryRun                          # what a run would send
I18N_TRANSLATE_TOKEN=... npx i18n-micro translate --service deepl
npx i18n-micro clean --dryRun                              # keys nothing in the project uses
npx i18n-micro rename --from common.save --to actions.save
```

| Group                | Commands                                     |
| -------------------- | -------------------------------------------- |
| Inspect              | `info`, `check`, `stats`, `lint`, `search`   |
| Translation workflow | `extract`, `translate`, `sync`, `clean`      |
| Refactoring          | `text-to-i18n`, `rename`, `pseudo`, `format` |
| Exchange             | `export`, `import`, `sync-remote`            |

It runs inside a Nuxt project and reads `locales`, `defaultLocale`, `translationDir` and layers from `nuxt.config` through the project's own Nuxt. Requires Node.js 20 or newer.

- [Guide](https://s00d.github.io/nuxt-i18n-micro/guide/cli)
- [All commands and flags](https://s00d.github.io/nuxt-i18n-micro/api/cli), also available as `i18n-micro <command> --help`

This package replaces `nuxt-i18n-micro-cli`. The [guide](https://s00d.github.io/nuxt-i18n-micro/guide/cli#moving-from-nuxt-i18n-micro-cli) maps the old commands to the new ones.

## License

MIT
