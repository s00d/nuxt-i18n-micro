<template>
  <div
    class="h-screen overflow-auto p-6"
    style="padding-top: 70px"
  >
    <Loader v-if="isLoading" />

    <div
      v-else
      class="space-y-6"
    >
      <!-- General Settings Card -->
      <NCard>
        <div class="settings-group p-6">
          <div class="group-header">
            <span class="icon">⚙️</span>
            <h3 class="group-title">
              General Configuration
            </h3>
          </div>
          <div class="settings-grid">
            <div class="config-row">
              <span class="config-label">Default Locale</span>
              <span class="config-value">{{ configs.defaultLocale || '—' }}</span>
            </div>
            <div class="config-row">
              <span class="config-label">Routing Strategy</span>
              <span class="config-value capitalize">{{ configs.strategy || '—' }}</span>
            </div>
            <div class="config-row">
              <span class="config-label">Fallback Locale</span>
              <span class="config-value">{{ configs.fallbackLocale || '—' }}</span>
            </div>
            <div class="config-row">
              <span class="config-label">Debug Mode</span>
              <span
                class="config-value"
                :class="configs.debug ? 'text-green-600' : 'text-red-600'"
              >
                {{ configs.debug ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>
      </NCard>

      <!-- Locales Table Card -->
      <NCard class="!rounded-xl shadow-lg !border-0">
        <div class="settings-group p-6">
          <div class="group-header">
            <span class="icon">🌍</span>
            <h3 class="group-title">
              Configured Locales
            </h3>
          </div>
          <div class="locale-table-container">
            <table class="modern-table">
              <thead>
                <tr>
                  <th
                    v-for="header in localeHeaders"
                    :key="header.key"
                  >
                    {{ header.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="locale in configs.locales"
                  :key="locale.code"
                  class="hover-highlight"
                >
                  <td>
                    <span class="locale-code">{{ locale.code }}</span>
                  </td>
                  <td>{{ locale.displayName || '—' }}</td>
                  <td>{{ locale.iso || '—' }}</td>
                  <td>
                    <span
                      class="dir-indicator"
                      :data-dir="locale.dir || 'ltr'"
                    >
                      {{ locale.dir?.toUpperCase() || 'LTR' }}
                    </span>
                  </td>
                  <td>{{ locale.baseUrl || '—' }}</td>
                  <td>
                    <span
                      class="status-pill"
                      :class="locale.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
                    >
                      {{ locale.disabled ? 'Disabled' : 'Active' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </NCard>

      <!-- Advanced Settings Card -->
      <NCard class="!rounded-xl shadow-lg !border-0">
        <div class="settings-group p-6">
          <div class="group-header">
            <span class="icon">🔧</span>
            <h3 class="group-title">
              Advanced Configuration
            </h3>
          </div>
          <div class="settings-grid">
            <div class="config-row">
              <span class="config-label">Auto Language Detection</span>
              <span class="config-value">
                <span
                  class="status-dot"
                  :class="configs.autoDetectLanguage ? 'bg-green-500' : 'bg-red-500'"
                />
                {{ configs.autoDetectLanguage ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
            <div class="config-row">
              <span class="config-label">Translation Directory</span>
              <span class="config-value font-mono text-sm">
                {{ configs.translationDir || '—' }}
              </span>
            </div>
            <div class="config-row">
              <span class="config-label">API Base URL</span>
              <span class="config-value font-mono text-sm text-blue-600">
                {{ configs.apiBaseUrl || '—' }}
              </span>
            </div>
            <div class="config-row">
              <span class="config-label">Locale Cookie</span>
              <span class="config-value font-mono text-sm">
                {{ configs.localeCookie || '—' }}
              </span>
            </div>
          </div>
        </div>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18nStore } from '../stores/useI18nStore'
import Loader from '../components/Loader.vue'

const {
  isLoading,
  configs,
} = useI18nStore()

const localeHeaders = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Display Name' },
  { key: 'iso', label: 'ISO Code' },
  { key: 'dir', label: 'Direction' },
  { key: 'baseUrl', label: 'Base URL' },
  { key: 'status', label: 'Status' },
]
</script>

<style scoped>
.settings-group {
  @apply space-y-4;
}

.group-header {
  @apply flex items-center mb-4 pb-4 border-b border-gray-100;
}

.icon {
  @apply text-2xl mr-3;
}

.group-title {
  @apply text-xl font-semibold text-gray-800;
}

.settings-grid {
  @apply grid gap-4;
}

.config-row {
  @apply flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors;
}

.config-label {
  @apply text-sm font-medium text-gray-600;
}

.config-value {
  @apply text-sm text-gray-800;
}

.modern-table {
  @apply w-full border-collapse;
}

.modern-table th {
  @apply px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-50;
}

.modern-table td {
  @apply px-4 py-3 text-sm text-gray-600 border-t border-gray-100;
}

.hover-highlight:hover {
  @apply bg-gray-50;
}

.locale-code {
  @apply font-mono text-sm px-2 py-1 bg-blue-50 text-blue-700 rounded;
}

.dir-indicator {
  @apply inline-block px-2 py-1 rounded-full text-xs font-medium;
}

.dir-indicator[data-dir="ltr"] {
  @apply bg-purple-100 text-purple-800;
}

.dir-indicator[data-dir="rtl"] {
  @apply bg-orange-100 text-orange-800;
}

.status-pill {
  @apply px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.status-dot {
  @apply inline-block w-2 h-2 rounded-full mr-2;
}

.locale-table-container {
  @apply border rounded-lg overflow-hidden shadow-sm;
}
</style>
