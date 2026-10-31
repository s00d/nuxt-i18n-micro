<template>
  <ul data-testid="page-dictionaries">
    <li data-testid="dict-loaded">{{ loaded }}</li>
    <li data-testid="dict-lazy">{{ t('lazy.title') }}</li>
    <li data-testid="dict-lazy-param">{{ t('lazy.hello', { name: 'Ada' }) }}</li>
    <li data-testid="dict-page">{{ t('pageTitle', undefined, undefined, 'dictionaries') }}</li>
    <li data-testid="dict-page-override">{{ t('welcome', undefined, undefined, 'dictionaries') }}</li>
    <li data-testid="dict-has-lazy">{{ has('lazy.title') }}</li>
    <li data-testid="dict-added">{{ t('added') }}</li>
    <li data-testid="dict-other-locale">{{ t('other') }}</li>
    <li data-testid="dict-set">{{ t('section.title') }}</li>
    <li data-testid="dict-resolved">{{ resolvedKeys }}</li>
    <li data-testid="dict-changes">{{ changes }}</li>
    <li><button data-testid="act-add" data-action @click="addTranslations(locale, { added: 'added text' })">add</button></li>
    <li><button data-testid="act-add-other" data-action @click="addTranslations('fr', { other: 'other locale' })">add other</button></li>
    <li>
      <button data-testid="act-add-route" data-action @click="addRouteTranslations(locale, 'dictionaries', { pageTitle: 'Replaced' }, false)">
        replace page
      </button>
    </li>
    <li><button data-testid="act-merge" data-action @click="mergeTranslations(locale, 'dictionaries', { added: 'merged' })">merge</button></li>
    <li><button data-testid="act-set" data-action @click="setTranslation('section.title', 'Set title')">set</button></li>
    <li><button data-testid="act-clear" data-action @click="clearCache()">clear</button></li>
    <li><button data-testid="act-reload" data-action @click="load()">reload</button></li>
  </ul>
</template>

<script setup lang="ts">
import { useI18n } from '@i18n-micro/vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { fetchDictionary, lazyUrl, pageUrl } from '../../../../../benchmark/integrations/catalogue'

const i18n = useI18n()
const { t, has, addTranslations, addRouteTranslations, mergeTranslations, setTranslation, clearCache, locale, resolveTranslations } = i18n
const loaded = ref('')
const changes = ref(0)

const resolvedKeys = computed(() => Object.keys(resolveTranslations()).length)

async function load() {
  const code = locale.value
  try {
    const [lazy, page] = await Promise.all([fetchDictionary(lazyUrl(code)), fetchDictionary(pageUrl(code))])
    addTranslations(code, lazy as never)
    addRouteTranslations(code, 'dictionaries', page as never)
    loaded.value = code
  } catch (error) {
    loaded.value = `failed: ${(error as Error).message}`
  }
}

onMounted(load)
watch(locale, load)
const stop = i18n.instance.subscribeToChanges(() => changes.value++)
onUnmounted(stop)
</script>
