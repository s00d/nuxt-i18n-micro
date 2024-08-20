<template>
  <div>
    <NTextInput
      v-model="search"
      placeholder="Search locales..."
      icon="carbon-search"
      class="w-full"
    />
    <div
      v-for="locale in filteredLocales"
      :key="locale.locale"
    >
      <button
        block
        w-full
        truncate
        px2
        py1
        text-start
        text-sm
        font-mono
        :class="locale.locale === selectedLocale ? 'text-primary n-bg-active' : 'text-secondary hover:n-bg-hover'"
        @click="$emit('localeSelected', locale.locale)"
      >
        {{ locale.locale }}
      </button>
      <div x-divider />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'
import type { LocaleData } from '../app.vue'

const props = defineProps<{
  locales: LocaleData[]
  selectedLocale: string
}>()

defineEmits(['localeSelected'])

const search = ref('')

const filteredLocales = computed(() => {
  if (!search.value) return props.locales
  return props.locales.filter(locale => locale.locale.toLowerCase().includes(search.value.toLowerCase()))
})
</script>
