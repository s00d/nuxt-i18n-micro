# @i18n-micro/cli

Command-line tools for [nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro): find the keys your code uses, keep locales in sync, translate missing strings, and exchange files with translation platforms.

```bash
npm install -D @i18n-micro/cli
npx i18n-micro extract
npx i18n-micro sync
I18N_TRANSLATE_TOKEN=... npx i18n-micro translate --service deepl
npx i18n-micro validate
```

It runs inside a Nuxt project and reads `locales`, `defaultLocale`, `translationDir` and layers from `nuxt.config` through the project's own Nuxt. Requires Node.js 20 or newer.

- [Guide](https://s00d.github.io/nuxt-i18n-micro/guide/cli)
- [All commands and flags](https://s00d.github.io/nuxt-i18n-micro/api/cli), also available as `i18n-micro <command> --help`

This package replaces `nuxt-i18n-micro-cli`. The [guide](https://s00d.github.io/nuxt-i18n-micro/guide/cli#moving-from-nuxt-i18n-micro-cli) lists what changed.

## License

MIT
