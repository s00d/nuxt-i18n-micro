import type { I18nHeadInput } from '@i18n-micro/types'
import { mergeI18nHead } from '@i18n-micro/utils/merge-i18n-head'
import type { MaybeRefOrGetter } from 'vue'
import { toValue, triggerRef, watch } from 'vue'
import { useState } from '#app/composables/state'
import { useNuxtApp } from '#app/nuxt'
import type { I18nAppInternals } from '../utils/nuxt-i18n'

/** The page's overrides. Plugins read this one, not `useI18nHead`: an app that never calls it ships no merge. */
export const usePageHead = () => useState<I18nHeadInput | null>('i18n-head-page', () => null)

/**
 * Register page-level overrides for i18n SEO head tags.
 * Merged on top of `useLocaleHead` output by the `02.meta` plugin.
 *
 * Prefer a getter (`() => ({ … })`) when values come from `$t` / `t` so they
 * re-resolve on locale change. A plain object is evaluated once and stays frozen.
 */
export function useI18nHead(input?: MaybeRefOrGetter<I18nHeadInput | null>) {
  const pageHead = usePageHead()
  const nuxtApp = useNuxtApp() as I18nAppInternals
  if (!nuxtApp._i18nMergeHead) {
    nuxtApp._i18nMergeHead = mergeI18nHead
    // a head resolved before this, while hydrating, saw the payload's page head and no merge
    triggerRef(pageHead)
  }
  const localeState = useState<string | null>('i18n-locale', () => null)

  const resetPageHead = () => {
    pageHead.value = null
  }

  if (input !== undefined) {
    watch(
      () => {
        // Track locale so getters that call `t()` re-run after locale-only switches.
        localeState.value
        return toValue(input)
      },
      (value) => {
        pageHead.value = value ?? null
      },
      { immediate: true, deep: true },
    )
  }

  return { pageHead, resetPageHead }
}
