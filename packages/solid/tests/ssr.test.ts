// @vitest-environment node
// dist is compiled for the DOM and cannot even be imported on a server. The `solid` export condition
// hands bundlers with vite-plugin-solid the source, so an SSR build compiles it for the server.
import { resolve } from 'node:path'
import { createServer } from 'vite'
import solid from 'vite-plugin-solid'
import { expect, test } from 'vitest'

test('the package renders on the server through its solid export condition', async () => {
  const server = await createServer({
    configFile: false,
    root: resolve(import.meta.dirname, '..'),
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true, ws: false, watch: null },
    plugins: [solid({ ssr: true })],
    ssr: { noExternal: ['@i18n-micro/solid'] },
  })
  try {
    const { createComponent, renderToString } = await server.ssrLoadModule('solid-js/web')
    const { createI18n, I18nProvider, I18nSwitcher, I18nT, useI18n } = await server.ssrLoadModule('@i18n-micro/solid')
    const i18n = createI18n({ locale: 'en', messages: { en: { hi: 'Hello {name}', title: 'Root' } } })
    const Greeting = () => useI18n().t('hi', { name: 'A' })
    const html = renderToString(() =>
      createComponent(I18nProvider, {
        i18n,
        locales: [{ code: 'en' }],
        defaultLocale: 'en',
        get children() {
          return [createComponent(Greeting, {}), createComponent(I18nT, { keypath: 'title' }), createComponent(I18nSwitcher, {})]
        },
      }),
    )
    expect(html).toContain('Hello A')
    expect(html).toContain('Root')
    expect(html).toContain('i18n-switcher-button')
  } finally {
    await server.close()
  }
})
