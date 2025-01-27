<template>
  <div
    class="h-screen overflow-auto p-6"
    style="padding-top: 70px"
  >
    <NCard
      content-style="padding: 0;"
    >
      <div class="editor-settings p-6 space-y-8">
        <!-- Выбор редактора -->
        <div class="settings-group">
          <div class="group-header">
            <span class="icon">🖋️</span>
            <h3 class="group-title">
              Editor Preferences
            </h3>
          </div>
          <div class="settings-content">
            <div class="input-group">
              <label class="input-label">Primary Editor</label>
              <div class="custom-select">
                <select
                  v-model="selectedEditor"
                  class="styled-select"
                >
                  <option
                    value=""
                    disabled
                    hidden
                  >
                    Choose an editor
                  </option>
                  <option
                    v-for="option in editorOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <div class="select-arrow">
                  ▼
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Настройки автоперевода -->
        <div class="settings-group">
          <div class="group-header">
            <span class="icon">🌐</span>
            <h3 class="group-title">
              Auto-Translation Engine
            </h3>
          </div>
          <div class="settings-content space-y-6">
            <div class="input-group">
              <label class="input-label">Translation Service</label>
              <div class="custom-select">
                <select
                  v-model="selectedDriver"
                  class="styled-select"
                >
                  <option
                    value=""
                    disabled
                    hidden
                  >
                    Select a translation driver
                  </option>
                  <option
                    v-for="driver in translationDrivers"
                    :key="driver.value"
                    :value="driver.value"
                  >
                    {{ driver.label }}
                  </option>
                </select>
                <div class="select-arrow">
                  ▼
                </div>
              </div>
            </div>

            <transition name="fade-slide">
              <div
                v-if="selectedDriver !== 'disabled'"
                class="driver-options space-y-4"
              >
                <div class="input-group">
                  <label class="input-label">
                    <span class="mr-2">🔑</span>
                    API Authorization
                  </label>
                  <input
                    v-model="apiToken"
                    type="password"
                    placeholder="Enter your secure API token"
                    class="styled-input"
                  >
                </div>

                <!-- Yandex Cloud Options -->
                <transition name="fade-slide">
                  <div
                    v-if="selectedDriver === 'yandex-cloud'"
                    class="input-group"
                  >
                    <label class="input-label">
                      <span class="mr-2">📁</span>
                      Cloud Folder ID
                    </label>
                    <input
                      v-model="driverOptions.folderId"
                      type="text"
                      placeholder="Yandex Cloud folder identifier"
                      class="styled-input"
                    >
                  </div>
                </transition>

                <!-- DeepL Options -->
                <transition name="fade-slide">
                  <div
                    v-if="selectedDriver === 'deepl'"
                    class="input-group"
                  >
                    <label class="input-label">
                      <span class="mr-2">🎚️</span>
                      Tone Formality
                    </label>
                    <div class="custom-select">
                      <select
                        v-model="driverOptions.formality"
                        class="styled-select"
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
                </transition>

                <!-- OpenAI Models -->
                <transition name="fade-slide">
                  <div
                    v-if="selectedDriver === 'openai'"
                    class="input-group"
                  >
                    <label class="input-label">
                      <span class="mr-2">🤖</span>
                      AI Model Selection
                    </label>
                    <div class="custom-select">
                      <select
                        v-model="driverOptions.model"
                        class="styled-select"
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
                </transition>

                <!-- DeepSeek Models -->
                <transition name="fade-slide">
                  <div
                    v-if="selectedDriver === 'deepseek'"
                    class="input-group"
                  >
                    <label class="input-label">
                      <span class="mr-2">🧠</span>
                      Reasoning Model
                    </label>
                    <div class="custom-select">
                      <select
                        v-model="driverOptions.model"
                        class="styled-select"
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
                </transition>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

// Настройки редактора
const editorOptions = [
  { label: 'JSON Editor', value: 'json' },
  { label: 'Translation Editor', value: 'translation' },
]
const selectedEditor = ref('translation')
const editorStorageKey = 'selectedEditor'

const openAIModels = ref([
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-16k',
  'gpt-3.5-turbo-instruct',
  'gpt-4',
  'gpt-4-turbo',
  'gpt-4-32k',
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4o-preview',
  'text-davinci-003',
  'text-curie-001',
  'text-babbage-001',
  'text-ada-001',
])

// Настройки автоперевода
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
const selectedDriver = ref('disabled')
const apiToken = ref('')
const driverOptions = ref<{ [key: string]: string }>({
  folderId: '', // Для Yandex Cloud
  formality: 'default', // Для DeepL
  model: 'gpt-3.5-turbo', // Для OpenAI и DeepSeek
})
const translationSettingsStorageKey = 'translationSettings'

// Загрузка настроек редактора из localStorage
onMounted(() => {
  const savedEditor = localStorage.getItem(editorStorageKey)
  if (savedEditor) {
    selectedEditor.value = savedEditor
  }
  else {
    selectedEditor.value = editorOptions[0].value
  }

  // Загрузка настроек автоперевода из localStorage
  const savedTranslationSettings = localStorage.getItem(translationSettingsStorageKey)
  if (savedTranslationSettings) {
    const { driver, token, options } = JSON.parse(savedTranslationSettings)
    selectedDriver.value = driver
    apiToken.value = token
    driverOptions.value = options || {}
  }
})

// Сохранение настроек редактора в localStorage
watch(selectedEditor, (newValue) => {
  localStorage.setItem(editorStorageKey, newValue)
})

// Сохранение настроек автоперевода в localStorage
watch([selectedDriver, apiToken, driverOptions], () => {
  const settings = {
    driver: selectedDriver.value,
    token: apiToken.value,
    options: driverOptions.value,
  }
  localStorage.setItem(translationSettingsStorageKey, JSON.stringify(settings))
}, { deep: true })
</script>

<style scoped>
.settings-group {
  @apply bg-white rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md;
}

.group-header {
  @apply flex items-center mb-6 border-b pb-4 border-gray-100;
}

.icon {
  @apply text-2xl mr-3;
}

.group-title {
  @apply text-xl font-semibold text-gray-800;
}

.input-group {
  @apply space-y-2;
}

.input-label {
  @apply flex items-center text-sm font-medium text-gray-600;
}

.custom-select {
  @apply relative rounded-lg border border-gray-200 transition-all duration-200 hover:border-blue-400;
}

.styled-select {
  @apply w-full px-4 py-3 pr-8 bg-transparent outline-none appearance-none text-gray-700 rounded-lg;
}

.select-arrow {
  @apply absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none;
}

.styled-input {
  @apply w-full px-4 py-3 rounded-lg border border-gray-200 outline-none transition-all duration-200
  focus:ring-2 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-400;
}

.driver-options {
  @apply pl-4 border-l-4 border-blue-100 ml-2;
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
