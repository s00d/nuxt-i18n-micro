<script setup lang="ts">
/**
 * Every injected helper in one table, from the generated reference data — the index for
 * the per-method sections below it.
 */
import { computed } from 'vue'
import { data } from '../../../api/reference.data'

const props = defineProps<{
  /** Only helpers whose name matches, e.g. `^\$t` for the translation family. */
  filter?: string
}>()

const methods = computed(() => {
  const pattern = props.filter ? new RegExp(props.filter) : null
  return data.methods.filter((method) => !pattern || pattern.test(method.name))
})

/** First sentence only: the table is an index, the sections below carry the detail. */
const summarise = (text: string): string => text.split(/\.\s|\.$/)[0]?.replace(/\n/g, ' ') ?? ''
</script>

<template>
  <table>
    <thead>
      <tr><th>Helper</th><th>Signature</th><th>Purpose</th></tr>
    </thead>
    <tbody>
      <tr v-for="method in methods" :key="method.name">
        <td><a :href="`#${method.name.replace('$', '').toLowerCase()}`"><code>{{ method.name }}</code></a></td>
        <td><code>{{ method.signature }}</code></td>
        <td>{{ summarise(method.description) }}</td>
      </tr>
    </tbody>
  </table>
</template>
