# @i18n-micro/types

TypeScript definitions for the **nuxt-i18n-micro** ecosystem (`Locale`, module options, routing types, translation keys, etc.).

## Install

```bash
pnpm add @i18n-micro/types
```

## Usage

Augment interfaces (for example `Locale`) from this package in your own `.d.ts` files so custom locale fields stay type-safe across the module and composables.

```typescript
import type { Locale, Strategies } from "@i18n-micro/types";

const locales: Locale[] = [
  { code: "en", iso: "en-US", dir: "ltr" },
  { code: "de", iso: "de-DE", dir: "ltr" },
];

const strategy: Strategies = "prefix_except_default";
```

## Documentation

- **[Project docs](https://s00d.github.io/nuxt-i18n-micro/)**
- **Repository**: [github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)

## License

MIT
