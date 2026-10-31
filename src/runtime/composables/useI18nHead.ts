import type { I18nHeadInput } from '@i18n-micro/types'
import type { MaybeRefOrGetter } from 'vue'
import { getCurrentInstance, onActivated, toValue, watch } from 'vue'
import { useRoute, useRouter } from '#app/composables/router'
import { useState } from '#app/composables/state'
import { usePageHead } from '../utils/page-head'

/**
 * Register page-level overrides for i18n SEO head tags.
 * Merged on top of `useLocaleHead` output by the `02.meta` plugin.
 *
 * Prefer a getter (`() => ({ … })`) when values come from `$t` / `t` so they
 * re-resolve on locale change. A plain object is evaluated once and stays frozen.
 */
export function useI18nHead(input?: MaybeRefOrGetter<I18nHeadInput | null>) {
  const pageHead = usePageHead()
  const localeState = useState<string | null>('i18n-locale', () => null)

  const resetPageHead = () => {
    pageHead.value = null
  }

  if (input !== undefined) {
    // `useRoute()` stays on this page while the next one loads. The page is still mounted then, and its watcher
    // still runs (a dictionary or locale change), but the head it writes is no longer the shown page's.
    const route = useRoute()
    const router = useRouter()
    const write = (value: I18nHeadInput | null | undefined) => {
      if (route.path === router.currentRoute.value.path) pageHead.value = value ?? null
    }

    watch(
      () => {
        // Track locale so getters that call `t()` re-run after locale-only switches.
        localeState.value
        return toValue(input)
      },
      write,
      { immediate: true, deep: true },
    )
    // keepalive: setup does not run again on the way back
    if (getCurrentInstance()) onActivated(() => write(toValue(input)))
  }

  return { pageHead, resetPageHead }
}
