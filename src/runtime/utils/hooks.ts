import type { I18nBeforeLocaleSwitchContext } from '@i18n-micro/types'

/** What of the NuxtApp a hook needs. Structural: the plugin types are inferred from the API that takes it. */
export interface HookHost {
  hooks: unknown
  callHook: unknown
}

/** Has `name` a subscriber? `_hooks` is hookable's own, so without it the hook just runs. */
export function hasSubscriber(nuxtApp: HookHost, name: string): boolean {
  const { _hooks: subscribers } = nuxtApp.hooks as unknown as { _hooks?: Record<string, unknown[] | undefined> }
  return !subscribers || Boolean(subscribers[name]?.length)
}

/** `i18n:beforeLocaleSwitch`: what the subscribers decided, or null when nobody listens (no context is made). */
export async function beforeLocaleSwitch(nuxtApp: HookHost, from: string, to: string): Promise<I18nBeforeLocaleSwitchContext | null> {
  if (!hasSubscriber(nuxtApp, 'i18n:beforeLocaleSwitch')) return null
  const ctx: I18nBeforeLocaleSwitchContext = { from, to, cancel: false }
  await (nuxtApp as { callHook: (name: string, ctx: I18nBeforeLocaleSwitchContext) => Promise<unknown> }).callHook('i18n:beforeLocaleSwitch', ctx)
  return ctx
}
