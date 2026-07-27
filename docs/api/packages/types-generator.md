---
title: '@i18n-micro/types-generator'
description: 'Exported API of @i18n-micro/types-generator, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/types-generator`

7 exports across 2 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/types-generator`

```ts
import { /* … */ } from '@i18n-micro/types-generator'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `flattenKeys` | function | `(obj: Record<string, unknown>, prefix?: string) => string[]` |
| `generateTypes` | function | `(options: GeneratorOptions) => Promise<string>` |
| `GeneratorOptions` | interface | 3 members |
| `getTypesString` | function | `(options: GeneratorOptions) => Promise<string>` |
| `I18nTypesPlugin` | const | `import("/Users/s00d/packeges/nuxt-i18n-next/node_modules/.pnpm/unplugin@1.16.1/node_modules/unplugin/dist/index").UnpluginInstance<GeneratorOptions, boolean>` |

<details>
<summary><code>GeneratorOptions</code> — 3 members</summary>

| Member | Type |
| --- | --- |
| `outputFile?` | `string \| undefined` |
| `srcDir` | `string` |
| `translationDir` | `string` |

</details>
## `@i18n-micro/types-generator/nuxt`

```ts
import { /* … */ } from '@i18n-micro/types-generator/nuxt'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `default` | value | `import("/Users/s00d/packeges/nuxt-i18n-next/node_modules/.pnpm/@nuxt+schema@4.5.0/node_modules/@nuxt/schema/dist/index").NuxtModule<I18nTypesGeneratorOptions, I18nTypesGeneratorOptions, false>` |
| `I18nTypesGeneratorOptions` | interface | 2 members |

<details>
<summary><code>I18nTypesGeneratorOptions</code> — 2 members</summary>

| Member | Type |
| --- | --- |
| `outputFile?` | `string \| undefined` |
| `translationDir?` | `string \| undefined` |

</details>

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
