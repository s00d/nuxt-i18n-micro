import { watch } from 'vue'
import { defineNuxtPlugin } from '#imports'

interface SwitchRule {
  cancel?: string[]
  redirect?: Record<string, string>
}

interface Probe {
  calls: { from: string; to: string }[]
  watched: { locale: string; text: string; lang: string }[]
  rule: SwitchRule
}

declare global {
  interface Window {
    __i18nSwitch?: Probe
  }
}

// Only with `?switch-probe` in the first URL: every other journey runs with no subscriber, as an app without one.
// `__i18nSwitch.rule` decides; `calls` and `watched` record what the hook and a `watch` of the locale saw.
export default defineNuxtPlugin((nuxtApp) => {
  if (!new URL(location.href).searchParams.has('switch-probe')) return
  const probe: Probe = (window.__i18nSwitch = { calls: [], watched: [], rule: {} })
  const hook = nuxtApp.hook as unknown as (name: string, fn: (ctx: { from: string; to: string; cancel: boolean }) => void) => void
  hook('i18n:beforeLocaleSwitch', (ctx) => {
    probe.calls.push({ from: ctx.from, to: ctx.to })
    if (probe.rule.cancel?.includes(ctx.to)) ctx.cancel = true
    const redirect = probe.rule.redirect?.[ctx.to]
    if (redirect) ctx.to = redirect
  })
  const app = nuxtApp as unknown as { $getLocale: () => string; $t: (key: string) => string }
  watch(
    () => app.$getLocale(),
    (locale) => probe.watched.push({ locale, text: app.$t('key0'), lang: document.documentElement.lang }),
  )
})
