import type { I18nHeadInput } from '@i18n-micro/types'
import { useState } from '#app/composables/state'

/**
 * The page's overrides. Out of `composables/`, which is auto-imported. The merge stays in `02.meta`:
 * a page head set on the server only reaches the client in the payload, with no `useI18nHead` call there.
 */
export const usePageHead = () => useState<I18nHeadInput | null>('i18n-head-page', () => null)
