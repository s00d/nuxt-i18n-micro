<template>
  <div class="i18n-devtools">
    <!-- Показываем лоадер, пока нет данных ИЛИ пока bridge не передан -->
    <Loader v-if="isLoading" />

    <template v-else>
      <div class="header">
        <Tabs
          v-model="activeTab"
          :tabs="tabs"
        />
      </div>
      <div class="content-area">
        <div class="view-container">
          <I18nView v-if="activeTab === 'i18n'" />
          <SettingsView v-if="activeTab === 'settings'" />
          <ConfigView v-if="activeTab === 'config'" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, type PropType, provide, ref, watch } from 'vue'
import type { I18nDevToolsBridge } from './bridge/interface'
import GlobeIcon from './components/ui/icons/GlobeIcon.vue'
import ServerIcon from './components/ui/icons/ServerIcon.vue'
import SettingsIcon from './components/ui/icons/SettingsIcon.vue'
import Loader from './components/ui/Loader.vue'
import Tabs from './components/ui/Tabs.vue'
import { createI18nState, I18N_STATE_KEY } from './composables/useI18nState'
import ConfigView from './views/ConfigView.vue'
import I18nView from './views/I18nView.vue'
import SettingsView from './views/SettingsView.vue'

// Bridge приходит как проп, потому что мы передали его через .bridge в h()
const props = defineProps({
  bridge: {
    type: Object as PropType<I18nDevToolsBridge>,
    required: false,
  },
})

// Создаем стейт
const state = createI18nState()
provide(I18N_STATE_KEY, state)

const activeTab = ref('i18n')
const tabs = [
  { label: 'i18n', value: 'i18n', icon: GlobeIcon },
  { label: 'Settings', value: 'settings', icon: SettingsIcon },
  { label: 'Server Info', value: 'config', icon: ServerIcon },
]

// Логика инициализации упрощена
// Мы просто следим за пропсом bridge. Как только он появится, инициализируем стейт.
const initBridge = async (bridgeInstance: I18nDevToolsBridge) => {
  if (state.bridge.value) return // Уже инициализирован

  console.log('[i18n-devtools] Bridge received, initializing...')
  state.setBridge(bridgeInstance)
  await state.init()
}

// Следим за изменениями пропса (на случай асинхронной передачи)
watch(
  () => props.bridge,
  (newBridge) => {
    if (newBridge) {
      initBridge(newBridge)
    }
  },
  { immediate: true },
)

// Вычисляемое свойство для лоадера
// Показываем лоадер если стейт грузится ИЛИ если bridge еще не получен
const isLoading = computed(() => {
  return state.isLoading.value || !state.bridge.value
})

// Fallback: иногда в Custom Elements пропсы приходят не сразу.
// Если watch не сработал сразу, проверим при маунте.
onMounted(() => {
  // Проверяем, есть ли bridge в props
  if (props.bridge) {
    initBridge(props.bridge)
  } else {
    console.log('[i18n-devtools] Waiting for bridge...')
  }
})
</script>

<style>
@import './styles/main.css';

:host {
  display: block;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.i18n-devtools {
  @apply antialiased text-slate-700 bg-white flex flex-col w-full h-full overflow-hidden;
}

.header {
  @apply shrink-0 border-b border-slate-200 bg-white z-20 relative;
}

.content-area {
  @apply flex-1 relative w-full h-full overflow-hidden;
}

.view-container {
  @apply absolute inset-0 w-full h-full overflow-hidden;
}
</style>
