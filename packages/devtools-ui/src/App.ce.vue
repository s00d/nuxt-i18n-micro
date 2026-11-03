<template>
  <div :class="['i18n-devtools flex h-full w-full flex-col overflow-hidden antialiased', { dark: isDark }]">
    <header class="flex h-12 shrink-0 items-center gap-3 border-b border-line px-3">
      <div class="flex items-center gap-2 pr-1">
        <span class="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon name="languages" /></span>
        <span class="text-sm font-semibold whitespace-nowrap text-highlighted">i18n Micro</span>
      </div>
      <span class="h-5 w-px bg-line" />
      <Tabs v-model="activeTab" :tabs="tabs" />
      <div v-if="!isLoading" class="ml-auto hidden items-center gap-1.5 md:flex">
        <Badge v-if="state.configs.value.defaultLocale" color="primary" title="Default locale"
          >default: {{ state.configs.value.defaultLocale }}</Badge
        >
        <Badge v-if="state.configs.value.strategy" title="Routing strategy">{{ state.configs.value.strategy }}</Badge>
        <Badge title="Configured locales">{{ state.configs.value.locales?.length ?? 0 }} locales</Badge>
        <Badge title="Translation files">{{ Object.keys(state.locales.value).length }} files</Badge>
      </div>
    </header>

    <main class="relative min-h-0 flex-1">
      <!-- Loader while there is no data or no bridge yet -->
      <Loader v-if="isLoading" message="Connecting to the app…" />
      <template v-else>
        <I18nView v-if="activeTab === 'i18n'" />
        <SettingsView v-if="activeTab === 'settings'" />
        <ConfigView v-if="activeTab === 'config'" />
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, type PropType, provide, ref, watch } from 'vue'
import type { I18nDevToolsBridge } from './bridge/interface'
import Badge from './components/ui/Badge.vue'
import Icon from './components/ui/Icon.vue'
import Loader from './components/ui/Loader.vue'
import Tabs from './components/ui/Tabs.vue'
import { createI18nState, I18N_STATE_KEY } from './composables/useI18nState'
import ConfigView from './views/ConfigView.vue'
import I18nView from './views/I18nView.vue'
import SettingsView from './views/SettingsView.vue'

// Bridge comes as a prop because we passed it via .bridge in h()
const props = defineProps({
  bridge: {
    type: Object as PropType<I18nDevToolsBridge>,
    required: false,
  },
})

// Create state
const state = createI18nState()
provide(I18N_STATE_KEY, state)

const activeTab = ref('i18n')
const tabs = [
  { label: 'Translations', value: 'i18n', icon: 'languages' as const },
  { label: 'Settings', value: 'settings', icon: 'settings' as const },
  { label: 'Server Info', value: 'config', icon: 'server' as const },
]

/**
 * Theme follows the host page: Nuxt DevTools (and most hosts) put `dark` / `light` on <html>;
 * without either class the system preference decides.
 */
const isDark = ref(false)
const media = typeof window === 'undefined' ? null : window.matchMedia('(prefers-color-scheme: dark)')
const syncTheme = () => {
  const html = document.documentElement.classList
  isDark.value = html.contains('dark') || (!html.contains('light') && !!media?.matches)
}
const themeObserver = typeof MutationObserver === 'undefined' ? null : new MutationObserver(syncTheme)
onMounted(() => {
  syncTheme()
  themeObserver?.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  media?.addEventListener('change', syncTheme)
})
onBeforeUnmount(() => {
  themeObserver?.disconnect()
  media?.removeEventListener('change', syncTheme)
})

// Initialization logic simplified
// We simply watch the bridge prop. Once it appears, we initialize the state.
const initBridge = async (bridgeInstance: I18nDevToolsBridge) => {
  if (state.bridge.value) return // Already initialized

  console.log('[i18n-devtools] Bridge received, initializing...')
  state.setBridge(bridgeInstance)
  await state.init()
}

// Watch for prop changes (in case of async delivery)
watch(
  () => props.bridge,
  (newBridge) => {
    if (newBridge) {
      initBridge(newBridge)
    }
  },
  { immediate: true },
)

// Computed property for loader
// Show loader if state is loading OR if bridge is not yet received
const isLoading = computed(() => {
  return state.isLoading.value || !state.bridge.value
})

// Fallback: sometimes in Custom Elements props arrive with a delay.
// If watch didn't trigger immediately, check on mount.
onMounted(() => {
  // Check if bridge is present in props
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
</style>
