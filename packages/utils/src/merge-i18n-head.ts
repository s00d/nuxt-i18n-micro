import type { I18nHeadInput, I18nHeadLink, I18nHeadMeta, Locale } from '@i18n-micro/types'
import { resolveOgLocale } from './resolve-og-locale'

export interface I18nHeadObject {
  htmlAttrs: Record<string, string | undefined>
  meta: I18nHeadMeta[]
  link: I18nHeadLink[]
}

export interface MergeI18nHeadOptions {
  identifierAttribute?: string
  locales?: Locale[]
  currentLocale?: string
}

function isAlternateLink(link: I18nHeadLink): boolean {
  return link.rel === 'alternate'
}

function isXDefaultLink(link: I18nHeadLink): boolean {
  return link.rel === 'alternate' && link.hreflang === 'x-default'
}

function isHreflangLink(link: I18nHeadLink): boolean {
  return link.rel === 'alternate' && link.hreflang !== 'x-default'
}

function metaKey(meta: I18nHeadMeta, identifierAttribute: string): string {
  const id = meta[identifierAttribute]
  if (id) return `id:${id}`
  if (meta.property) return `property:${meta.property}`
  if (meta.name) return `name:${meta.name}`
  return `meta:${JSON.stringify(meta)}`
}

function linkKey(link: I18nHeadLink, identifierAttribute: string): string {
  const id = link[identifierAttribute]
  if (id) return `id:${id}`
  return `link:${link.rel}:${link.hreflang ?? ''}`
}

function linkMatchKeys(link: I18nHeadLink, identifierAttribute: string): string[] {
  const keys = new Set<string>([linkKey(link, identifierAttribute)])
  if (link.rel === 'alternate' && link.hreflang) {
    keys.add(`link:${link.rel}:${link.hreflang}`)
  }
  if (link.rel === 'canonical') {
    keys.add('link:canonical:')
  }
  return [...keys]
}

function shouldReplaceMeta(existing: I18nHeadMeta, item: I18nHeadMeta, identifierAttribute: string): boolean {
  if (metaKey(existing, identifierAttribute) === metaKey(item, identifierAttribute)) return true
  if (item.property && existing.property === item.property) return true
  if (item.name && existing.name === item.name) return true
  const itemId = item[identifierAttribute]
  if (itemId && existing[identifierAttribute] === itemId) return true
  return false
}

function upsertMeta(metaList: I18nHeadMeta[], item: I18nHeadMeta, identifierAttribute: string): I18nHeadMeta[] {
  const next = metaList.filter((m) => !shouldReplaceMeta(m, item, identifierAttribute))
  next.push(item)
  return next
}

function upsertLink(linkList: I18nHeadLink[], item: I18nHeadLink, identifierAttribute: string): I18nHeadLink[] {
  const keys = new Set(linkMatchKeys(item, identifierAttribute))
  const next = linkList.filter((l) => !linkMatchKeys(l, identifierAttribute).some((key) => keys.has(key)))
  next.push(item)
  return next
}

function replaceCanonicalLink(linkList: I18nHeadLink[], href: string, identifierAttribute: string): I18nHeadLink[] {
  let replaced = false
  const next = linkList.map((link) => {
    if (link.rel !== 'canonical') return link
    replaced = true
    return { ...link, href }
  })
  if (!replaced) {
    next.unshift({
      [identifierAttribute]: 'i18n-can',
      rel: 'canonical',
      href,
    })
  }
  return next
}

function replaceMetaProperty(metaList: I18nHeadMeta[], property: string, content: string, identifierAttribute: string, id?: string): I18nHeadMeta[] {
  const filtered = metaList.filter((m) => m.property !== property)
  filtered.push({
    [identifierAttribute]: id ?? (property === 'og:locale' ? 'i18n-og' : property === 'og:url' ? 'i18n-og-url' : `i18n-page-${property}`),
    property,
    content,
  })
  return filtered
}

function buildOgAlternates(localeCodes: string[], locales: Locale[], currentLocale: string | undefined, identifierAttribute: string): I18nHeadMeta[] {
  const result: I18nHeadMeta[] = []
  for (const code of localeCodes) {
    if (currentLocale && code === currentLocale) continue
    const locale = locales.find((loc) => loc.code === code)
    if (!locale) continue
    const og = resolveOgLocale(locale)
    if (!og) continue
    result.push({
      [identifierAttribute]: `i18n-og-alt-${og}`,
      property: 'og:locale:alternate',
      content: og,
    })
  }
  return result
}

export function mergeI18nHead(base: I18nHeadObject, override: I18nHeadInput | null | undefined, options: MergeI18nHeadOptions = {}): I18nHeadObject {
  if (!override) {
    return {
      htmlAttrs: { ...base.htmlAttrs },
      meta: [...base.meta],
      link: [...base.link],
    }
  }

  const identifierAttribute = options.identifierAttribute ?? 'id'
  const disable = new Set(override.disable ?? [])

  let htmlAttrs = { ...base.htmlAttrs }
  let meta = [...base.meta]
  let link = [...base.link]

  if (disable.has('html')) {
    htmlAttrs = {}
  }

  if (disable.has('hreflang')) {
    link = link.filter((item) => !isHreflangLink(item))
  }

  if (disable.has('x-default')) {
    link = link.filter((item) => !isXDefaultLink(item))
  }

  if (disable.has('canonical')) {
    link = link.filter((item) => item.rel !== 'canonical')
  }

  if (disable.has('og')) {
    meta = meta.filter((item) => item.property !== 'og:locale' && item.property !== 'og:url')
  }

  if (disable.has('og-alternates')) {
    meta = meta.filter((item) => item.property !== 'og:locale:alternate')
  }

  const replace = override.replace
  if (replace) {
    if (replace.canonical === false) {
      link = link.filter((item) => item.rel !== 'canonical')
    } else if (typeof replace.canonical === 'string') {
      link = replaceCanonicalLink(link, replace.canonical, identifierAttribute)
    }

    if (replace.hreflang === false) {
      link = link.filter((item) => !isAlternateLink(item))
    } else if (Array.isArray(replace.hreflang)) {
      link = link.filter((item) => !isAlternateLink(item))
      link.push(...replace.hreflang)
    }

    if (replace.xDefault === false) {
      link = link.filter((item) => !isXDefaultLink(item))
    } else if (replace.xDefault) {
      link = link.filter((item) => !isXDefaultLink(item))
      link.push(replace.xDefault)
    }

    if (replace.ogLocale === false) {
      meta = meta.filter((item) => item.property !== 'og:locale')
    } else if (typeof replace.ogLocale === 'string') {
      meta = replaceMetaProperty(meta, 'og:locale', replace.ogLocale, identifierAttribute)
    }

    if (replace.ogUrl === false) {
      meta = meta.filter((item) => item.property !== 'og:url')
    } else if (typeof replace.ogUrl === 'string') {
      meta = replaceMetaProperty(meta, 'og:url', replace.ogUrl, identifierAttribute)
    }

    if (replace.ogAlternates === false) {
      meta = meta.filter((item) => item.property !== 'og:locale:alternate')
    } else if (Array.isArray(replace.ogAlternates)) {
      meta = meta.filter((item) => item.property !== 'og:locale:alternate')
      const locales = options.locales ?? []
      meta.push(...buildOgAlternates(replace.ogAlternates, locales, options.currentLocale, identifierAttribute))
    }
  }

  if (override.htmlAttrs) {
    htmlAttrs = { ...htmlAttrs, ...override.htmlAttrs }
  }

  for (const item of override.meta ?? []) {
    meta = upsertMeta(meta, item, identifierAttribute)
  }

  for (const item of override.link ?? []) {
    link = upsertLink(link, item, identifierAttribute)
  }

  return { htmlAttrs, meta, link }
}
