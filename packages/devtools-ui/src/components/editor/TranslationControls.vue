<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <div>
      <label class="label" for="i18n-driver">Translation service</label>
      <select id="i18n-driver" v-model="selectedDriver" class="field">
        <option value="" disabled hidden>Select a translation driver</option>
        <option v-for="current_driver in translationDrivers" :key="current_driver.value" :value="current_driver.value">
          {{ current_driver.label }}
        </option>
      </select>
      <p class="hint">Used by “Translate missing” and the per-key translate button in the editor.</p>
    </div>

    <div v-if="selectedDriver !== 'disabled'">
      <label class="label" for="i18n-token">API token</label>
      <input id="i18n-token" v-model="localApiToken" type="password" autocomplete="off" placeholder="Enter your API token" class="field" />
      <p class="hint">Kept in this browser's localStorage only.</p>
    </div>

    <div v-if="selectedDriver === 'yandex-cloud'">
      <label class="label" for="i18n-folder">Cloud folder ID</label>
      <input id="i18n-folder" v-model="localDriverOptions.folderId" type="text" placeholder="Yandex Cloud folder identifier" class="field" />
    </div>

    <div v-if="selectedDriver === 'deepl'">
      <label class="label" for="i18n-formality">Tone formality</label>
      <select id="i18n-formality" v-model="localDriverOptions.formality" class="field">
        <option value="default">Neutral (default)</option>
        <option value="more">Formal</option>
        <option value="less">Casual</option>
      </select>
    </div>

    <div v-if="selectedDriver === 'openai'">
      <label class="label" for="i18n-openai-model">Model</label>
      <select id="i18n-openai-model" v-model="localDriverOptions.model" class="field">
        <option v-for="model in openAIModels" :key="model" :value="model">
          {{ model }}
        </option>
      </select>
    </div>

    <div v-if="selectedDriver === 'deepseek'">
      <label class="label" for="i18n-deepseek-model">Model</label>
      <select id="i18n-deepseek-model" v-model="localDriverOptions.model" class="field">
        <option value="deepseek-chat">Chat optimized</option>
        <option value="deepseek-reasoner">Advanced reasoning</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

interface Props {
  driver: string
  apiToken: string
  options: { [key: string]: string }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:driver': [value: string]
  'update:apiToken': [value: string]
  'update:options': [value: { [key: string]: string }]
}>()

// Local variables for v-model
const selectedDriver = ref(props.driver)
const localApiToken = ref(props.apiToken)
const localDriverOptions = ref({ ...props.options })

// Sync with props (incoming changes only)
watch(
  () => props.driver,
  async (newValue: string) => {
    if (newValue !== selectedDriver.value) {
      await nextTick()
      selectedDriver.value = newValue
    }
  },
)

watch(
  () => props.apiToken,
  async (newValue: string) => {
    if (newValue !== localApiToken.value) {
      await nextTick()
      localApiToken.value = newValue
    }
  },
)

watch(
  () => props.options,
  async (newValue: { [key: string]: string }) => {
    if (JSON.stringify(newValue) !== JSON.stringify(localDriverOptions.value)) {
      await nextTick()
      localDriverOptions.value = { ...newValue }
    }
  },
  { deep: true },
)

// Emit on local variable changes (outgoing changes only)
watch(selectedDriver, async (newValue: string) => {
  if (newValue !== props.driver) {
    await nextTick()
    emit('update:driver', newValue)
  }
})

watch(localApiToken, async (newValue: string) => {
  if (newValue !== props.apiToken) {
    await nextTick()
    emit('update:apiToken', newValue)
  }
})

watch(
  localDriverOptions,
  async (newValue: { [key: string]: string }) => {
    if (JSON.stringify(newValue) !== JSON.stringify(props.options)) {
      await nextTick()
      emit('update:options', { ...newValue })
    }
  },
  { deep: true },
)

const translationDrivers = [
  { label: 'Disabled', value: 'disabled' },
  { label: 'OpenAI', value: 'openai' },
  { label: 'Google', value: 'google' },
  { label: 'Google Free', value: 'google-free' },
  { label: 'DeepL', value: 'deepl' },
  { label: 'DeepSeek', value: 'deepseek' },
  { label: 'Yandex', value: 'yandex' },
  { label: 'Yandex Cloud', value: 'yandex-cloud' },
]

const openAIModels = [
  // GPT-5 Models (Latest)
  'gpt-5',
  'gpt-5-mini',
  'gpt-5-nano',
  'gpt-5-chat-latest',
  'gpt-5-2025-08-07',
  'gpt-5-mini-2025-08-07',
  'gpt-5-nano-2025-08-07',

  // GPT-4.1 Models
  'gpt-4.1',
  'gpt-4.1-mini',
  'gpt-4.1-nano',
  'gpt-4.1-2025-04-14',
  'gpt-4.1-mini-2025-04-14',
  'gpt-4.1-nano-2025-04-14',

  // O-Series Models (Reasoning)
  'o3',
  'o3-mini',
  'o3-pro',
  'o3-deep-research',
  'o3-2025-04-16',
  'o3-mini-2025-01-31',
  'o3-pro-2025-06-10',
  'o3-deep-research-2025-06-26',

  'o4-mini',
  'o4-mini-deep-research',
  'o4-mini-2025-04-16',
  'o4-mini-deep-research-2025-06-26',

  'o1',
  'o1-mini',
  'o1-pro',
  'o1-2024-12-17',
  'o1-mini-2024-09-12',
  'o1-pro-2025-03-19',

  // GPT-4o Models
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4o-2024-05-13',
  'gpt-4o-mini-2024-07-18',
  'gpt-4o-2024-08-06',
  'gpt-4o-2024-11-20',
  'gpt-4o-2025-03-11',
  'chatgpt-4o-latest',

  // GPT-4o Realtime & Audio
  'gpt-4o-realtime-preview',
  'gpt-4o-audio-preview',
  'gpt-4o-mini-realtime-preview',
  'gpt-4o-mini-audio-preview',
  'gpt-4o-realtime-preview-2024-10-01',
  'gpt-4o-audio-preview-2024-10-01',
  'gpt-4o-realtime-preview-2024-12-17',
  'gpt-4o-audio-preview-2024-12-17',
  'gpt-4o-mini-realtime-preview-2024-12-17',
  'gpt-4o-mini-audio-preview-2024-12-17',
  'gpt-4o-realtime-preview-2025-06-03',
  'gpt-4o-audio-preview-2025-06-03',

  // GPT-4o Search & Transcribe
  'gpt-4o-search-preview',
  'gpt-4o-mini-search-preview',
  'gpt-4o-search-preview-2025-03-11',
  'gpt-4o-mini-search-preview-2025-03-11',
  'gpt-4o-transcribe',
  'gpt-4o-mini-transcribe',
  'gpt-4o-mini-tts',

  // GPT-4 Models
  'gpt-4',
  'gpt-4-turbo',
  'gpt-4-turbo-preview',
  'gpt-4-0613',
  'gpt-4-1106-preview',
  'gpt-4-0125-preview',
  'gpt-4-turbo-2024-04-09',

  // GPT-3.5 Models
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-16k',
  'gpt-3.5-turbo-instruct',
  'gpt-3.5-turbo-instruct-0914',
  'gpt-3.5-turbo-1106',
  'gpt-3.5-turbo-0125',
]
</script>
