import type { PathStrategy, RouteI18nMeta } from '@i18n-micro/path-strategy'
import type { ResolvedI18nConfig, Translations } from '@i18n-micro/types'
import type { ComponentPublicInstance } from 'vue'
import type { RouteLocationNormalizedGeneric, RouteLocationNormalizedLoaded, Router } from 'vue-router'
import type { NuxtApp } from '#app/nuxt'
import { hooks } from '#build/i18n.strategy.mjs'
import type { useI18nLocale } from '../composables/useI18nLocale'
import type { NuxtI18nPluginApi } from './i18n-api'
import type { NuxtI18n, NuxtTranslationLoader } from './nuxt-i18n'

interface NavigationTarget {
  locale: string
  routeName: string
  changed: boolean
  /** The loaded chunk, null when its load failed. */
  data: Record<string, unknown> | null
}

export interface I18nNavigationDeps {
  nuxtApp: NuxtApp
  router: Router
  i18n: NuxtI18n
  loader: NuxtTranslationLoader
  i18nConfig: ResolvedI18nConfig
  i18nStrategy: PathStrategy
  locale: ReturnType<typeof useI18nLocale>
  api: NuxtI18nPluginApi
  /** The page changed: what the last one set for itself (route params, head) goes. */
  leavePage: () => void
}

/**
 * The leaving page's keys stay resolvable until it is gone. Hooks cannot say when: a page transition keeps it on
 * screen past `page:finish`, so does a new layout until its own async parts are ready and through its transition, and
 * a child leaving for its parent has no `page:finish` at all. Its element leaving the document covers all of them.
 * A DOM change is what removes it, so an observer sees it with no polling, in a hidden tab too.
 * ponytail: a `<NuxtPage page-key>` keeping one instance across records keeps the observer and those keys until the next navigation
 */
function createOutgoingWatch(nuxtApp: NuxtApp, i18n: NuxtI18n) {
  let stopWaiting: (() => void) | undefined
  let noElement: Record<string, unknown> | null = null
  nuxtApp.hook('page:finish', () => {
    i18n.finishTransition(noElement)
    noElement = null
  })
  return (page: ComponentPublicInstance | null | undefined) => {
    stopWaiting?.()
    noElement = null
    const outgoing = i18n.outgoing
    const element: Node | undefined = page?.$el
    if (!element?.isConnected) {
      noElement = outgoing
      return
    }
    if (!outgoing) return
    const observer = new MutationObserver(() => {
      if (element.isConnected) return
      stopWaiting?.()
      i18n.finishTransition(outgoing)
    })
    observer.observe(document, { childList: true, subtree: true })
    stopWaiting = () => {
      observer.disconnect()
      stopWaiting = undefined
    }
  }
}

/** `i18n:register`, for the chunk of one locale and page. Costs a lookup with no subscriber, who may come later. */
function createRegister(nuxtApp: NuxtApp, { mergeTranslation }: NuxtI18nPluginApi['helper']) {
  /** `_hooks` is hookable's own, so without it the hook just runs. */
  const subscribed = () => {
    const { _hooks: subscribers } = nuxtApp.hooks as unknown as { _hooks?: Record<string, unknown[] | undefined> }
    return !subscribers || Boolean(subscribers['i18n:register']?.length)
  }
  return async (locale: string, routeName: string) => {
    if (!subscribed()) return
    const merges: Promise<void>[] = []
    const register = (translations: unknown, selectedLocale?: string) => {
      merges.push(mergeTranslation(selectedLocale ?? locale, routeName, translations as Translations))
    }
    await nuxtApp.callHook('i18n:register', register, locale)
    await Promise.all(merges)
  }
}

/**
 * Translations follow navigations: a guard loads what the target shows, and it is applied when the navigation commits.
 * A guard is too early: a later guard can abort, and the router cancels a pending navigation for a duplicate of the
 * current page without running one.
 * ponytail: a file of its own, like `i18n-api`, keeps the plugin a flat list of steps for about 300 B gzip of property names. Inline them if a bundle budget needs it.
 */
export function setupI18nNavigation(deps: I18nNavigationDeps): void {
  const { nuxtApp, router, i18n, loader, i18nConfig, i18nStrategy, api, leavePage } = deps
  const noPrefix = i18nConfig.strategy === 'no_prefix'
  const { locale: localeState, getPreferredLocale, isValidLocale, setLocale } = deps.locale

  const finishWhenGone = createOutgoingWatch(nuxtApp, i18n)
  const register = createRegister(nuxtApp, api.helper)
  const targets = new WeakMap<object, NavigationTarget>()

  // After every plugin, as subscribers are plugins, and before the app renders. Nuxt awaits it.
  if (hooks) nuxtApp.hooks.hookOnce('app:created', () => register(i18n.getLocale(), i18n.getCurrentRouteName()))

  const loadTarget = async (to: RouteLocationNormalizedGeneric): Promise<NavigationTarget | undefined> => {
    try {
      const hashLocale = i18nConfig.hashMode ? i18nStrategy.getLocaleFromPath(to.path) : null
      const locale = hashLocale || api.provide.getLocale(to as unknown as RouteLocationNormalizedLoaded)
      const routeName = i18nStrategy.getPluginRouteName(to, locale)
      const changed = locale !== i18n.getLocale() || routeName !== i18n.getCurrentRouteName()
      return { locale, routeName, changed, data: changed ? await loader.fetchContext(locale, routeName) : null }
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') console.error('[i18n] Navigation error:', e)
      return undefined
    }
  }

  router.beforeEach(async (to, from) => {
    if (to.path === from.path && !noPrefix) return

    // `noPrefixRedirect`: the page's original path sends the visitor to their locale's custom path, a locale without one stays
    const paths = noPrefix ? (to.matched.at(-1)?.meta.i18n as RouteI18nMeta | undefined)?.paths : undefined
    const customPath = paths?.[api.provide.getLocale(to as unknown as RouteLocationNormalizedLoaded)]
    if (customPath) return { path: customPath, query: to.query, hash: to.hash }

    // a navigation is newer than any `$switchLocale` still loading
    loader.invalidatePendingSwitches()
    const target = await loadTarget(to)
    if (!target) return
    targets.set(to, target)
    // into the chunk just loaded. A subscriber that throws stops the navigation, as any guard does
    if (hooks) await register(target.locale, target.routeName)
  })

  router.afterEach((to, from, failure) => {
    if (failure) return

    // The path decides, not the name: `/news/1` to `/news/4` is one route name and another page, and Nuxt clears
    // `name` on the current route before its hydrating replace. That replace keeps the path, so what the server page
    // set stays: it came in the payload, and a component that does not run here (`hydrate-never`) will not set it again
    if (to.path !== from.path) leavePage()

    const target = targets.get(to)
    if (!target) return
    const { locale, routeName, changed, data } = target

    // the stored chunk: `i18n:register` merged into it after this guard's load. Not after a failed load: what
    // a subscriber wrote is a fragment, and the strings on screen stay
    const applied = !changed || loader.applyContext(locale, routeName, data && (loader.loadFromCacheSync(locale, routeName) ?? data))
    // A parent stays around its new child, and its keys with it, until the next navigation replaces them. The page that
    // owns this dictionary is its leaf and, for an index child, the parent on the same URL: any of them still here keeps it.
    const left = from.matched.at(-1)
    const stays = from.matched.some((record) => record.path === left?.path && to.matched.includes(record))
    if (changed && applied && !stays) finishWhenGone(left?.instances.default)
    // under no_prefix a page can be bound to its locale: it shows it, and the preference stays for the next page
    const bound = noPrefix && locale !== (getPreferredLocale() ?? i18nConfig.defaultLocale)
    if (!applied || bound || !locale || !isValidLocale(locale)) return
    // a 404 renders in its URL's locale and stores nothing, as on the server: no page, no choice
    if (!to.matched.length) {
      localeState.value = locale
      return
    }
    // Where the URL names the locale, reaching a page is the visitor's choice, with the state already on it too: the
    // server stores a prefixed page only (06.redirect), not an unprefixed page's locale. A first load stays out of it,
    // redirected or not, as it would replace the preference `/` goes by: on both sides Nuxt runs the middleware of that
    // load in a second navigation, so `from` cannot tell it. Without a locale in the URL only a change is a choice.
    const urlNamed = !noPrefix && !i18nConfig.hashMode && import.meta.client && !nuxtApp.isHydrating
    if (urlNamed || localeState.value !== locale) setLocale(locale)
  })
}
