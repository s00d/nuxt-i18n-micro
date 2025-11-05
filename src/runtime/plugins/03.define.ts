// plugins/i18n.define.ts
import type { WatchHandle, Ref } from 'vue'
import type { Translations, DefineI18nRouteConfig } from 'nuxt-i18n-micro-types'
import { defineNuxtPlugin, useNuxtApp } from '#imports'
import { watch, unref, computed, onUnmounted } from 'vue'

type LocalesObject = Record<string, Translations>

const normalizeLocales = (locales?: string[] | LocalesObject): LocalesObject => {
  if (Array.isArray(locales)) {
    return locales.reduce((acc, locale) => {
      acc[locale] = {}
      return acc
    }, {} as LocalesObject)
  }
  else if (typeof locales === 'object' && locales !== null) {
    return locales
  }
  return {}
}

export default defineNuxtPlugin(() => {
  const defineI18nRoute = async (routeDefinition: DefineI18nRouteConfig) => {
    const { $getLocale, $mergeGlobalTranslations } = useNuxtApp()
    let currentLocale: Ref<string> | null = computed(() => $getLocale())
    const normalizedLocales = normalizeLocales(routeDefinition.locales)

    const updateTranslations = () => {
      const localeValue = unref(currentLocale)
      if (localeValue && normalizedLocales[localeValue]) {
        $mergeGlobalTranslations?.(normalizedLocales[localeValue])
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
