# News

## [New CLI Feature: `text-to-i18n`](/guide/cli#🔄-text-to-i18n-command)

**Date**: 2024-12-24

**Version Introduced**: `v1.1.0`

![text-to-i18n Command Demo](/text-to-i18n.gif)

We’re excited to announce the new `text-to-i18n` command in the Nuxt I18n Micro CLI! This powerful feature automates the process of extracting hardcoded text strings from your codebase and converting them into i18n translation keys. It’s designed to save time, reduce errors, and streamline your localization workflow.

### Key Benefits

- **Automated Text Extraction**: Scans Vue templates, JavaScript, and TypeScript files.
- **Seamless Key Generation**: Creates structured translation keys based on file paths and content.
- **Efficient Translation Management**: Updates your translation files while preserving existing entries.

### How It Works

1. **File Scanning**: Processes files in key directories like `pages`, `components`, and `plugins`.
2. **Text Processing**: Identifies and extracts translatable strings, generating unique keys.
3. **Translation Updates**: Automatically inserts new keys into your translation files and maintains their nested structure.

### Usage

```bash
i18n-micro text-to-i18n [options]
```

Example:

```bash
i18n-micro text-to-i18n --translationFile locales/en.json --context auth
```

---

