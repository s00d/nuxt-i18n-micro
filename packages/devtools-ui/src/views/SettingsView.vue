<template>
  <div class="scroll-thin h-full overflow-auto">
    <div class="mx-auto max-w-3xl p-4">
      <Card title="Auto-translation" icon="sparkles" description="for missing keys in the editor">
        <TranslationControls v-model:driver="selectedDriver" v-model:api-token="apiToken" v-model:options="driverOptions" />
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import TranslationControls from '../components/editor/TranslationControls.vue'
import Card from '../components/ui/Card.vue'

// Auto-translation settings
const selectedDriver = ref('disabled')
const apiToken = ref('')
const driverOptions = ref<{ [key: string]: string }>({
  folderId: '', // For Yandex Cloud
  formality: 'default', // For DeepL
  model: 'gpt-3.5-turbo', // For OpenAI and DeepSeek
})
const translationSettingsStorageKey = 'translationSettings'

// Load auto-translation settings from localStorage
onMounted(() => {
  const savedTranslationSettings = localStorage.getItem(translationSettingsStorageKey)
  if (savedTranslationSettings) {
    const { driver, token, options } = JSON.parse(savedTranslationSettings)
    selectedDriver.value = driver
    apiToken.value = token
    driverOptions.value = options || {}
  }
})

// Save auto-translation settings to localStorage
watch(
  [selectedDriver, apiToken, driverOptions],
  async () => {
    await nextTick()
    const settings = {
      driver: selectedDriver.value,
      token: apiToken.value,
      options: driverOptions.value,
    }
    localStorage.setItem(translationSettingsStorageKey, JSON.stringify(settings))
  },
  { deep: true },
)
</script>
