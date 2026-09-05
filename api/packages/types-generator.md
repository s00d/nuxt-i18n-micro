---
url: 'https://s00d.github.io/nuxt-i18n-micro/api/packages/types-generator.md'
description: 'Exported API of @i18n-micro/types-generator, generated from the source.'
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
| `I18nTypesPlugin` | const | `import("unplugin/dist/index").UnpluginInstance<GeneratorOptions, boolean>` |

| Member | Type |
| --- | --- |
| `outputFile?` | `string \| undefined` |
| `srcDir` | `string` |
| `translationDir` | `string` |

```ts
import { /* … */ } from '@i18n-micro/types-generator/nuxt'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `default` | value | `import("@nuxt/schema/dist/index").NuxtModule<I18nTypesGeneratorOptions, I18nTypesGeneratorOptions, false>` |
| `I18nTypesGeneratorOptions` | interface | 2 members |

| Member | Type |
| --- | --- |
| `outputFile?` | `string \| undefined` |
| `translationDir?` | `string \| undefined` |

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
