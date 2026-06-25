import type { I18nHeadInput } from '@i18n-micro/types'
import type { MaybeRefOrGetter } from 'vue'
import { toValue, watch } from 'vue'
import { useState } from '#app'

/**
 * Register page-level overrides for i18n SEO head tags.
 * Merged on top of `useLocaleHead` output by the `02.meta` plugin.
 */
export function useI18nHead(input?: MaybeRefOrGetter<I18nHeadInput | null>) {
  const pageHead = useState<I18nHeadInput | null>('i18n-head-page', () => null)

  const resetPageHead = () => {
    pageHead.value = null
  }

  if (input !== undefined) {
    watch(
      () => toValue(input),
      (value) => {
        pageHead.value = value ?? null
      },
      { immediate: true, deep: true },
    )
  }

  return { pageHead, resetPageHead }
}
