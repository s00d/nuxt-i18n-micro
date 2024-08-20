<script setup lang="ts">
import { ref, computed } from 'vue'
import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
import JsonEditorVue from 'json-editor-vue'

interface TranslationContent {
  [key: string]: unknown
}

interface LocaleData {
  locale: string
  files: string[]
  content: Record<string, TranslationContent>
}

const RPC_NAMESPACE = 'nuxt-i18n-micro'

const search = ref('')
const selectedLocale = ref<string>('')
const selectedFile = ref<string>('')
const locales = ref<LocaleData[]>([])

const selectedLocaleFiles = computed<string[]>(() => {
  const locale = locales.value.find(l => l.locale === selectedLocale.value)
  return locale ? locale.files : []
})

const selectedFileContent = computed<TranslationContent | null>(() => {
  const locale = locales.value.find(l => l.locale === selectedLocale.value)
  return locale ? locale.content[selectedFile.value] : null
})

const filteredLocales = computed<LocaleData[]>(() => {
  if (!search.value) return locales.value
  return locales.value.filter(locale => locale.locale.toLowerCase().includes(search.value.toLowerCase()))
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

<template>
  <div
    class="h-screen overflow-auto"
  >
    <NSplitPane
      storage-key="tab-i18n-locales"
    >
      <template #left>
        <div class="h-[48px] flex items-center justify-between gap1 px-3">
          <NTextInput
            v-model="search"
            placeholder="Search locales..."
            icon="carbon-search"
            class="w-full"
          />
        </div>
        <template
          v-for="locale in filteredLocales"
          :key="locale.locale"
        >
          <button
            block
            w-full
            truncate
            px2
            py1
            text-start
            text-sm
            font-mono
            :class="locale.locale === selectedLocale ? 'text-primary n-bg-active' : 'text-secondary hover:n-bg-hover'"
            @click="selectedLocale = locale.locale"
          >
            {{ locale.locale }}
          </button>
          <div x-divider />
        </template>
      </template>

      <template #right>
        <div
          v-if="selectedLocale"
          h-full
          of-hidden
          flex="~ col"
        >
          <div
            border="b base"
            class="h-[49px] flex flex-none items-center justify-between px-4 text-sm"
          >
            <div class="flex items-center gap-4">
              <code>{{ selectedLocale }}</code>
            </div>
          </div>
          <div
            v-for="file in selectedLocaleFiles"
            :key="file"
          >
            <button
              block
              w-full
              truncate
              px2
              py1
              text-start
              text-sm
              font-mono
              :class="file === selectedFile ? 'text-primary n-bg-active' : 'text-secondary hover:n-bg-hover'"
              @click="selectedFile = file"
            >
              {{ file }}
            </button>
            <div x-divider />
          </div>

          <JsonEditorVue
            v-if="selectedFileContent"
            v-model="selectedFileContent"
            v-bind="$attrs"
            style="overflow: auto;"
            :main-menu-bar="false"
            :navigation-bar="false"
            :status-bar="false"
            :read-only="readonly"
            :indentation="2"
            :tab-size="2"
          />
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
