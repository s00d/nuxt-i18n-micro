<script setup lang="ts">
/**
 * Signature, parameters and description of one documented symbol — a composable or an
 * injected helper — read from the generated reference data.
 */
import { computed } from 'vue'
import { data } from '../../../api/reference.data'

const props = defineProps<{
  /** Symbol name, e.g. `useI18n` or `$tc`. */
  name: string
  /** Where to look: a composable module, or the injected helpers. */
  from?: 'composables' | 'methods'
  /** Hide the `@example` blocks from the source. An opt-out: Vue casts an absent boolean prop to `false`. */
  hideExamples?: boolean
}>()

const symbol = computed(() => {
  if (props.from === 'methods') return data.methods.find((entry) => entry.name === props.name)
  const fromComposables = data.composables.flatMap((module) => module.symbols).find((entry) => entry.name === props.name)
  return fromComposables ?? data.methods.find((entry) => entry.name === props.name)
})
</script>

<template>
  <div v-if="symbol" class="symbol-doc">
    <div class="language-ts vp-adaptive-theme"><pre><code>{{ symbol.signature }}</code></pre></div>

    <p v-if="symbol.deprecated"><strong>Deprecated</strong> — {{ symbol.deprecated }}</p>
    <p v-if="symbol.description" style="white-space: pre-line">{{ symbol.description }}</p>

    <table v-if="symbol.params.length">
      <thead>
        <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr v-for="param in symbol.params" :key="param.name">
          <td><code>{{ param.name }}</code><span v-if="param.optional"> <em>(optional)</em></span></td>
          <td><code>{{ param.type }}</code></td>
          <td>{{ param.description }}</td>
        </tr>
      </tbody>
    </table>

    <p v-if="symbol.returns"><strong>Returns</strong> — {{ symbol.returns }}</p>

    <template v-if="!hideExamples">
      <div v-for="(example, index) in symbol.examples" :key="index" class="language-ts vp-adaptive-theme">
        <pre><code>{{ example.replace(/^```\w*\n?|```$/g, '').trim() }}</code></pre>
      </div>
    </template>
  </div>
  <p v-else><em>No reference data for <code>{{ name }}</code>. Run <code>pnpm run docs:data</code>.</em></p>
</template>

<style scoped>
.symbol-doc { margin-bottom: 1.5rem; }
</style>
