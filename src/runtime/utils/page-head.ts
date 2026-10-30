import type { I18nHeadInput } from '@i18n-micro/types'
import { useState } from '#app/composables/state'

/** The page's overrides. Plugins read this one, not `useI18nHead`: an app that never calls it ships no merge. */
export const usePageHead = () => useState<I18nHeadInput | null>('i18n-head-page', () => null)
