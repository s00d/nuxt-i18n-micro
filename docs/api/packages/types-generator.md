---
title: '@i18n-micro/types-generator'
description: 'Exported API of @i18n-micro/types-generator, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/types-generator`

7 exports across 2 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/contributing/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/types-generator`

```ts
import { /* … */ } from '@i18n-micro/types-generator'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `formatKeyProperty` | function | `(key: string) => string` |
| `generateTypes` | function | `(options: GeneratorOptions) => string` |
| `GeneratorOptions` | interface | 3 members |
| `getTypesString` | function | `(options: GeneratorOptions) => string` |
| `I18nTypesPlugin` | function | `(options: GeneratorOptions) => Plugin` |

<details>
<summary><code>GeneratorOptions</code> — 3 members</summary>

| Member | Type |
| --- | --- |
| `outputFile?` | `string \| undefined` |
| `srcDir` | `string` |
| `translationDir` | `string \| string[]` |

</details>
## `@i18n-micro/types-generator/nuxt`

```ts
import { /* … */ } from '@i18n-micro/types-generator/nuxt'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `default` | value | `import("@nuxt/schema").NuxtModule<I18nTypesGeneratorOptions, I18nTypesGeneratorOptions, false>` |
| `I18nTypesGeneratorOptions` | interface | 1 members |

<details>
<summary><code>I18nTypesGeneratorOptions</code> — 1 members</summary>

| Member | Type |
| --- | --- |
| `translationDir?` | `string \| undefined` |

</details>

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
