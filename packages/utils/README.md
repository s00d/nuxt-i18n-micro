# @i18n-micro/utils

Framework-agnostic utilities for Nuxt I18n Micro. Import only what you need:

```ts
import { deepMergeTranslations } from '@i18n-micro/utils/deep-merge'
import { mergeSourceTranslations } from '@i18n-micro/utils/merge-source'
import { resolveI18nConfigWithRuntimeOverrides } from '@i18n-micro/utils/runtime-config'
import { mergeI18nHead } from '@i18n-micro/utils/merge-i18n-head'
```

`mergeI18nHead` merges `useLocaleHead` output with page-level overrides (`I18nHeadInput`). Used by the `02.meta` plugin; import it directly for custom tooling or unit tests that need the same merge rules (replace hreflang/canonical/og, disable groups, append meta/link).

No Vue, Nuxt, or Nitro dependencies, and no runtime dependency besides `@i18n-micro/types`. Build-time code (premerge, payload stats) lives in the Nuxt module. `sideEffects: false` for tree-shaking friendly bundlers.
