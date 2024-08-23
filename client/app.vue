<template>
  <div class="h-screen overflow-auto">
    <NLoading v-if="isLoading" />
    <NSplitPane storage-key="tab-i18n-locales">
      <template #left>
        <LocalesList
          :locales="filteredLocales"
          :selected-locale="selectedLocale"
          @locale-selected="handleLocaleSelected"
        />
      </template>

      <template #right>
        <div
          v-if="selectedLocale"
          h-full
          of-hidden
          flex="~ col"
        >
          <NSplitPane
            storage-key="tab-i18n-files"
            :horizontal="true"
          >
            <template #left>
              <FilesList
                :files="selectedLocaleFiles"
                :selected-file="selectedFile"
                @file-selected="handleFileSelected"
              />
            </template>
            <template #right>
              <div
                v-if="selectedFileContent"
                class="actions"
              >
                <NButton @click="exportTranslations">
                  Export Translations
                </NButton>
                <NButton @click="importTranslationsClick">
                  Import Translations
                </NButton>
                <input
                  v-show="false"
                  ref="file"
                  type="file"
                  @change="importTranslations"
                >
              </div>
              <JsonEditorVue
                v-if="selectedFileContent"
                v-model="selectedFileContent"
                v-bind="$attrs"
                style="overflow: auto;height: 90%"
                :main-menu-bar="false"
                :navigation-bar="false"
                :status-bar="false"
                :read-only="false"
                :indentation="2"
                :tab-size="2"
              />
            </template>
          </NSplitPane>
        </div>
        <NPanelGrids v-else>
          <NCard
            px6
            py4
          >
            Select a locale to view locale.<br>Learn more about
            <NLink
              href="https://github.com/s00d/nuxt-i18n-micro"
              n="orange"
              target="_blank"
            >
              i18n
            </NLink>
          </NCard>
        </NPanelGrids>
      </template>
    </NSplitPane>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
import JsonEditorVue from 'json-editor-vue'

export interface TranslationContent {
  [key: string]: unknown
}

export interface LocaleData {
  locale: string
  files: string[]
  content: Record<string, TranslationContent>
}

const RPC_NAMESPACE = 'nuxt-i18n-micro'

const file = ref<HTMLButtonElement | null>(null)
const isLoading = ref(true)
const selectedLocale = ref<string>('')
const selectedFile = ref<string>('')
const locales = ref<LocaleData[]>([])
const selectedFileContent = ref<TranslationContent | null>(null)

const selectedLocaleFiles = computed<string[]>(() => {
  const locale = locales.value.find(l => l.locale === selectedLocale.value)
  return locale ? locale.files : []
})

const filteredLocales = computed<LocaleData[]>(() => {
  // фильтрация теперь обрабатывается в компоненте LocalesList
  return locales.value
})

const handleLocaleSelected = (locale: string) => {
  selectedLocale.value = locale
}

const handleFileSelected = (file: string) => {
  selectedFile.value = file
}

watch([selectedLocale, selectedFile], () => {
  const locale = locales.value.find(l => l.locale === selectedLocale.value)
  selectedFileContent.value = locale ? locale.content[selectedFile.value] : null
})

onDevtoolsClientConnected(async (client) => {
  const rpc = client.devtools.extendClientRpc(RPC_NAMESPACE, {
    localesUpdated(updatedLocales: LocaleData[]) {
      locales.value = updatedLocales
    },
  })

  const initialLocales = await rpc.getLocalesAndTranslations()
  locales.value = initialLocales
  isLoading.value = false

  watch(selectedFileContent, (newContent, oldValue) => {
    if (!oldValue) {
      return
    }
    if (selectedLocale.value && selectedFile.value && newContent) {
      rpc.saveTranslationContent(selectedLocale.value, selectedFile.value, newContent)
    }
  }, { deep: true })
})

const exportTranslations = async () => {
  const blob = new Blob([JSON.stringify(selectedFileContent.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'translations.json'
  link.click()
  URL.revokeObjectURL(url)
}

const importTranslationsClick = () => {
  file.value?.click()
}

const importTranslations = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string)
        selectedFileContent.value = content
      }
      catch (err) {
        console.error('Invalid JSON file')
      }
    }
    reader.readAsText(file)
  }
}
</script>
