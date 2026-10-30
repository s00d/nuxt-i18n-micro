import { describe, expect, it, vi } from 'vitest'
import { createVitePressRouterAdapter, routeNameFromPath } from '../src/router/adapter'
import { createI18nRoutingFromAdapter } from '../src/router/i18n-routing'

const locales = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'fr', iso: 'fr-FR', displayName: 'Français' },
]

describe('createVitePressRouterAdapter', () => {
  const adapter = createVitePressRouterAdapter({
    locales,
    defaultLocale: 'en',
  })

  it('switches locale preserving extras', () => {
    expect(adapter.switchLocalePath('/guide/demo', 'fr')).toBe('/fr/guide/demo')
    expect(adapter.switchLocalePath('/fr/guide/demo', 'en')).toBe('/guide/demo')
    expect(adapter.switchLocalePath('/guide/demo#section', 'fr')).toBe('/fr/guide/demo#section')
    expect(adapter.switchLocalePath('/guide/demo?x=1', 'fr')).toBe('/fr/guide/demo?x=1')
  })

  it('maps root locale key', () => {
    expect(adapter.codeFromLocaleKey('root')).toBe('en')
    expect(adapter.codeFromLocaleKey('fr')).toBe('fr')
    expect(adapter.localeKeyFromCode('en')).toBe('root')
    expect(adapter.localeKeyFromCode('fr')).toBe('fr')
  })

  it('resolvePath matches switch semantics', () => {
    expect(adapter.resolvePath?.('/about', 'fr')).toBe('/fr/about')
    expect(adapter.resolvePath?.('/fr/about', 'en')).toBe('/about')
  })

  it('passes replace to go()', () => {
    const go = vi.fn()
    const withGo = createVitePressRouterAdapter({
      locales,
      defaultLocale: 'en',
      go,
    })
    withGo.replace({ path: '/fr/' })
    expect(go).toHaveBeenCalledWith('/fr/', { replace: true })
    withGo.push({ path: '/guide/' })
    expect(go).toHaveBeenCalledWith('/guide/', { replace: false })
  })

  it('exposes linkComponent', () => {
    expect(adapter.linkComponent).toBeTruthy()
  })

  it('exposes routeNameFromPath on the adapter', () => {
    expect(adapter.routeNameFromPath('/fr/guide/demo')).toBe('guide-demo')
    expect(adapter.routeNameFromPath('/')).toBe('index')
  })
})

describe('routeNameFromPath', () => {
  it('strips locale codes without guessing default from localeCodes[0]', () => {
    // Codes listed default-last — must still strip /fr/
    expect(routeNameFromPath('/fr/guide', ['fr', 'en'])).toBe('guide')
    expect(routeNameFromPath('/guide', ['fr', 'en'])).toBe('guide')
  })

  it('uses defaultLocale + localeKeyToCode when provided', () => {
    expect(routeNameFromPath('/fr/guide', ['en-US', 'fr-FR'], 'en-US', { root: 'en-US', fr: 'fr-FR' })).toBe('guide')
  })
})

describe('createI18nRoutingFromAdapter', () => {
  const i18nRouting = createI18nRoutingFromAdapter({
    defaultLocale: 'en',
    localeCodes: ['en', 'fr'],
  })

  it('preserves localeKeyToCode and uses VP keys in URLs', () => {
    const adapter = createVitePressRouterAdapter({
      locales: [
        { code: 'en-US', iso: 'en-US' },
        { code: 'fr-FR', iso: 'fr-FR' },
      ],
      defaultLocale: 'en-US',
      localeKeyToCode: { root: 'en-US', fr: 'fr-FR' },
    })
    const routing = createI18nRoutingFromAdapter(adapter)
    expect(routing.toString()).toContain('"fr-FR"')
    expect(routing({}, { path: '/about' }, 'fr')).toBe('/fr/about')
    expect(routing({}, { path: '/fr/about' }, 'root')).toBe('/about')
  })
})
