<template>
  <div class="i18n-devtools">
    <!-- Show loader while there's no data OR while bridge is not passed -->
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
import { ref, onMounted, watch, provide, computed, type PropType } from 'vue'
import type { I18nDevToolsBridge } from './bridge/interface'
import { createI18nState, I18N_STATE_KEY } from './composables/useI18nState'
import Tabs from './components/ui/Tabs.vue'
import I18nView from './views/I18nView.vue'
import SettingsView from './views/SettingsView.vue'
import ConfigView from './views/ConfigView.vue'
import Loader from './components/ui/Loader.vue'
import GlobeIcon from './components/ui/icons/GlobeIcon.vue'
import SettingsIcon from './components/ui/icons/SettingsIcon.vue'
import ServerIcon from './components/ui/icons/ServerIcon.vue'

// Bridge comes as prop because we passed it through .bridge in h()
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
  { label: 'i18n', value: 'i18n', icon: GlobeIcon },
  { label: 'Settings', value: 'settings', icon: SettingsIcon },
  { label: 'Server Info', value: 'config', icon: ServerIcon },
]

// Initialization logic simplified
// We just watch bridge prop. As soon as it appears, initialize state
const initBridge = async (bridgeInstance: I18nDevToolsBridge) => {
  if (state.bridge.value) return // Already initialized

  console.log('[i18n-devtools] Bridge received, initializing...')
  state.setBridge(bridgeInstance)
  await state.init()
}

// Watch for prop changes (in case of async passing)
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

// Fallback: sometimes in Custom Elements props don't come immediately
// If watch didn't fire immediately, check on mount
onMounted(() => {
  // Check if bridge is in props
  if (props.bridge) {
    initBridge(props.bridge)
  }
  else {
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
