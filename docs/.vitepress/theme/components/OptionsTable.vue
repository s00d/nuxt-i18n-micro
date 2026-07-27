<script setup lang="ts">
/**
 * Module options as a compact table, read from the generated reference data.
 *
 * The Configuration guide keeps its explanations; the list of what exists comes from the
 * `ModuleOptions` type, so a new option appears here without anyone editing the page.
 */
import { computed } from 'vue'
import { data } from '../../../api/module-options.data'

const props = defineProps<{
  /** Only options whose path matches, e.g. `^meta` for the SEO group. */
  filter?: string
  /** Show the group instead of the purpose. An opt-in: Vue casts an absent boolean prop to `false`. */
  byGroup?: boolean
}>()

const options = computed(() => {
  const all = data.groups.flatMap((group) => group.options.map((option) => ({ ...option, group: group.title })))
  const pattern = props.filter ? new RegExp(props.filter) : null
  return all.filter((option) => !pattern || pattern.test(option.path))
})

/** First sentence: the table is an index, the sections below carry the detail. */
const summarise = (text: string): string => text.split(/\.\s|\.$/)[0]?.replace(/\n/g, ' ') ?? ''
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>Option</th><th>Type</th><th>Default</th>
        <th v-if="byGroup">Group</th>
        <th v-else>Purpose</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="option in options" :key="option.path">
        <td><a :href="`/api/module-options#${option.group.toLowerCase().replace(/[^a-z]+/g, '-')}`"><code>{{ option.path }}</code></a></td>
        <td><code>{{ option.type }}</code></td>
        <td><code v-if="option.default">{{ option.default }}</code><span v-else>—</span></td>
        <td v-if="byGroup">{{ option.group }}</td>
        <td v-else>{{ summarise(option.description) }}</td>
      </tr>
    </tbody>
  </table>
</template>
