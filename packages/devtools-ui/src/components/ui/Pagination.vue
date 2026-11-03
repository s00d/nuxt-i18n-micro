<template>
  <nav class="flex items-center gap-1" aria-label="Pagination">
    <Button
      variant="ghost"
      size="sm"
      square
      icon="chevron-left"
      title="Previous page"
      aria-label="Previous page"
      :disabled="currentPage <= 1"
      @click="goToPage(currentPage - 1)"
    />
    <template v-for="(page, i) in pages" :key="i">
      <span v-if="page === 0" class="px-1 text-xs text-dimmed">…</span>
      <Button
        v-else
        :variant="page === currentPage ? 'primary' : 'ghost'"
        size="sm"
        class="min-w-7"
        :aria-current="page === currentPage ? 'page' : undefined"
        @click="goToPage(page)"
      >
        {{ page }}
      </Button>
    </template>
    <Button
      variant="ghost"
      size="sm"
      square
      icon="chevron-right"
      title="Next page"
      aria-label="Next page"
      :disabled="currentPage >= totalPages"
      @click="goToPage(currentPage + 1)"
    />
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from './Button.vue'

const props = defineProps<{ currentPage: number; totalPages: number }>()
const emit = defineEmits<{ 'update:page': [page: number] }>()

/** First, last and two around the current page; `0` marks a gap. */
const pages = computed(() => {
  const shown = [
    ...new Set([
      1,
      2,
      props.currentPage - 2,
      props.currentPage - 1,
      props.currentPage,
      props.currentPage + 1,
      props.currentPage + 2,
      props.totalPages - 1,
      props.totalPages,
    ]),
  ]
    .filter((page) => page >= 1 && page <= props.totalPages)
    .sort((a, b) => a - b)
  return shown.flatMap((page, i) => (i > 0 && page - shown[i - 1]! > 1 ? [0, page] : [page]))
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) emit('update:page', page)
}
</script>
