---
url: 'https://s00d.github.io/nuxt-i18n-micro/api/packages/hmr.md'
description: 'Exported API of @i18n-micro/hmr, generated from the source.'
---

# `@i18n-micro/hmr`

8 exports across 3 entry points.
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
| `generateHmrPlugin` | function | `(files: string[]) => string` |

## `@i18n-micro/hmr/watcher`

```ts
import { /* … */ } from '@i18n-micro/hmr/watcher'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `handleTranslationWatchChange` | function | `(input: HandleTranslationWatchChangeInput) => Promise<"page" \| "root" \| "ignored">` |
| `HandleTranslationWatchChangeInput` | interface | 7 members |
| `parseTranslationWatchRelativePath` | function | `(relativePath: string) => ParsedTranslationWatchPath` |
| `readTranslationFile` | function | `(filePath: string) => Record<string, unknown>` |
| `TranslationContentTracker` | class | 3 members |

| Member | Type |
| --- | --- |
| `configuredLocales` | `Set<string>` |
| `listPageNames` | `() => string[]` |
| `mergeInput` | `Omit<DevTranslationMergeInput, "locale" \| "pageName">` |
| `relativePath` | `string` |
| `routesLocaleLinks?` | `Record<string, string> \| undefined` |
| `serverCache` | `TranslationWatchCache` |
| `storageCache?` | `TranslationWatchCache \| null \| undefined` |

| Member | Type |
| --- | --- |
| `forget` | `(filePath: string) => void` |
| `hashes` | `private Map<string, string>` |
| `shouldProcess` | `(filePath: string) => boolean` |

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
