<template>
  <div class="scroll-thin overflow-x-auto">
    <table class="w-full border-collapse text-sm">
      <thead class="bg-elevated/60">
        <tr>
          <th
            v-for="header in HEADERS"
            :key="header"
            class="border-b border-line px-3 py-2 text-left font-semibold whitespace-nowrap text-highlighted"
          >
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="locale in locales" :key="locale.code" class="border-b border-line last:border-b-0 hover:bg-subtle">
          <td class="px-3 py-2">
            <code class="code">{{ locale.code }}</code>
            <Badge v-if="locale.code === defaultLocale" color="primary" class="ml-1.5">default</Badge>
          </td>
          <td class="px-3 py-2 text-highlighted">{{ locale.displayName || '—' }}</td>
          <td class="px-3 py-2">
            <code v-if="locale.iso" class="code">{{ locale.iso }}</code>
            <span v-else class="text-dimmed">—</span>
          </td>
          <td class="px-3 py-2">
            <Badge :color="locale.dir === 'rtl' ? 'info' : 'neutral'">{{ (locale.dir || 'ltr').toUpperCase() }}</Badge>
          </td>
          <td class="px-3 py-2 font-mono text-xs text-muted">{{ locale.baseUrl || '—' }}</td>
          <td class="px-3 py-2">
            <Badge :color="locale.disabled ? 'error' : 'primary'" dot>{{ locale.disabled ? 'Disabled' : 'Active' }}</Badge>
          </td>
        </tr>
        <tr v-if="!locales.length">
          <td :colspan="HEADERS.length" class="px-3 py-6 text-center text-muted">No locales configured.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import Badge from '../ui/Badge.vue'

interface Locale {
  code: string
  displayName?: string
  iso?: string
  dir?: string
  baseUrl?: string
  disabled?: boolean
}

const HEADERS = ['Code', 'Display name', 'ISO', 'Direction', 'Base URL', 'Status']

defineProps<{
  locales: Locale[]
  defaultLocale?: string
}>()
</script>
