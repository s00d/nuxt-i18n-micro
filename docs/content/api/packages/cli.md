---
title: '@i18n-micro/cli'
description: 'Exported API of @i18n-micro/cli, generated from the source.'
navigation:
  title: 'cli'
---

# `@i18n-micro/cli`

Command-line tools for nuxt-i18n-micro: extract, sync, translate, lint and audit locale files.

```ts
import { … } from '@i18n-micro/cli'
```

## Functions

### `runCli`

Run the CLI. Failures set `process.exitCode`; nothing here throws.

```ts
function runCli(rawArgs: string[]): Promise<void>
```

## Constants

### `COMMAND_GROUPS`

```ts
const COMMAND_GROUPS: readonly ["Inspect", "Translation workflow", "Refactoring", "Exchange"]
```

**See** [`Translation`](/api/packages/types#translation)

### `commands`

```ts
const commands: Record<string, CommandSpec>
```

**See** [`CommandSpec`](#commandspec)

## Types

### `ArgSpec`

The command table: one source of truth for parsing, `--help` and the generated
[command reference](https://s00d.github.io/nuxt-i18n-micro/api/cli).

This file imports nothing, and handlers load on demand, so `--help` stays instant and the
docs generator can read the table without pulling in parsers or vendor drivers.

```ts
interface ArgSpec
```

::field-group
:::field
---
name: "type"
type: "'string' | 'boolean' | 'positional'"
required: true
---

:::
:::field
---
name: "description"
type: "string"
required: true
---

:::
:::field
---
name: "default"
type: "string | boolean"
---

:::
:::field
---
name: "required"
type: "boolean"
---

:::
:::field
---
name: "alias"
type: "string"
---

:::
:::field
---
name: "values"
type: "readonly string[]"
---
Accepted values: anything else is a usage error.
:::
:::field
---
name: "numeric"
type: "'int' | 'number'"
---
Parsed to a number and checked to be positive.
:::
:::field
---
name: "defaultHint"
type: "string"
---
Shown in the docs where a computed default has no literal value.
:::
::

### `CommandGroup`

```ts
type CommandGroup = (typeof COMMAND_GROUPS)[number]
```

**See** [`COMMAND_GROUPS`](#command_groups)

### `CommandSpec`

```ts
interface CommandSpec
```

::field-group
:::field
---
name: "description"
type: "string"
required: true
---

:::
:::field
---
name: "group"
type: "CommandGroup"
required: true
---

:::
:::field
---
name: "args"
type: "Record<string, ArgSpec>"
required: true
---

:::
:::field
---
name: "examples"
type: "string[]"
---

:::
:::field
---
name: "load"
type: "() => Promise<{ default: CommandHandler; }>"
required: true
---

:::
::

---

Generated from the TypeScript sources and their JSDoc by `pnpm run docs:generate`.
Back to [all packages](/api/packages) · [Integration guides](/integrations/)
