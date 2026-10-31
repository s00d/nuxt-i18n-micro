import type { I18nHeadInput } from '@i18n-micro/types'
import { hasInjectionContext, inject } from 'vue'
import { viewDepthKey } from 'vue-router'
import { useRoute } from '#app/composables/router'
import { useState } from '#app/composables/state'

/**
 * The page's overrides. Out of `composables/`, which is auto-imported. The merge stays in `02.meta`:
 * a page head set on the server only reaches the client in the payload, with no `useI18nHead` call there.
 */
export const usePageHead = () => useState<I18nHeadInput | null>('i18n-head-page', () => null)

/**
 * The route of the page the caller lives in, which stays on that page while the next one loads: a route that differs
 * from the router's means the page was left. Null outside a page (a `<RouterView>`): a layout or `app.vue` is never
 * left, and its own `useRoute()` lags until `page:finish`, so that comparison would read every navigation as leaving.
 */
export const usePageRoute = () => (hasInjectionContext() && inject(viewDepthKey, 0) ? useRoute() : null)
