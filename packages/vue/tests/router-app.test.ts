// A shop app the way the README wires it: createI18n + vue-router + createVueRouterAdapter, the
// built-in link and switcher, and useLocaleHead for SEO tags. Each test walks one user journey.
import type { Locale } from '@i18n-micro/types'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, test, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { createRouter, createWebHistory, RouterView } from 'vue-router'
import { createI18n, I18nLink, I18nSwitcher, useI18n, useLocaleHead } from '../src'
import { createVueRouterAdapter } from '../src/router'

const locales: Locale[] = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
  { code: 'ar', iso: 'ar-EG', dir: 'rtl', displayName: 'العربية' },
  { code: 'fr', iso: 'fr-FR', displayName: 'Français', disabled: true },
]

const messages = {
  en: { nav: { products: 'Products' }, home: { title: 'Welcome' }, products: { title: 'All products' } },
  de: { nav: { products: 'Produkte' }, home: { title: 'Willkommen' }, products: { title: 'Alle Produkte' } },
  ar: { nav: { products: 'منتجات' }, home: { title: 'أهلا' }, products: { title: 'كل المنتجات' } },
}

const Home = defineComponent({ setup: () => () => h('h1', useI18n().t('home.title')) })
// options-API page: the global $t the plugin installs
const Products = defineComponent({
  render() {
    return h('h1', this.$t('products.title'))
  },
})

async function mountShop(path: string, locale = 'en') {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/:locale(de|ar)?', component: Home },
      { path: '/:locale(de|ar)?/products', component: Products },
    ],
  })
  const i18n = createI18n({ locale, fallbackLocale: 'en', messages, locales, defaultLocale: 'en' })
  i18n.setRoutingStrategy(createVueRouterAdapter(router, locales, 'en'))
  let api!: ReturnType<typeof useI18n>
  let head!: ReturnType<typeof useLocaleHead>
  const App = defineComponent({
    setup() {
      api = useI18n()
      head = useLocaleHead({ baseUrl: 'https://shop.test' })
      head.updateMeta()
      return () =>
        h('div', [
          h(I18nLink, { to: '/products', activeStyle: { fontWeight: 'bold' } }, () => api.t('nav.products')),
          h(I18nSwitcher, { customLabels: { de: 'DE' } }),
          h(RouterView),
        ])
    },
  })
  await router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [router, i18n] }, attachTo: document.body })
  await flushPromises()
  return { wrapper, router, i18n, api: () => api, head: () => head }
}

let unmount: (() => void) | undefined
afterEach(() => unmount?.())

test('a visitor browses, switches language from code and from the switcher, and the URL follows', async () => {
  const { wrapper, router, i18n, api } = await mountShop('/')
  unmount = () => wrapper.unmount()
  const link = () => wrapper.find('a[href$="products"]')

  expect(wrapper.find('h1').text()).toBe('Welcome')
  expect(link().text()).toBe('Products')
  expect(link().attributes('href')).toBe('/products')
  expect(link().attributes('style')).toBeUndefined()

  await link().trigger('click')
  await flushPromises()
  expect(router.currentRoute.value.path).toBe('/products')
  expect(wrapper.find('h1').text()).toBe('All products')
  expect(link().attributes('style')).toBe('font-weight: bold;')
  // rendered by the strategy's RouterLink
  expect(link().classes()).toContain('router-link-active')

  // switchLocale moves the URL into the locale prefix and re-renders every translation
  api().switchLocale('de')
  await flushPromises()
  expect(router.currentRoute.value.path).toBe('/de/products')
  expect(i18n.global.getLocale()).toBe('de')
  expect(wrapper.find('h1').text()).toBe('Alle Produkte')
  expect(link().attributes('href')).toBe('/de/products')
  expect(link().text()).toBe('Produkte')
  expect(link().attributes('style')).toBe('font-weight: bold;')
  expect(api().getLocaleName()).toBe('Deutsch')
  expect(api().locale.value).toBe('de')

  // the switcher: closed by default, label from customLabels, opens on click
  const button = wrapper.find('button.i18n-switcher-button')
  expect(button.text()).toBe('DE▼')
  expect(button.attributes('aria-haspopup')).toBe('true')
  expect(button.attributes('ariahaspopup')).toBeUndefined()
  expect(button.attributes('aria-expanded')).toBe('false')
  expect(wrapper.find('.i18n-switcher-dropdown').exists()).toBe(false)
  await button.trigger('click')
  expect(button.attributes('aria-expanded')).toBe('true')
  // the disabled locale (fr) is not offered; hrefs point at the same page in each locale
  const items = wrapper.findAll('.i18n-switcher-dropdown a')
  expect(items.map((a) => [a.classes()[0], a.text(), a.attributes('href')])).toEqual([
    ['switcher-locale-en', 'English', '/products'],
    ['switcher-locale-de', 'DE', '/de/products'],
    ['switcher-locale-ar', 'العربية', '/ar/products'],
  ])
  // the current locale is marked active, the others are plain links
  expect(wrapper.find('.switcher-locale-de').attributes('style')).toBe(
    'display: block; padding: 8px 12px; color: rgb(0, 123, 255); text-decoration: none; transition: background-color 0.3s ease; cursor: not-allowed; font-weight: bold;',
  )
  expect(wrapper.find('.switcher-locale-en').attributes('style')).toBe(
    'display: block; padding: 8px 12px; color: rgb(51, 51, 51); text-decoration: none; transition: background-color 0.3s ease; cursor: pointer;',
  )

  // clicking outside closes it, clicking inside does not
  await wrapper.find('.i18n-switcher-dropdown').trigger('click')
  expect(wrapper.find('.i18n-switcher-dropdown').exists()).toBe(true)
  document.body.click()
  await flushPromises()
  expect(wrapper.find('.i18n-switcher-dropdown').exists()).toBe(false)

  // pick Arabic from the switcher: dropdown closes, locale and URL change
  await button.trigger('click')
  await wrapper.find('.switcher-locale-ar').trigger('click')
  await flushPromises()
  expect(wrapper.find('.i18n-switcher-dropdown').exists()).toBe(false)
  expect(router.currentRoute.value.path).toBe('/ar/products')
  expect(wrapper.find('h1').text()).toBe('كل المنتجات')
  expect(button.text()).toBe('العربية▼')

  // back to the default locale: the prefix is dropped
  await button.trigger('click')
  await wrapper.find('.switcher-locale-en').trigger('click')
  await flushPromises()
  expect(router.currentRoute.value.path).toBe('/products')
  expect(wrapper.find('h1').text()).toBe('All products')
})

test('path helpers and the adapter resolve localized paths both ways', async () => {
  const { wrapper, router, api } = await mountShop('/de', 'de')
  unmount = () => wrapper.unmount()
  const { localePath, localeRoute } = api()

  expect(wrapper.find('h1').text()).toBe('Willkommen')
  // the current locale is the default target
  expect(localePath('/products')).toBe('/de/products')
  expect(localePath('/de/products', 'en')).toBe('/products')
  expect(localePath('/ar/products', 'de')).toBe('/de/products')
  expect(localePath('/', 'en')).toBe('/')
  expect(localePath('/', 'ar')).toBe('/ar')
  expect(localePath({ path: '/products' }, 'ar')).toBe('/ar/products')
  expect(localePath({}, 'de')).toBe('/de')
  // a path segment that is not a locale is kept
  expect(localeRoute('/shop/de', 'en')).toBe('/shop/de')

  const adapter = createVueRouterAdapter(router, locales, 'en')
  expect(adapter.getCurrentPath()).toBe('/de')
  adapter.push({ path: '/de/products?sort=price' })
  await flushPromises()
  expect(adapter.getRoute?.()).toEqual({ fullPath: '/de/products?sort=price', query: { sort: 'price' } })
  expect(wrapper.find('h1').text()).toBe('Alle Produkte')
  adapter.replace({ path: '/de' })
  await flushPromises()
  expect(router.currentRoute.value.fullPath).toBe('/de')
  // a failed navigation is swallowed, the app stays where it was
  router.beforeEach((to) => to.path !== '/blocked')
  adapter.push({ path: '/blocked' })
  adapter.replace({ path: '/blocked' })
  await flushPromises()
  expect(router.currentRoute.value.fullPath).toBe('/de')
})

test('useLocaleHead builds lang, dir, canonical, hreflang and og tags for the current page', async () => {
  const { wrapper, router, api, head } = await mountShop('/de/products?utm=x', 'de')
  unmount = () => wrapper.unmount()

  expect(head().metaObject.value).toEqual({
    htmlAttrs: { lang: 'de-DE', dir: 'auto' },
    meta: [
      { id: 'i18n-og', property: 'og:locale', content: 'de_DE' },
      { id: 'i18n-og-url', property: 'og:url', content: 'https://shop.test/de/products' },
      { id: 'i18n-og-alt-en_US', property: 'og:locale:alternate', content: 'en_US' },
      { id: 'i18n-og-alt-ar_EG', property: 'og:locale:alternate', content: 'ar_EG' },
    ],
    link: [
      { id: 'i18n-can', rel: 'canonical', href: 'https://shop.test/de/products' },
      { id: 'i18n-alternate-en-US', rel: 'alternate', href: 'https://shop.test/products', hreflang: 'en-US' },
      { id: 'i18n-alternate-de-DE', rel: 'alternate', href: 'https://shop.test/de/products', hreflang: 'de-DE' },
      { id: 'i18n-alternate-ar-EG', rel: 'alternate', href: 'https://shop.test/ar/products', hreflang: 'ar-EG' },
      { id: 'i18n-xd', rel: 'alternate', href: 'https://shop.test/products', hreflang: 'x-default' },
    ],
  })

  // an rtl locale on an unprefixed-looking path
  api().switchLocale('ar')
  await flushPromises()
  await router.push('/ar')
  head().updateMeta()
  expect(head().metaObject.value.htmlAttrs).toEqual({ lang: 'ar-EG', dir: 'rtl' })
  expect(head().metaObject.value.meta[1]).toEqual({ id: 'i18n-og-url', property: 'og:url', content: 'https://shop.test/ar/' })

  // the default locale has no prefix to strip; called after setup (as from a route watcher)
  // it still emits x-default, and a whitelisted query param from the router stays on the canonical
  const warn = vi.spyOn(console, 'warn')
  api().switchLocale('en')
  await flushPromises()
  await router.push('/?page=2&utm=x')
  head().updateMeta(['page'])
  expect(router.currentRoute.value.path).toBe('/')
  expect(head().metaObject.value.htmlAttrs).toEqual({ lang: 'en-US', dir: 'auto' })
  expect(head().metaObject.value.link[0]).toEqual({ id: 'i18n-can', rel: 'canonical', href: 'https://shop.test/?page=2' })
  expect(head().metaObject.value.link.at(-1)).toEqual({ id: 'i18n-xd', rel: 'alternate', href: 'https://shop.test/', hreflang: 'x-default' })
  expect(warn).not.toHaveBeenCalled()
  warn.mockRestore()
})
