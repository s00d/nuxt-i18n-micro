---
title: 'Package APIs'
description: 'The exported API of every workspace package, read at build time from the snapshots CI checks against the source.'
outline: 'deep'
---

<script setup>
import { data } from './packages.data.ts'
</script>

# Package APIs

`nuxt-i18n-micro` is built from a set of small packages, most of which are usable on
their own — `@i18n-micro/vue` in a plain Vue app, `@i18n-micro/core` anywhere.

These pages are built from the API snapshots in `scripts/api-surface/`, the same files
`pnpm run api:surface` compares against the TypeScript sources on every run. An export
cannot disappear from a package without either this reference changing or CI failing.

<table>
  <thead>
    <tr><th>Package</th><th>Entry points</th><th>Exports</th></tr>
  </thead>
  <tbody>
    <tr v-for="pkg in data.packages" :key="pkg.name">
      <td><a :href="`/api/packages/${pkg.slug}`"><code>{{ pkg.name }}</code></a></td>
      <td>{{ pkg.entryPoints.map((entry) => entry.specifier).join(', ') }}</td>
      <td>{{ pkg.exportCount }}</td>
    </tr>
  </tbody>
</table>

## See also

- [Integrations](/integrations/) — guides for using these packages in each framework
- [Module Options](/api/module-options) — options accepted by the Nuxt module
- [Methods](/api/methods) — the runtime helpers available inside components
