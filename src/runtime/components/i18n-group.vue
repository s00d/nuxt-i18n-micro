<template>
  <div :class="['i18n-group', groupClass]">
    <slot
      :prefix="prefix"
      :t="translate"
    />
  </div>
</template>

<script setup>
import { useNuxtApp, useRoute } from '#imports'

const props = defineProps({
  prefix: { type: String, required: true },
  groupClass: { type: String, default: '' },
})

const { $_t } = useNuxtApp()
const route = useRoute()
const $t = $_t(route)

const translate = (key, params = {}) => $t(`${props.prefix}.${key}`, params)
</script>
