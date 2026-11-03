// @vitest-environment node
// The real path: server render through the `solid` condition, a hydratable client bundle, a DOM.
import { resolve } from 'node:path'
import { JSDOM } from 'jsdom'
import { build, createServer } from 'vite'
import solid from 'vite-plugin-solid'
import { expect, test } from 'vitest'

const root = resolve(import.meta.dirname, '..')

/** One app for both sides, without JSX: the virtual module skips the Solid compiler. */
const APP = `
  import { createComponent } from 'solid-js'
  import { createI18n, I18nGroup, I18nLink, I18nProvider, I18nSwitcher, I18nT, useI18n } from '@i18n-micro/solid'
  const messages = {
    en: { hi: 'Hello {name}', order: '{a} then {b}', posted: 'Posted {date}', apples: 'one | {count} apples', rich: '<b>{n}</b>', blank: '  ' },
    de: { hi: 'Hallo {name}', order: '{b} dann {a}' },
  }
  const Greeting = () => useI18n().t('hi', { name: 'A' })
  const tree = () => [
    createComponent(Greeting, {}),
    createComponent(I18nT, { keypath: 'hi', params: { name: 'B' }, id: 'plain' }),
    createComponent(I18nT, { keypath: 'order', tag: 'p', components: { a: () => 'x', b: () => 'y' } }),
    createComponent(I18nT, { keypath: 'rich', html: true, params: { n: 1 } }),
    createComponent(I18nT, { keypath: 'blank', hideIfEmpty: true, defaultValue: 'dv' }),
    createComponent(I18nT, { keypath: 'posted', date: new Date('2024-01-15T23:30:00Z') }),
    createComponent(I18nT, { keypath: 'apples', plural: 2 }),
    createComponent(I18nLink, { to: '/x', children: 'link' }),
    createComponent(I18nGroup, { prefix: 'g', children: 'group' }),
    createComponent(I18nSwitcher, {}),
  ]
  export function App(i18n) {
    return createComponent(I18nProvider, { i18n, locales: [{ code: 'en' }, { code: 'de' }], get children() { return tree() } })
  }
  export const make = () => createI18n({ locale: 'en', fallbackLocale: 'en', messages, timeZone: 'UTC', missingWarn: false })
`

const virtualApp = {
  name: 'virtual-app',
  resolveId: (id: string) => (id === 'virtual:app' || id === 'virtual:client' ? `\0${id}` : undefined),
  load: (id: string) =>
    id === '\0virtual:app'
      ? APP
      : id === '\0virtual:client'
        ? `import { hydrate } from 'solid-js/web'
           import { App, make } from 'virtual:app'
           window.i18n = make()
           window.dispose = hydrate(() => App(window.i18n), document.getElementById('root'))`
        : undefined,
}

async function serverHtml() {
  const server = await createServer({
    configFile: false,
    root,
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true, ws: false, watch: null },
    plugins: [solid({ ssr: true }), virtualApp],
    ssr: { noExternal: ['@i18n-micro/solid'] },
  })
  try {
    const { generateHydrationScript, renderToString } = await server.ssrLoadModule('solid-js/web')
    const { App, make } = await server.ssrLoadModule('virtual:app')
    return { html: renderToString(() => App(make())) as string, script: generateHydrationScript() as string }
  } finally {
    await server.close()
  }
}

async function clientBundle() {
  const result = await build({
    configFile: false,
    root,
    logLevel: 'silent',
    plugins: [solid({ ssr: true }), virtualApp],
    resolve: { conditions: ['solid', 'browser', 'module', 'import', 'default'] },
    build: { write: false, minify: false, rollupOptions: { input: 'virtual:client', output: { format: 'iife', inlineDynamicImports: true } } },
  })
  const { output } = (Array.isArray(result) ? result[0] : result) as { output: { type: string; code?: string }[] }
  return output.find((chunk) => chunk.type === 'chunk')!.code!
}

test('server HTML hydrates and stays reactive', async () => {
  const [{ html, script }, code] = await Promise.all([serverHtml(), clientBundle()])
  const dom = new JSDOM(`<!doctype html><head>${script}</head><body><div id="root">${html}</div></body>`, { runScripts: 'dangerously' })
  const errors: unknown[] = []
  dom.window.addEventListener('error', (event) => errors.push(event.message))
  const before = dom.window.document.getElementById('plain')
  dom.window.eval(code)
  expect(errors).toEqual([])
  const root = dom.window.document.getElementById('root')!
  // adopted, not rebuilt
  expect(dom.window.document.getElementById('plain')).toBe(before)
  expect(root.textContent).toContain('x then y')
  expect(root.textContent).toContain('Posted 1/15/2024')
  ;(dom.window as unknown as { i18n: { locale: string } }).i18n.locale = 'de'
  expect(dom.window.document.getElementById('plain')!.textContent).toBe('Hallo B')
  expect(root.textContent).toContain('y dann x')
  dom.window.close()
}, 60_000)
