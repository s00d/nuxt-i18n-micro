<template>
  <div>
    <NTextInput
      v-model="search"
      placeholder="Search locales..."
      icon="i-heroicons-magnifying-glass"
      class="w-full mb-4"
    />
    <div
      v-for="locale in filteredLocales"
      :key="locale.locale"
    >
      <NButton
        block
        w-full
        truncate
        px2
        py1
        text-start
        text-sm
        font-mono
        :color="locale.locale === selectedLocale ? 'primary' : ''"
        @click="$emit('localeSelected', locale.locale)"
      >
        {{ locale.locale }}
      </NButton>
    </div>

    <div
      v-if="filteredLocales.length === 0"
      class="empty-state"
    >
      <NIcon
        name="i-heroicons-magnifying-glass"
        class="empty-icon"
      />
      <p class="empty-text">
        No locales found for "{{ search }}"
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { LocaleData } from '../types'

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

<style scoped>
.empty-state {
  @apply p-6 text-center text-gray-400;
}

.empty-icon {
  @apply w-8 h-8 mx-auto mb-2;
}

.empty-text {
  @apply text-sm;
}
</style>
