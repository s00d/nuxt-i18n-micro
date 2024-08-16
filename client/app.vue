<template>
  <div
    class="relative"
    style="height: 100vh"
  >
    <div class="flex h-full">
      <!-- Sidebar for Locales -->
      <div
        class="h-full border-r border-r-gray-400 overflow-auto bg-gray-50 dark:bg-gray-800"
        style="width: 22rem; min-width: 0; flex: 0 0 auto"
      >
        <div class="border-b border-b-gray-400 p-3">
          <!-- Component Title -->
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            nuxt-i18n-micro
          </h2>
          <NTextInput
            v-model="search"
            placeholder="Search locales..."
            icon="carbon-search"
            class="w-full"
          />
        </div>
        <div
          v-for="locale in filteredLocales"
          :key="locale.locale"
          class="relative group"
        >
          <button
            class="text-secondary hover:bg-blue-100 dark:hover:bg-blue-900 flex select-none truncate px-2 py-2 font-mono text-sm w-full"
            :class="{ 'bg-blue-200 dark:bg-blue-700': locale.locale === selectedLocale }"
            @click="selectedLocale = locale.locale"
          >
            {{ locale.locale }}
          </button>
        </div>
      </div>

      <!-- Splitter -->
      <div class="splitpanes__splitter bg-gray-300 dark:bg-gray-600" />

      <!-- Main Content -->
      <div
        v-if="selectedLocale"
        class="h-full relative w-full overflow-auto bg-white dark:bg-gray-900"
      >
        <div class="p-4">
          <h3 class="text-lg mb-2 text-gray-900 dark:text-gray-100">
            Translation Files for {{ selectedLocale }}
          </h3>
          <div
            v-for="file in selectedLocaleFiles"
            :key="file"
            class="relative group"
          >
            <button
              class="text-secondary hover:bg-blue-100 dark:hover:bg-blue-900 flex select-none truncate px-2 py-2 font-mono text-sm w-full"
              :class="{ 'bg-blue-200 dark:bg-blue-700': file === selectedFile }"
              @click="selectedFile = file"
            >
              {{ file }}
            </button>
          </div>

          <div
            v-if="selectedFileContent"
            class="mt-4"
          >
            <h3 class="text-lg mb-2 text-gray-900 dark:text-gray-100">
              Content of {{ selectedFile }}
            </h3>
            <pre
              class="p-4 bg-gray-100 rounded dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
              style="white-space: pre-wrap; word-break: break-word;"
            >
              <code class="language-json"><span v-html="formattedFileContent" /></code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
import { ref, computed } from 'vue'

// TypeScript interfaces for locale data
interface TranslationContent {
  [key: string]: unknown
}

interface LocaleData {
  locale: string
  files: string[]
  content: Record<string, TranslationContent>
}

const RPC_NAMESPACE = 'nuxt-i18n-micro'

const selectedLocale = ref<string>('')
const selectedFile = ref<string>('')
const locales = ref<LocaleData[]>([])
const search = ref<string>('')

// Computed properties to filter and display locale and file data
const selectedLocaleFiles = computed<string[]>(() => {
  const locale = locales.value.find(l => l.locale === selectedLocale.value)
  return locale ? locale.files : []
})

const selectedFileContent = computed<TranslationContent | null>(() => {
  const locale = locales.value.find(l => l.locale === selectedLocale.value)
  return locale ? locale.content[selectedFile.value] : null
})

const filteredLocales = computed<LocaleData[]>(() => {
  if (!search.value) {
    return locales.value
  }

  return locales.value.filter(locale =>
    locale.locale.toLowerCase().includes(search.value.toLowerCase()),
  )
})

const formattedFileContent = computed<string>(() => {
  // Add syntax highlighting for JSON
  return '<br>' + JSON.stringify(selectedFileContent.value, null, 2)
    .replace(/"(.*?)":/g, '<span class="text-blue-500">"$1":</span>') // Keys
    .replace(/:\s?"(.*?)"/g, ': "<span class="text-green-500">$1</span>"') // String values
    .replace(/:\s?(\d+)/g, ': <span class="text-purple-500">$1</span>') // Number values
    .replace(/:\s?(true|false)/g, ': <span class="text-red-500">$1</span>') // Boolean values
})

onDevtoolsClientConnected(async (client) => {
  const rpc = client.devtools.extendClientRpc(RPC_NAMESPACE, {
    localesUpdated(updatedLocales: LocaleData[]) {
      locales.value = updatedLocales
    },
  })

  const initialLocales = await rpc.getLocalesAndTranslations()
  locales.value = initialLocales
})
</script>

<style scoped>
.splitpanes__splitter {
  width: 4px;
  cursor: ew-resize;
}

.language-json {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875rem;
}
</style>
