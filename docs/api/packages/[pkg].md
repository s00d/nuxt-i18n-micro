---
title: 'Package API'
outline: [2, 3]
---

# `{{ $params.name }}`

<p>
  {{ $params.exportCount }} exports across
  {{ $params.entryPoints.length }} entry point<span v-if="$params.entryPoints.length !== 1">s</span>.
  Read from <code>scripts/api-surface/</code>, which
  <a href="https://github.com/s00d/nuxt-i18n-micro/blob/main/docs/guide/maintenance-commands.md#api-surface"><code>pnpm run api:surface</code></a>
  checks against the TypeScript sources.
</p>

<div v-for="entry in $params.entryPoints" :key="entry.specifier">

## `{{ entry.specifier }}`

```ts-vue
import { /* … */ } from '{{ entry.specifier }}'
```

<table>
  <thead>
    <tr><th>Export</th><th>Kind</th><th>Signature</th></tr>
  </thead>
  <tbody>
    <tr v-for="item in entry.exports" :key="item.name">
      <td><code>{{ item.name }}</code></td>
      <td>{{ item.kind }}</td>
      <td>
        <code v-if="item.signature">{{ item.signature }}</code>
        <span v-else-if="item.members.length">{{ item.members.length }} members</span>
        <span v-else>—</span>
      </td>
    </tr>
  </tbody>
</table>

<details v-for="item in entry.exports.filter((e) => e.members.length)" :key="`${item.name}-members`">
  <summary><code>{{ item.name }}</code> — {{ item.members.length }} members</summary>
  <table>
    <thead><tr><th>Member</th><th>Type</th></tr></thead>
    <tbody>
      <tr v-for="member in item.members" :key="member.name">
        <td><code>{{ member.name }}</code></td>
        <td><code>{{ member.signature }}</code></td>
      </tr>
    </tbody>
  </table>
</details>

</div>

---

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
