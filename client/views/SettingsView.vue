<template>
  <div class="settings-view">
    <div class="space-y-6">
      <!-- Editor Preferences -->
      <SettingsCard
        title="Editor Preferences"
        icon="🖋️"
      >
        <EditorSelector
          v-model="selectedEditor"
        />
      </SettingsCard>

      <!-- Translation Engine -->
      <SettingsCard
        title="Auto-Translation Engine"
        icon="🌐"
      >
        <TranslationControls
          v-model:driver="selectedDriver"
          v-model:api-token="apiToken"
          v-model:options="driverOptions"
        />
      </SettingsCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import SettingsCard from '../components/SettingsCard.vue'
import EditorSelector from '../components/EditorSelector.vue'
import TranslationControls from '../components/TranslationControls.vue'

// Editor settings
const selectedEditor = ref('translation')
const editorStorageKey = 'selectedEditor'

// Auto-translation settings
const selectedDriver = ref('disabled')
const apiToken = ref('')
const driverOptions = ref<{ [key: string]: string }>({
  folderId: '', // For Yandex Cloud
  formality: 'default', // For DeepL
  model: 'gpt-3.5-turbo', // For OpenAI and DeepSeek
})
const translationSettingsStorageKey = 'translationSettings'

// Load editor settings from localStorage
onMounted(() => {
  const savedEditor = localStorage.getItem(editorStorageKey)
  if (savedEditor) {
    selectedEditor.value = savedEditor
  }
  else {
    selectedEditor.value = 'translation'
  }

  // Load auto-translation settings from localStorage
  const savedTranslationSettings = localStorage.getItem(translationSettingsStorageKey)
  if (savedTranslationSettings) {
    const { driver, token, options } = JSON.parse(savedTranslationSettings)
    selectedDriver.value = driver
    apiToken.value = token
    driverOptions.value = options || {}
  }
})

// Save editor settings to localStorage
watch(selectedEditor, async (newValue) => {
  await nextTick()
  localStorage.setItem(editorStorageKey, newValue)
})

// Save auto-translation settings to localStorage
watch([selectedDriver, apiToken, driverOptions], async () => {
  await nextTick()
  const settings = {
    driver: selectedDriver.value,
    token: apiToken.value,
    options: driverOptions.value,
  }
  localStorage.setItem(translationSettingsStorageKey, JSON.stringify(settings))
}, { deep: true })
</script>

<style scoped>
.settings-view {
  @apply h-full overflow-auto p-4;
}
</style>
