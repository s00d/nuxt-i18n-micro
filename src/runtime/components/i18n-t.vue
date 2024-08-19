<template>
  <component
    :is="tag"
    v-if="!hideIfEmpty || translation"
  >
    <slot
      v-if="!html"
      :translation="translation"
    >
      {{ translation }}
    </slot>
    <span
      v-else
      v-html="translation"
    />
  </component>
</template>

<script lang="ts" setup>
import { computed, defineProps, withDefaults } from 'vue'
import { useNuxtApp } from '#app'

interface Props {
  keypath: string
  plural?: number | null
  tag?: string
  scope?: string
  params?: Record<string, string | number | boolean>
  defaultValue?: string
  html?: boolean
  locale?: string
  wrap?: boolean
  customPluralRule?: (value: string, count: number, locale: string) => string
  hideIfEmpty?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  plural: null,
  tag: 'span',
  scope: 'global',
  params: () => ({}),
  defaultValue: '',
  html: false,
  locale: undefined,
  wrap: true,
  hideIfEmpty: false,
})

const nuxtApp = useNuxtApp()

const translation = computed<string>(() => {
  const localeToUse = props.locale || nuxtApp.$getLocale()
  const translation = props.plural !== null
    ? props.customPluralRule
      ? props.customPluralRule(nuxtApp.$t(props.keypath, props.params), props.plural, localeToUse)
      : nuxtApp.$tc(props.keypath, props.plural)
    : nuxtApp.$t(props.keypath, props.params) as string

  return translation || props.defaultValue || props.keypath
})
</script>
