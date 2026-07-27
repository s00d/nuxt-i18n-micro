---
title: 'Module Options Reference'
description: 'Every option the module accepts, with its type, default and purpose — read at build time from the type definition.'
outline: [2, 3]
---

<script setup>
import { data } from './module-options.data.ts'
</script>

# Module Options Reference

Every option `nuxt-i18n-micro` accepts, read at build time from the `ModuleOptions`
interface in
[`{{ data.source }}`](https://github.com/s00d/nuxt-i18n-micro/blob/main/packages/types/src/index.ts).
Nothing here is written by hand, so it cannot fall behind the code — types, defaults and
descriptions come from the declaration itself.

**{{ data.total }} options**<span v-if="data.deprecated">, {{ data.deprecated }} deprecated</span>.

For what these options *mean* together — which combinations make sense, what changes when
you switch strategy, worked examples — read [Configuration](/guide/configuration). This
page is the exhaustive list; that one is the explanation.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'de', iso: 'de-DE', dir: 'ltr' },
    ],
    defaultLocale: 'en',
  },
})
```

Nested options appear under their dotted path, so `translationPayloads.mode` is the
`mode` key inside the `translationPayloads` object.

<div v-for="group in data.groups" :key="group.title">

## {{ group.title }}

<p>{{ group.blurb }}</p>

<table>
  <thead>
    <tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr v-for="option in group.options" :key="option.path">
      <td>
        <code>{{ option.path }}</code>
        <span v-if="!option.optional"> <em>(required)</em></span>
      </td>
      <td><code>{{ option.type }}</code></td>
      <td><code v-if="option.default">{{ option.default }}</code><span v-else>—</span></td>
      <td>
        <strong v-if="option.deprecated">Deprecated — {{ option.deprecated }}. </strong>
        {{ option.description }}
      </td>
    </tr>
  </tbody>
</table>

</div>

## See also

- [Configuration](/guide/configuration) — how these options work together
- [Performance](/guide/performance) — what the payload options change at runtime
- [Package APIs](/api/packages) — the exported API of every workspace package
