<template>
  <div class="pagination">
    <!-- "Previous" button -->
    <button
      :disabled="currentPage === 1"
      class="pagination-button"
      @click="goToPage(currentPage - 1)"
    >
      Previous
    </button>

    <!-- First pages -->
    <template v-if="currentPage > 3">
      <button
        v-for="page in firstPages"
        :key="page"
        class="pagination-button"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
      <span
        v-if="currentPage > 4"
        class="pagination-ellipsis"
      >...</span>
    </template>

    <!-- Current page range -->
    <button
      v-for="page in visiblePages"
      :key="page"
      :class="['pagination-button', { active: currentPage === page }]"
      @click="goToPage(page)"
    >
      {{ page }}
    </button>

    <!-- Last pages -->
    <template v-if="currentPage < totalPages - 2">
      <span
        v-if="currentPage < totalPages - 3"
        class="pagination-ellipsis"
      >...</span>
      <button
        v-for="page in lastPages"
        :key="page"
        class="pagination-button"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
    </template>

    <!-- "Next" button -->
    <button
      :disabled="currentPage === totalPages || totalPages === 0"
      class="pagination-button"
      @click="goToPage(currentPage + 1)"
    >
      Next
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  (event: 'update:page', page: number): void
}>()

// First two pages
const firstPages = computed(() => {
  return [1, 2].filter(page => page <= props.totalPages)
})

// Last two pages
const lastPages = computed(() => {
  return [props.totalPages - 1, props.totalPages].filter(page => page >= 1)
})

// Visible pages around current
const visiblePages = computed(() => {
  const pages = []
  const startPage = Math.max(1, props.currentPage - 2)
  const endPage = Math.min(props.totalPages, props.currentPage + 2)

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  return pages
})

// Navigate to page
const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:page', page)
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.pagination-button {
  padding: 6px 12px;
  min-width: 32px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f8f9fa;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  text-align: center;
  transition: background-color 0.2s, border-color 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #bbb;
}

.pagination-button:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
  color: #999;
}

.pagination-button.active {
  background-color: #007bff;
  border-color: #007bff;
  color: #fff;
}

.pagination-ellipsis {
  padding: 6px 12px;
  font-size: 13px;
  color: #666;
}
</style>
