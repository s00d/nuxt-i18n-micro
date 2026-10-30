---
title: '@i18n-micro/hmr'
description: 'Exported API of @i18n-micro/hmr, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/hmr`

12 exports across 3 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/hmr/cache-keys`

```ts
import { /* … */ } from '@i18n-micro/hmr/cache-keys'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `SERVER_CC_KEY` | const | `typeof SERVER_CC_KEY` |
| `STORAGE_CC_KEY` | const | `typeof STORAGE_CC_KEY` |


## `@i18n-micro/hmr/generate-plugin`

```ts
import { /* … */ } from '@i18n-micro/hmr/generate-plugin'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `generateHmrPlugin` | function | `(files: string[], options?: GenerateHmrPluginOptions) => string` |
| `GenerateHmrPluginOptions` | interface | 1 members |

<details>
<summary><code>GenerateHmrPluginOptions</code> — 1 members</summary>

| Member | Type |
| --- | --- |
| `additionalRootFiles?` | `string[] \| undefined` |

</details>
## `@i18n-micro/hmr/watcher`

```ts
import { /* … */ } from '@i18n-micro/hmr/watcher'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `createTranslationDirReader` | function | `(translationsRoot: string \| string[], additionalRoots?: string[]) => (relativeFilePath: string) => Record<string, unknown>` |
| `DevTranslationMergeInput` | interface | 6 members |
| `handleTranslationWatchChange` | function | `(input: HandleTranslationWatchChangeInput) => Promise<"page" \| "root" \| "ignored">` |
| `HandleTranslationWatchChangeInput` | interface | 7 members |
| `mergeDevTranslations` | function | `(input: DevTranslationMergeInput) => Promise<Record<string, unknown>>` |
| `readTranslationFile` | function | `(filePath: string) => Record<string, unknown>` |
| `resolveLiveTranslationDirs` | function | `(input: { rootDirs: string[]; translationDir: string; additionalTranslationDirs?: string[]; }) => { translationRoots: string[]; additionalRoots: string[]; }` |
| `TranslationContentTracker` | class | 3 members |

<details>
<summary><code>DevTranslationMergeInput</code> — 6 members</summary>

| Member | Type |
| --- | --- |
| `disablePageLocales?` | `boolean \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `locale` | `string` |
| `locales?` | `(string \| Locale)[] \| undefined` |
| `pageName` | `string` |
| `readLocaleFile` | `(relativePath: string) => Record<string, unknown> \| Promise<Record<string, unknown>>` |

</details>

<details>
<summary><code>HandleTranslationWatchChangeInput</code> — 7 members</summary>

| Member | Type |
| --- | --- |
| `configuredLocales` | `Set<string>` |
| `listPageNames` | `() => string[]` |
| `mergeInput` | `Omit<DevTranslationMergeInput, "locale" \| "pageName">` |
| `relativePath` | `string` |
| `routesLocaleLinks?` | `Record<string, string> \| undefined` |
| `serverCache` | `TranslationWatchCache` |
| `storageCache?` | `TranslationWatchCache \| null \| undefined` |

</details>

<details>
<summary><code>TranslationContentTracker</code> — 3 members</summary>

| Member | Type |
| --- | --- |
| `forget` | `(filePath: string) => void` |
| `hashes` | `private Map<string, string>` |
| `shouldProcess` | `(filePath: string) => boolean` |

</details>

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
