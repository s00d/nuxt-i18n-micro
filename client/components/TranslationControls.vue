<template>
  <div class="translation-controls">
    <div class="translation-controls__content">
      <!-- Service Selection -->
      <div class="control-group">
        <label class="control-label">
          <span class="control-icon">🔧</span>
          Translation Service
        </label>
        <div class="control-select">
          <select
            v-model="selectedDriver"
            class="select-input"
          >
            <option
              value=""
              disabled
              hidden
            >
              Select a translation driver
            </option>
            <option
              v-for="current_driver in translationDrivers"
              :key="current_driver.value"
              :value="current_driver.value"
            >
              {{ current_driver.label }}
            </option>
          </select>
          <div class="select-arrow">
            ▼
          </div>
        </div>
      </div>

      <!-- API Token -->
      <transition name="fade-slide">
        <div
          v-if="selectedDriver !== 'disabled'"
          class="control-group"
        >
          <label class="control-label">
            <span class="control-icon">🔑</span>
            API Authorization
          </label>
          <input
            v-model="localApiToken"
            type="password"
            placeholder="Enter your secure API token"
            class="styled-input"
          >
        </div>
      </transition>

      <!-- Driver Specific Options -->
      <transition name="fade-slide">
        <div
          v-if="selectedDriver !== 'disabled'"
          class="driver-options"
        >
          <!-- Yandex Cloud Options -->
          <div
            v-if="selectedDriver === 'yandex-cloud'"
            class="control-group"
          >
            <label class="control-label">
              <span class="control-icon">📁</span>
              Cloud Folder ID
            </label>
            <input
              v-model="localDriverOptions.folderId"
              type="text"
              placeholder="Yandex Cloud folder identifier"
              class="styled-input"
            >
          </div>

          <!-- DeepL Options -->
          <div
            v-if="selectedDriver === 'deepl'"
            class="control-group"
          >
            <label class="control-label">
              <span class="control-icon">🎚️</span>
              Tone Formality
            </label>
            <div class="control-select">
              <select
                v-model="localDriverOptions.formality"
                class="select-input"
              >
                <option value="default">
                  Neutral (Default)
                </option>
                <option value="more">
                  Formal Tone
                </option>
                <option value="less">
                  Casual Tone
                </option>
              </select>
              <div class="select-arrow">
                ▼
              </div>
            </div>
          </div>

          <!-- OpenAI Models -->
          <div
            v-if="selectedDriver === 'openai'"
            class="control-group"
          >
            <label class="control-label">
              <span class="control-icon">🤖</span>
              AI Model Selection
            </label>
            <div class="control-select">
              <select
                v-model="localDriverOptions.model"
                class="select-input"
              >
                <option
                  v-for="model in openAIModels"
                  :key="model"
                  :value="model"
                >
                  {{ model }}
                </option>
              </select>
              <div class="select-arrow">
                ▼
              </div>
            </div>
          </div>

          <!-- DeepSeek Models -->
          <div
            v-if="selectedDriver === 'deepseek'"
            class="control-group"
          >
            <label class="control-label">
              <span class="control-icon">🧠</span>
              Reasoning Model
            </label>
            <div class="control-select">
              <select
                v-model="localDriverOptions.model"
                class="select-input"
              >
                <option value="deepseek-chat">
                  Chat Optimized
                </option>
                <option value="deepseek-reasoner">
                  Advanced Reasoning
                </option>
              </select>
              <div class="select-arrow">
                ▼
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

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

// Локальные переменные для v-model
const selectedDriver = ref(props.driver)
const localApiToken = ref(props.apiToken)
const localDriverOptions = ref({ ...props.options })

// Синхронизация с пропсами (только входящие изменения)
watch(() => props.driver, async (newValue: string) => {
  if (newValue !== selectedDriver.value) {
    await nextTick()
    selectedDriver.value = newValue
  }
})

watch(() => props.apiToken, async (newValue: string) => {
  if (newValue !== localApiToken.value) {
    await nextTick()
    localApiToken.value = newValue
  }
})

watch(() => props.options, async (newValue: { [key: string]: string }) => {
  if (JSON.stringify(newValue) !== JSON.stringify(localDriverOptions.value)) {
    await nextTick()
    localDriverOptions.value = { ...newValue }
  }
}, { deep: true })

// Эмиты при изменении локальных переменных (только исходящие изменения)
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

watch(localDriverOptions, async (newValue: { [key: string]: string }) => {
  if (JSON.stringify(newValue) !== JSON.stringify(props.options)) {
    await nextTick()
    emit('update:options', { ...newValue })
  }
}, { deep: true })

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

<style scoped>
.translation-controls {
  @apply space-y-4;
}

.translation-controls__content {
  @apply space-y-4;
}

.control-group {
  @apply space-y-2;
}

.control-label {
  @apply flex items-center text-sm font-medium text-slate-600;
}

.control-icon {
  @apply mr-2;
}

.control-select {
  @apply relative rounded-lg border border-slate-200 transition-all duration-200 hover:border-blue-400;
}

.select-input {
  @apply w-full px-3 py-2 pr-8 bg-transparent outline-none appearance-none text-slate-700 rounded-lg text-sm;
}

.select-arrow {
  @apply absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs;
}

.styled-input {
  @apply w-full px-3 py-2 rounded-lg border border-slate-200 outline-none transition-all duration-200
  focus:ring-2 focus:ring-blue-200 focus:border-blue-400 placeholder-slate-400 text-sm;
}

.driver-options {
  @apply pl-4 border-l-2 border-blue-100 ml-2 space-y-3;
}

/* Анимации */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
