// One mount helper per side, so a matrix runs the Vue and the Nuxt component over the same inputs.
import { mount } from '@vue/test-utils'
import type { Translations } from '@i18n-micro/types'
import type { Component, Slots } from 'vue'
import { NuxtI18n } from '../../../../src/runtime/utils/nuxt-i18n'
import { I18nInjectionKey, I18nLocalesKey } from '../../src/injection'
import { VueI18n } from '../../src/composer'
import { app, NuxtLink, route } from './nuxt-stub'

export interface MountOptions {
  locale?: string
  props?: Record<string, unknown>
  attrs?: Record<string, unknown>
  slots?: Record<string, unknown>
  plural?: VueI18nPlural
  provide?: Record<symbol, unknown>
  components?: Record<string, Component>
}

type VueI18nPlural = ConstructorParameters<typeof VueI18n>[0]['plural']

export const quiet = { warnHandler: () => {} }

export function vueInstance(messages: Record<string, Translations>, locale = 'en', plural?: VueI18nPlural): VueI18n {
  return new VueI18n({ locale, fallbackLocale: 'en', messages, missingWarn: false, plural })
}

export function mountVue(component: Component, messages: Record<string, Translations>, options: MountOptions = {}) {
  const i18n = vueInstance(messages, options.locale, options.plural)
  const wrapper = mount(component as never, {
    props: options.props as never,
    attrs: options.attrs,
    slots: options.slots as never,
    attachTo: document.body,
    global: { provide: { [I18nInjectionKey as symbol]: i18n, ...options.provide }, config: quiet },
  })
  return { wrapper, i18n }
}

export function nuxtInstance(messages: Record<string, Translations>, locale = 'en', plural?: VueI18nPlural): NuxtI18n {
  const i18n = new NuxtI18n({ missingWarn: false, plural })
  i18n.setRouteContextResolver(() => ({ locale: i18n.getLocale(), routeName: 'index' }))
  i18n.applySwitchContext(locale, 'index', { ...messages[locale] } as Record<string, unknown>)
  return i18n
}

/** Fills the fake `useNuxtApp()` the way `01.plugin` does: `$`-names over one real instance. */
export function wireNuxtApp(i18n: NuxtI18n, extra: Record<string, unknown> = {}): void {
  for (const key of Object.keys(app)) delete app[key]
  Object.assign(app, {
    $_i18n: i18n,
    $getLocale: () => i18n.getLocale(),
    $_t: () => i18n.tForRoute(route),
    $t: i18n.t.bind(i18n),
    $tc: i18n.tc.bind(i18n),
    $pluralFunc: i18n.pluralFunc,
    $pluralLocale: i18n.pluralLocale.bind(i18n),
    $tn: i18n.tn.bind(i18n),
    $td: i18n.td.bind(i18n),
    $tdr: i18n.tdr.bind(i18n),
    ...extra,
  })
}

export function mountNuxt(component: Component, messages: Record<string, Translations>, options: MountOptions = {}) {
  const i18n = nuxtInstance(messages, options.locale, options.plural)
  wireNuxtApp(i18n, options.provide as Record<string, unknown>)
  const wrapper = mount(component as never, {
    props: options.props as never,
    attrs: options.attrs,
    slots: options.slots as never,
    attachTo: document.body,
    global: { components: { NuxtLink, ...options.components }, config: quiet, mocks: app },
  })
  return { wrapper, i18n }
}

export type Mounted = ReturnType<typeof mountVue>['wrapper']

/** A component's HTML, or how it failed: a throw from render is a result here. */
export function htmlOf(mountIt: () => { wrapper: Mounted }): string {
  try {
    const { wrapper } = mountIt()
    const html = wrapper.html()
    wrapper.unmount()
    return html || '(nothing)'
  } catch (error) {
    return `throws ${(error as Error).name}: ${(error as Error).message}`
  }
}

export type { Slots }
export { I18nLocalesKey }
