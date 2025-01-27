<template>
  <div
    class="h-screen overflow-auto"
  >
    <!-- Вкладки -->
    <Tabs
      v-model="activeTab"
      :tabs="tabs"
    />

    <!-- Основной контент -->
    <I18nView v-if="activeTab === 'i18n'" />
    <SettingsView v-if="activeTab === 'settings'" />
    <ConfigView v-if="activeTab === 'config'" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
import Tabs from './components/Tabs.vue'
import I18nView from './views/I18nView.vue'
import SettingsView from './views/SettingsView.vue'
import ConfigView from './views/ConfigView.vue'
import { type LocaleData, RPC_NAMESPACE } from './types'
import { useI18nStore } from './stores/useI18nStore'

const {
  isLoading,
  locales,
  configs,
  selectedLocale,
  selectedFile,
  selectedFileContent,
} = useI18nStore()

const activeTab = ref('i18n') // По умолчанию активна вкладка i18n

const tabs = [
  { label: 'i18n', value: 'i18n' },
  { label: 'Settings', value: 'settings' },
  { label: 'Server Info', value: 'config' },
]

onDevtoolsClientConnected(async (client) => {
  const rpc = client.devtools.extendClientRpc(RPC_NAMESPACE, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    localesUpdated(updatedLocales: LocaleData[]) {
      locales.value = updatedLocales
    },
  })

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  locales.value = await rpc.getLocalesAndTranslations()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  configs.value = await rpc.getConfigs()
  isLoading.value = false

  watch(selectedFileContent, (newContent, oldValue) => {
    if (!oldValue) return
    if (selectedLocale.value && selectedFile.value && newContent) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      rpc.saveTranslationContent(selectedLocale.value, selectedFile.value, newContent)
    }
  }, { deep: true })
})
</script>
