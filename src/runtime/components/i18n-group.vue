<template>
  <div :class="['i18n-group', groupClass]">
    <!-- @slot Receives `prefix` and a `t` function scoped to it. -->
    <slot :prefix="prefix" :t="translate" />
  </div>
</template>

<script setup>
import { useNuxtApp, useRoute } from '#imports'

/**
 * Scopes a block of markup to one translation prefix, so nested keys are written
 * relative to it instead of repeating the prefix on every `$t` call.
 */
defineOptions({ name: 'I18nGroup' })

const props = defineProps({
  /** Key prefix every lookup inside the slot is resolved against. */
  prefix: { type: String, required: true },
  /** Extra class on the wrapper element. */
  groupClass: { type: String, default: '' },
})

const { $_t } = useNuxtApp()
const route = useRoute()
const $t = $_t(route)

const translate = (key, params = {}) => $t(`${props.prefix}.${key}`, params)
</script>
