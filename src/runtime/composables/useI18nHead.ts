import type { I18nHeadInput } from '@i18n-micro/types'
import type { MaybeRefOrGetter } from 'vue'
import { toValue, watch } from 'vue'
import { useState } from '#app'

/**
 * Register page-level overrides for i18n SEO head tags.
 * Merged on top of `useLocaleHead` output by the `02.meta` plugin.
 *
 * Prefer a getter (`() => ({ … })`) when values come from `$t` / `t` so they
 * re-resolve on locale change. A plain object is evaluated once and stays frozen.
 */
export function useI18nHead(input?: MaybeRefOrGetter<I18nHeadInput | null>) {
  const pageHead = useState<I18nHeadInput | null>('i18n-head-page', () => null)
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
