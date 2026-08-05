import type { Locale } from '@i18n-micro/types'
import type { I18nRoutingStrategy } from '@i18n-micro/vue'
import { defineComponent, h, type Component, type PropType } from 'vue'

export interface VitePressRouterLike {
  route: {
    path: string
    hash?: string
    query?: string
  }
  go: (to: string, options?: { initialLoad?: boolean, replace?: boolean }) => void | Promise<void>
  onAfterRouteChange?: (to: string) => unknown
}

export type VitePressGo = (href: string, options?: { replace?: boolean }) => void | Promise<void>

export interface VitePressRouterAdapterOptions {
  locales: Locale[]
  defaultLocale: string
  /**
   * Map VitePress locale keys (`root`, `fr`) to i18n locale codes.
   * Defaults: `root` → `defaultLocale`, other keys → same string as the key.
   * URL prefixes always use VitePress keys; i18n uses codes.
   */
  localeKeyToCode?: Record<string, string>
  getPath?: () => string
  go?: VitePressGo
}

export interface VitePressRouterAdapter extends I18nRoutingStrategy {
  getLocaleFromPath: (path: string) => string
  switchLocalePath: (path: string, newLocale: string) => string
  localizePath: (path: string, locale: string) => string
  removeLocaleFromPath: (path: string) => string
  /** Resolve VitePress locale key (`root` / `fr`) to i18n code. */
  codeFromLocaleKey: (localeKey: string) => string
  /** Resolve i18n code to VitePress locale key. */
  localeKeyFromCode: (code: string) => string
  localeCodes: string[]
  defaultLocale: string
  /** Snapshot of mapping used when building the adapter (for `i18nRouting` serialization). */
  localeKeyToCode: Record<string, string>
  /** URL path prefixes (VitePress locale keys except `root`). */
  urlPrefixes: string[]
}

function splitPathAndExtras(path: string): { pathname: string, extras: string } {
  const hashIndex = path.indexOf('#')
  const queryIndex = path.indexOf('?')
  let cut = path.length
  if (hashIndex >= 0) cut = Math.min(cut, hashIndex)
  if (queryIndex >= 0) cut = Math.min(cut, queryIndex)
  return {
    pathname: path.slice(0, cut) || '/',
    extras: path.slice(cut),
  }
}

/**
 * Build URL prefix → i18n code map.
 * Prefixes are VitePress locale keys (and codes when they differ), never `root`.
 */
export function buildUrlPrefixToCode(
  localeCodes: string[],
  defaultLocale: string,
  localeKeyToCode: Record<string, string> = {},
): Map<string, string> {
  const keyFromCode = (code: string): string => {
    for (const [key, mapped] of Object.entries(localeKeyToCode)) {
      if (mapped === code) return key
    }
    if (code === defaultLocale) return 'root'
    return code
  }

  const prefixToCode = new Map<string, string>()
  for (const code of localeCodes) {
    if (code === defaultLocale) continue
    const key = keyFromCode(code)
    const urlKey = key === 'root' ? code : key
    prefixToCode.set(urlKey, code)
    if (urlKey !== code) prefixToCode.set(code, code)
  }
  return prefixToCode
}

/**
 * Detect i18n locale code from a URL path (prefix_except_default).
 * Path prefixes are VitePress locale keys; return value is the i18n code.
 */
export function getLocaleFromPath(
  path: string,
  localeCodes: string[],
  defaultLocale: string,
  localeKeyToCode: Record<string, string> = {},
): string {
  const { pathname } = splitPathAndExtras(path)
  const first = pathname.split('/').filter(Boolean)[0]
  if (first === undefined) return defaultLocale
  const prefixToCode = buildUrlPrefixToCode(localeCodes, defaultLocale, localeKeyToCode)
  return prefixToCode.get(first) ?? defaultLocale
}

/**
 * Route name for page-scoped dictionaries (`/guide/demo` → `guide-demo`).
 * Strips VitePress URL prefixes (keys), not only raw i18n codes.
 */
export function routeNameFromPath(
  path: string,
  localeCodes: string[],
  defaultLocale?: string,
  localeKeyToCode: Record<string, string> = {},
): string {
  const { pathname } = splitPathAndExtras(path)
  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0]
  const prefixToCode = buildUrlPrefixToCode(
    localeCodes,
    defaultLocale ?? localeCodes[0] ?? 'en',
    localeKeyToCode,
  )
  if (first !== undefined && prefixToCode.has(first)) {
    segments.shift()
  }
  if (segments.length === 0) return 'index'
  return segments.join('-').replace(/\.html$/, '')
}

function createVitePressLinkComponent(go?: VitePressGo): Component {
  return defineComponent({
    name: 'VitePressI18nLink',
    props: {
      to: { type: String, required: true },
      style: { type: Object as PropType<Record<string, string>>, default: undefined },
    },
    setup(props, { slots }) {
      return () =>
        h(
          'a',
          {
            href: props.to,
            style: props.style,
            onClick: (e: MouseEvent) => {
              if (e.defaultPrevented) return
              if (e.button !== 0) return
              if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return
              e.preventDefault()
              if (go) {
                void go(props.to)
              }
              else if (typeof window !== 'undefined') {
                window.location.assign(props.to)
              }
            },
          },
          slots.default?.(),
        )
    },
  })
}

/**
 * VitePress path adapter (prefix_except_default semantics):
 * default locale has no URL prefix; other locales use `/{vitepressKey}/…`.
 * i18n locale values remain `locale.code` (via `localeKeyToCode`).
 */
export function createVitePressRouterAdapter(options: VitePressRouterAdapterOptions): VitePressRouterAdapter {
  const { locales, defaultLocale, localeKeyToCode = {}, getPath, go } = options
  const localeCodes = locales.map((loc) => loc.code)
  const localeKeyToCodeSnapshot = { ...localeKeyToCode }
  const prefixToCode = buildUrlPrefixToCode(localeCodes, defaultLocale, localeKeyToCodeSnapshot)
  const urlPrefixes = [...prefixToCode.keys()]

  const codeFromLocaleKey = (localeKey: string): string => {
    if (localeKeyToCodeSnapshot[localeKey]) return localeKeyToCodeSnapshot[localeKey]!
    if (localeKey === 'root') return defaultLocale
    return localeKey
  }

  const localeKeyFromCode = (code: string): string => {
    for (const [key, mapped] of Object.entries(localeKeyToCodeSnapshot)) {
      if (mapped === code) return key
    }
    if (code === defaultLocale) return 'root'
    return code
  }

  const urlPrefixForCode = (code: string): string | null => {
    if (code === defaultLocale) return null
    const key = localeKeyFromCode(code)
    return key === 'root' ? code : key
  }

  const stripPrefix = (pathname: string): { segments: string[], hadTrailingSlash: boolean } => {
    const hadTrailingSlash = pathname === '/' || pathname.endsWith('/')
    const segments = pathname.split('/').filter(Boolean)
    const first = segments[0]
    if (first !== undefined && prefixToCode.has(first)) {
      segments.shift()
    }
    return { segments, hadTrailingSlash }
  }

  const removeLocaleFromPath = (path: string): string => {
    const { pathname, extras } = splitPathAndExtras(path)
    const { segments, hadTrailingSlash } = stripPrefix(pathname)
    let clean = segments.length === 0 ? '/' : `/${segments.join('/')}`
    if (clean !== '/' && hadTrailingSlash) clean += '/'
    return `${clean}${extras}`
  }

  const localizePath = (path: string, locale: string): string => {
    const { pathname, extras } = splitPathAndExtras(path)
    const { segments, hadTrailingSlash } = stripPrefix(pathname)
    const prefix = urlPrefixForCode(locale)
    if (prefix) segments.unshift(prefix)
    let localized = segments.length === 0 ? '/' : `/${segments.join('/')}`
    if (localized !== '/' && hadTrailingSlash) localized += '/'
    return `${localized}${extras}`
  }

  const switchLocalePath = (path: string, newLocale: string): string => {
    return localizePath(path, newLocale)
  }

  const resolvePath = (to: string | { path?: string }, locale: string): string => {
    const path = typeof to === 'string' ? to : to.path || '/'
    return localizePath(path, locale)
  }

  const navigate = (href: string, replace = false) => {
    if (go) {
      void go(href, { replace })
      return
    }
    if (typeof window !== 'undefined') {
      if (replace) {
        window.location.replace(href)
      }
      else {
        window.location.assign(href)
      }
    }
  }

  return {
    localeCodes,
    defaultLocale,
    localeKeyToCode: localeKeyToCodeSnapshot,
    urlPrefixes,
    codeFromLocaleKey,
    localeKeyFromCode,
    getLocaleFromPath: (path: string) =>
      getLocaleFromPath(path, localeCodes, defaultLocale, localeKeyToCodeSnapshot),
    switchLocalePath,
    localizePath,
    removeLocaleFromPath,
    linkComponent: createVitePressLinkComponent(go),
    getCurrentPath: () => {
      if (getPath) return getPath()
      if (typeof window !== 'undefined') {
        return window.location.pathname + window.location.search + window.location.hash
      }
      return '/'
    },
    push: (target: { path: string }) => {
      navigate(target.path, false)
    },
    replace: (target: { path: string }) => {
      navigate(target.path, true)
    },
    resolvePath,
    getRoute: () => {
      const path = getPath
        ? getPath()
        : (typeof window !== 'undefined'
          ? window.location.pathname + window.location.search + window.location.hash
          : '/')
      const url = typeof window !== 'undefined'
        ? new URL(path, window.location.origin)
        : new URL(path, 'http://localhost')
      return {
        fullPath: url.pathname + url.search + url.hash,
        query: Object.fromEntries(url.searchParams),
      }
    },
  }
}
