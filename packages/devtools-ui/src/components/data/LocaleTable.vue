<template>
  <div class="locale-table-container">
    <div class="locale-table-wrapper">
      <table class="locale-table">
        <thead class="locale-table__header">
          <tr>
            <th
              v-for="header in headers"
              :key="header.key"
              class="locale-table__header-cell"
            >
              <div class="header-content">
                <span class="header-icon">
                  <component
                    :is="header.iconComponent"
                    v-if="header.iconComponent"
                  />
                  <span v-else>{{ header.icon }}</span>
                </span>
                <span class="header-text">{{ header.label }}</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="locale-table__body">
          <tr
            v-for="locale in locales"
            :key="locale.code"
            class="locale-table__row"
          >
            <td class="locale-table__cell">
              <div class="locale-code">
                <span class="locale-code__text">{{ locale.code }}</span>
              </div>
            </td>
            <td class="locale-table__cell">
              <span class="locale-name">{{ locale.displayName || '—' }}</span>
            </td>
            <td class="locale-table__cell">
              <span class="locale-iso">{{ locale.iso || '—' }}</span>
            </td>
            <td class="locale-table__cell">
              <div class="direction-indicator">
                <span
                  class="direction-badge"
                  :class="`direction-badge--${locale.dir || 'ltr'}`"
                >
                  {{ (locale.dir || 'ltr').toUpperCase() }}
                </span>
              </div>
            </td>
            <td class="locale-table__cell">
              <span class="base-url">{{ locale.baseUrl || '—' }}</span>
            </td>
            <td class="locale-table__cell">
              <StatusIndicator
                :status="locale.disabled ? 'disabled' : 'active'"
                :label="locale.disabled ? 'Disabled' : 'Active'"
                size="sm"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import GlobeIcon from '../ui/icons/GlobeIcon.vue'
import StatusIndicator from '../ui/StatusIndicator.vue'

interface Locale {
  code: string
  displayName?: string
  iso?: string
  dir?: string
  baseUrl?: string
  disabled?: boolean
}

interface Header {
  key: string
  label: string
  icon?: string
  iconComponent?: Component
}

defineProps<{
  locales: Locale[]
}>()

const headers: Header[] = [
  { key: 'code', label: 'Code', icon: '🏷️' },
  { key: 'name', label: 'Display Name', icon: '📝' },
  { key: 'iso', label: 'ISO Code', iconComponent: GlobeIcon },
  { key: 'dir', label: 'Direction', icon: '↔️' },
  { key: 'baseUrl', label: 'Base URL', icon: '🔗' },
  { key: 'status', label: 'Status', icon: '⚡' },
]
</script>

<style scoped>
@reference "tailwindcss";

.locale-table-container {
  @apply border rounded-xl overflow-hidden shadow-xs bg-white;
}

.locale-table-wrapper {
  @apply overflow-x-auto;
}

.locale-table {
  @apply w-full border-collapse;
}

.locale-table__header {
  @apply bg-gradient-to-r from-slate-50 to-blue-50;
}

.locale-table__header-cell {
  @apply px-4 py-4 text-left;
}

.header-content {
  @apply flex items-center gap-2;
}

.header-icon {
  @apply text-lg flex items-center;
}

.header-text {
  @apply text-sm font-semibold text-slate-700;
}

.locale-table__row {
  @apply border-t border-slate-100 transition-colors duration-200 hover:bg-slate-50;
}

.locale-table__cell {
  @apply px-4 py-4 text-sm;
}

.locale-code {
  @apply inline-flex items-center;
}

.locale-code__text {
  @apply font-mono text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200;
}

.locale-name {
  @apply text-slate-700 font-medium;
}

.locale-iso {
  @apply text-slate-600 font-mono text-xs px-2 py-1 bg-slate-100 rounded-sm;
}

.direction-indicator {
  @apply flex items-center;
}

.direction-badge {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.direction-badge--ltr {
  @apply bg-purple-100 text-purple-800;
}

.direction-badge--rtl {
  @apply bg-orange-100 text-orange-800;
}

.base-url {
  @apply text-slate-600 font-mono text-xs;
}

/* Анимация строк */
.locale-table__row {
  animation: slideInLeft 0.3s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Задержка анимации для каждой строки */
.locale-table__row:nth-child(1) { animation-delay: 0.1s; }
.locale-table__row:nth-child(2) { animation-delay: 0.2s; }
.locale-table__row:nth-child(3) { animation-delay: 0.3s; }
.locale-table__row:nth-child(4) { animation-delay: 0.4s; }
.locale-table__row:nth-child(5) { animation-delay: 0.5s; }
</style>
