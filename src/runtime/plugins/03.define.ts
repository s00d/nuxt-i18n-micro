// plugins/i18n.define.ts

import type { DefineI18nRouteConfig, Translations } from '@i18n-micro/types'
import type { Ref, WatchHandle } from 'vue'
import { computed, onUnmounted, unref, watch } from 'vue'
import { defineNuxtPlugin, useNuxtApp } from '#imports'

type LocalesObject = Record<string, Translations>

const normalizeLocales = (locales?: string[] | LocalesObject): LocalesObject => {
  if (Array.isArray(locales)) {
    return locales.reduce((acc, locale) => {
      acc[locale] = {}
      return acc
    }, {} as LocalesObject)
  } else if (typeof locales === 'object' && locales !== null) {
    return locales
  }
  return {}
}

export default defineNuxtPlugin(() => {
  const defineI18nRoute = async (routeDefinition: DefineI18nRouteConfig) => {
    const { $getLocale, $mergeTranslations } = useNuxtApp()
    let currentLocale: Ref<string> | null = computed(() => $getLocale())
    const normalizedLocales = normalizeLocales(routeDefinition.locales)

    const updateTranslations = () => {
      const localeValue = unref(currentLocale)
      if (localeValue && normalizedLocales[localeValue]) {
        $mergeTranslations?.(normalizedLocales[localeValue])
      }
    }

    updateTranslations()

    if (import.meta.client) {
      let stopWatcher: WatchHandle | null = watch(currentLocale, updateTranslations)
      onUnmounted(() => {
        if (stopWatcher) {
          stopWatcher()
          stopWatcher = null
          currentLocale = null
        }
      })
    }
  }

  return {
    provide: {
      defineI18nRoute,
    },
  }
})
