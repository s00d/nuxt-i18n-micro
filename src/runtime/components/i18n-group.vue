<template>
  <div :class="['i18n-group', groupClass]">
    <slot
      :prefix="prefix"
      :t="translate"
    />
  </div>
</template>

<script setup>
import { useI18n } from '../composables/useI18n'

const props = defineProps({
  prefix: { type: String, required: true },
  groupClass: { type: String, default: '' },
})

const { t } = useI18n()
const translate = (key, params = {}) => t(`${props.prefix}.${key}`, params)
</script>
