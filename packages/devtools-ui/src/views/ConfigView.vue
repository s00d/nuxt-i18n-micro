<template>
  <div class="scroll-thin h-full overflow-auto">
    <Loader v-if="isLoading" />

    <div v-else class="mx-auto max-w-[90rem] space-y-4 p-4">
      <div class="grid gap-4 lg:grid-cols-2">
        <Card title="General" icon="settings">
          <dl class="divide-y divide-line text-sm">
            <div v-for="row in general" :key="row.label" class="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0">
              <dt class="text-muted">{{ row.label }}</dt>
              <dd class="text-right text-highlighted">
                <Badge v-if="typeof row.value === 'boolean'" :color="row.value ? 'primary' : 'neutral'" dot>{{
                  row.value ? 'Enabled' : 'Disabled'
                }}</Badge>
                <code v-else-if="row.value" class="code">{{ row.value }}</code>
                <span v-else class="text-dimmed">—</span>
              </dd>
            </div>
          </dl>
        </Card>

        <Card title="Advanced" icon="server">
          <dl class="divide-y divide-line text-sm">
            <div v-for="row in advanced" :key="row.label" class="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0">
              <dt class="shrink-0 text-muted">{{ row.label }}</dt>
              <dd class="min-w-0 truncate text-right text-highlighted">
                <Badge v-if="typeof row.value === 'boolean'" :color="row.value ? 'primary' : 'neutral'" dot>{{
                  row.value ? 'Enabled' : 'Disabled'
                }}</Badge>
                <code v-else-if="row.value" class="code" :title="row.value">{{ row.value }}</code>
                <span v-else class="text-dimmed">—</span>
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card title="Locales" icon="globe" :description="`${configs.locales?.length ?? 0} configured`" flush>
        <LocaleTable :locales="configs.locales || []" :default-locale="configs.defaultLocale" />
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LocaleTable from '../components/data/LocaleTable.vue'
import Badge from '../components/ui/Badge.vue'
import Card from '../components/ui/Card.vue'
import Loader from '../components/ui/Loader.vue'
import { useI18nState } from '../composables/useI18nState'

const { isLoading, configs } = useI18nState()

interface Row {
  label: string
  value: string | boolean | undefined
}

const text = (value: unknown) => (value === null || value === undefined || value === '' ? undefined : String(value))

const general = computed<Row[]>(() => [
  { label: 'Default locale', value: text(configs.value.defaultLocale) },
  { label: 'Routing strategy', value: text(configs.value.strategy) },
  { label: 'Fallback locale', value: text(configs.value.fallbackLocale) },
  { label: 'Debug mode', value: !!configs.value.debug },
])

const advanced = computed<Row[]>(() => [
  { label: 'Auto language detection', value: !!configs.value.autoDetectLanguage },
  { label: 'Translation directory', value: text(configs.value.translationDir) },
  { label: 'API base URL', value: text(configs.value.apiBaseUrl) },
  { label: 'Locale cookie', value: text(configs.value.localeCookie) },
])
</script>
