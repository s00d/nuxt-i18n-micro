/**
 * SSG smoke: build playground and assert translations / SEO / routing in HTML.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(pkgRoot, 'playground/.vitepress/dist')

function html(rel: string): string {
  return readFileSync(join(dist, rel), 'utf8')
}

beforeAll(() => {
  execFileSync('pnpm', ['exec', 'vitepress', 'build', 'playground'], {
    cwd: pkgRoot,
    stdio: 'pipe',
    timeout: 120_000,
  })
  expect(existsSync(join(dist, 'guide/demo.html'))).toBe(true)
}, 120_000)

describe('playground SSG stack', () => {
  it('injects root UI translations per locale', () => {
    expect(html('guide/demo.html')).toContain('This string comes from locales/en.json')
    expect(html('guide/demo.html')).toContain('Hello, Docs!')
    expect(html('guide/demo.html')).toContain('3 apples')

    expect(html('fr/guide/demo.html')).toContain('Cette chaîne vient de locales/fr.json')
    expect(html('fr/guide/demo.html')).toContain('Bonjour, Docs!')
    expect(html('fr/guide/demo.html')).toContain('3 pommes')

    expect(html('de/guide/demo.html')).toContain('Dieser String kommt aus locales/de.json')
    expect(html('de/guide/demo.html')).toContain('Hallo, Docs!')
    expect(html('de/guide/demo.html')).toContain('3 Äpfel')
  })

  it('injects page-scoped dictionaries on guide/demo', () => {
    expect(html('guide/demo.html')).toContain('locales/pages/guide/demo/en.json')
    expect(html('fr/guide/demo.html')).toContain('locales/pages/guide/demo/fr.json')
    expect(html('de/guide/demo.html')).toContain('locales/pages/guide/demo/de.json')
  })

  it('wires language switcher links for all locales', () => {
    const en = html('guide/demo.html')
    expect(en).toContain('href="/fr/guide/demo"')
    expect(en).toContain('href="/de/guide/demo"')
    expect(en).toContain('hreflang="fr-FR"')
    expect(en).toContain('hreflang="de-DE"')

    const fr = html('fr/guide/demo.html')
    expect(fr).toContain('href="/guide/demo"')
    expect(fr).toContain('href="/de/guide/demo"')
  })

  it('injects SEO head on normal pages', () => {
    const en = html('guide/demo.html')
    expect(en).toContain('id="i18n-can"')
    expect(en).toContain('href="https://example.com/guide/demo"')
    expect(en).toContain('property="og:locale"')
    expect(en).toContain('content="en_US"')
    expect(en).toContain('hreflang="fr-FR"')
    expect(en).toContain('hreflang="de-DE"')
    expect(en).toContain('hreflang="x-default"')

    const de = html('de/guide/demo.html')
    expect(de).toContain('href="https://example.com/de/guide/demo"')
    expect(de).toContain('content="de_DE"')
  })

  it('skips SEO head when i18n.disableMeta is true', () => {
    const page = html('guide/no-seo.html')
    expect(page).not.toContain('id="i18n-can"')
    expect(page).not.toContain('id="i18n-og"')
    expect(page).toContain('This string comes from locales/en.json')

    expect(html('fr/guide/no-seo.html')).not.toContain('id="i18n-can"')
    expect(html('de/guide/no-seo.html')).not.toContain('id="i18n-can"')
  })

  it('localizes I18nLink targets on home', () => {
    expect(html('index.html')).toContain('Hello, VitePress!')
    expect(html('index.html')).toMatch(/href="\/guide\/demo"/)

    expect(html('fr/index.html')).toContain('Bonjour, VitePress!')
    // I18nLink should prefix locale for non-default
    expect(html('fr/index.html')).toMatch(/href="\/fr\/guide\/demo"/)

    expect(html('de/index.html')).toContain('Hallo, VitePress!')
    expect(html('de/index.html')).toMatch(/href="\/de\/guide\/demo"/)
  })

  it('renders PathHelpersDemo locale links', () => {
    const en = html('guide/demo.html')
    expect(en).toContain('path-helpers-demo')
    expect(en).toContain('href="/fr/"')
    expect(en).toContain('href="/de/"')
    expect(en).toContain('href="/de/guide/demo"')
  })
})
