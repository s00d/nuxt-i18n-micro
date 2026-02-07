<template>
  <div class="config-view">
    <Loader v-if="isLoading" />

    <div
      v-else
      class="space-y-6"
    >
      <!-- General Settings Card -->
      <ConfigCard title="General Configuration">
        <template #icon>
          <SettingsIcon />
        </template>
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
            <StatusIndicator
              :status="configs.debug ? 'enabled' : 'disabled'"
              :label="configs.debug ? 'Active' : 'Inactive'"
            />
          </div>
        </div>
      </ConfigCard>

      <!-- Locales Table Card -->
      <ConfigCard title="Configured Locales">
        <template #icon>
          <GlobeIcon />
        </template>
        <LocaleTable :locales="configs.locales || []" />
      </ConfigCard>

      <!-- Advanced Settings Card -->
      <ConfigCard title="Advanced Configuration">
        <template #icon>
          <ServerIcon />
        </template>
        <div class="settings-grid">
          <div class="config-row">
            <span class="config-label">Auto Language Detection</span>
            <StatusIndicator
              :status="configs.autoDetectLanguage ? 'enabled' : 'disabled'"
              :label="configs.autoDetectLanguage ? 'Enabled' : 'Disabled'"
            />
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
      </ConfigCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import ConfigCard from '../components/config/ConfigCard.vue'
import LocaleTable from '../components/data/LocaleTable.vue'
import GlobeIcon from '../components/ui/icons/GlobeIcon.vue'
import ServerIcon from '../components/ui/icons/ServerIcon.vue'
import SettingsIcon from '../components/ui/icons/SettingsIcon.vue'
import Loader from '../components/ui/Loader.vue'
import StatusIndicator from '../components/ui/StatusIndicator.vue'
import { useI18nState } from '../composables/useI18nState'

const { isLoading, configs } = useI18nState()
</script>

<style scoped>
@reference "tailwindcss";

.config-view {
  @apply h-full overflow-auto p-4;
}

.settings-grid {
  @apply grid gap-3;
}

.config-row {
  @apply flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors;
}

.config-label {
  @apply text-sm font-medium text-gray-600;
}

.config-value {
  @apply text-sm text-gray-800;
}
</style>
