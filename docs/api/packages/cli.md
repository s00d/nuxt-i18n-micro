---
title: '@i18n-micro/cli'
description: 'Exported API of @i18n-micro/cli, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/cli`

6 exports across 1 entry point.
Generated from the API snapshot that [`pnpm run api:surface`](/contributing/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/cli`

```ts
import { /* … */ } from '@i18n-micro/cli'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `ArgSpec` | interface | 8 members |
| `COMMAND_GROUPS` | const | `readonly ["Setup and diagnostics", "Translation workflow", "Refactoring", "Import and export", "Backup and planning"]` |
| `CommandGroup` | type | `(typeof COMMAND_GROUPS)[number]` |
| `commands` | const | `Record<string, CommandSpec>` |
| `CommandSpec` | interface | 5 members |
| `runCli` | function | `(rawArgs: string[]) => Promise<void>` |

<details>
<summary><code>ArgSpec</code> — 8 members</summary>

| Member | Type |
| --- | --- |
| `alias?` | `string \| undefined` |
| `default?` | `string \| boolean \| undefined` |
| `defaultHint?` | `string \| undefined` |
| `description` | `string` |
| `numeric?` | `"number" \| "int" \| undefined` |
| `required?` | `boolean \| undefined` |
| `type` | `"string" \| "boolean" \| "positional"` |
| `values?` | `readonly string[] \| undefined` |

</details>

<details>
<summary><code>CommandSpec</code> — 5 members</summary>

| Member | Type |
| --- | --- |
| `args` | `Record<string, ArgSpec>` |
| `description` | `string` |
| `examples?` | `string[] \| undefined` |
| `group` | `"Setup and diagnostics" \| "Translation workflow" \| "Refactoring" \| "Import and export" \| "Backup and planning"` |
| `load` | `() => Promise<{ default: CommandHandler; }>` |

</details>

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
