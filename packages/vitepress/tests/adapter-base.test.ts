// @vitest-environment jsdom
// VitePress `router.go` runs no `withBase`: what leaves the adapter has to carry the site base.
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { type Component, h } from 'vue'
import { createVitePressRouterAdapter } from '../src/router/adapter'

const locales = [
  { code: 'en', iso: 'en-US' },
  { code: 'fr', iso: 'fr-FR' },
]

type Go = (href: string, options?: { replace?: boolean }) => void

const adapter = (go: Go) => createVitePressRouterAdapter({ locales, defaultLocale: 'en', base: '/docs/', go, getPath: () => '/docs/fr/guide?x=1#h' })
const link = (go: Go) => mount({ render: () => h(adapter(go).linkComponent as Component, { to: '/fr/guide' }, () => 'L') })

describe('site base on the way out', () => {
  it('the link points under the base, and navigates there', () => {
    const go = vi.fn()
    const wrapper = link(go)
    expect(wrapper.find('a').attributes('href')).toBe('/docs/fr/guide')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    wrapper.find('a').element.dispatchEvent(event)
    expect(go).toHaveBeenCalledExactlyOnceWith('/docs/fr/guide')
    expect(event.defaultPrevented).toBe(true)
  })

  it('a modified click stays with the browser', () => {
    const go = vi.fn()
    link(go)
      .find('a')
      .element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, metaKey: true }))
    expect(go).not.toHaveBeenCalled()
  })

  it('push and replace add the base, paths stay relative to it', () => {
    const go = vi.fn()
    const routing = adapter(go)
    expect(routing.resolvePath!('/guide', 'fr')).toBe('/fr/guide')
    routing.push({ path: '/fr/guide' })
    routing.replace({ path: '/guide' })
    expect(go.mock.calls).toEqual([
      ['/docs/fr/guide', { replace: false }],
      ['/docs/guide', { replace: true }],
    ])
    expect(routing.toHref!('/fr/guide')).toBe('/docs/fr/guide')
  })

  it('a location keeps its query', () => {
    expect(adapter(vi.fn()).resolvePath!({ path: '/guide', query: { x: '1' }, hash: '#a' }, 'fr')).toBe('/fr/guide?x=1#a')
  })

  it('a location keeps its hash, and without a base nothing changes', () => {
    const go = vi.fn()
    expect(adapter(go).resolvePath!({ path: '/guide', hash: '#a' }, 'fr')).toBe('/fr/guide#a')
    createVitePressRouterAdapter({ locales, defaultLocale: 'en', go }).push({ path: '/fr/guide' })
    expect(go).toHaveBeenCalledWith('/fr/guide', { replace: false })
  })
})
