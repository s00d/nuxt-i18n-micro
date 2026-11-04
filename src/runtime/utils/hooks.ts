import type { I18nBeforeLocaleSwitchContext } from '@i18n-micro/types'
import type { NuxtApp } from 'nuxt/app'

/** What of the NuxtApp a hook needs. */
export type HookHost = Pick<NuxtApp, 'hooks' | 'callHook'>

/** Has `name` a subscriber? `_hooks` is hookable's own, so without it the hook just runs. */
export function hasSubscriber(nuxtApp: HookHost, name: string): boolean {
  const { _hooks: subscribers } = nuxtApp.hooks as unknown as { _hooks?: Record<string, unknown[] | undefined> }
  return !subscribers || Boolean(subscribers[name]?.length)
}

/** `i18n:beforeLocaleSwitch`: what the subscribers decided, or null when nobody listens (no context is made). */
export async function beforeLocaleSwitch(nuxtApp: HookHost, from: string, to: string): Promise<I18nBeforeLocaleSwitchContext | null> {
  if (!hasSubscriber(nuxtApp, 'i18n:beforeLocaleSwitch')) return null
  const ctx: I18nBeforeLocaleSwitchContext = { from, to, cancel: false }
  await nuxtApp.callHook('i18n:beforeLocaleSwitch', ctx)
  return ctx
}
