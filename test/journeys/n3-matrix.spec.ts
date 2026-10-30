import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'untestutils/vitest'
import availableLanguages from '../fixtures/basic/n3/locales/availableLanguages'

type RouteTranslations = Record<string, Record<string, string>>

const routeTranslations = JSON.parse(
  readFileSync(new URL('../fixtures/basic/n3/locales/routeTranslations.json', import.meta.url), 'utf-8'),
) as RouteTranslations

// Route builders copied from the old n3 spec: only routes with a translation for the locale are built.
const staticRoutes = ['home', 'search', 'info', 'sea', 'topic']
const dynamicParams: Record<string, string[]> = {
  city: ['berlin', 'paris', 'rome'],
  country: ['germany', 'france', 'italy'],
  campsite: ['example-campsite', 'beach-camp'],
  popularRegion: ['bavaria', 'provence', 'tuscany'],
}
const nestedRoutes = {
  country: [
    ['germany', 'bavaria'],
    ['france', 'provence'],
  ],
  campsite: [
    ['example-campsite', 'rate'],
    ['example-campsite', 'media'],
  ],
}

function staticCases(): string[] {
  return availableLanguages.flatMap(({ code }) =>
    staticRoutes
      .filter((route) => routeTranslations[code]?.[route])
      .map((route) => `/${code}/${route === 'home' ? '' : routeTranslations[code]![route]}`),
  )
}

function dynamicCases(): string[] {
  return availableLanguages.flatMap(({ code }) =>
    Object.entries(dynamicParams)
      .filter(([type]) => routeTranslations[code]?.[type])
      .flatMap(([type, params]) => params.map((param) => `/${code}/${routeTranslations[code]![type]}/${param}`)),
  )
}

function nestedCases(): string[] {
  return availableLanguages.flatMap(({ code }) =>
    Object.entries(nestedRoutes)
      .filter(([type]) => routeTranslations[code]?.[type])
      .flatMap(([type, params]) =>
        params.map(([id, child]) => {
          const segment = type === 'campsite' ? (routeTranslations[code]?.[child!] ?? child) : child
          return `/${code}/${routeTranslations[code]![type]}/${id}/${segment}`
        }),
      ),
  )
}

describe('J11 n3: 27 locales over globalLocaleRoutes', () => {
  test.override({ harness: 'basic-n3' })

  test('SSR route matrix: every translated route renders, invalid routes do not crash', { timeout: 300_000 }, async ({ request }) => {
    // step 1: GET each static, dynamic and nested route → 200 with the Index content
    // was: n3 › static pages should work in all languages; › pages with dynamic parameters; › nested pages
    const routes = [...staticCases(), ...dynamicCases(), ...nestedCases()]
    expect(routes.length).toBe(56)
    for (const path of routes) {
      const response = await request.get(encodeURI(path), { maxRedirects: 0 })
      expect(response.status(), path).toBe(200)
      expect(await response.text(), path).toContain('id="data">Index')
    }

    // step 2: GET each locale home → html lang is the code, og:url meta present
    // was: n3 › pages should have correct metadata in all languages
    for (const { code } of availableLanguages) {
      const html = await (await request.get(`/${code}`, { maxRedirects: 0 })).text()
      expect(html, code).toMatch(new RegExp(`<html[^>]*lang="${code}"`))
      expect(html, code).toContain('id="i18n-og-url"')
    }

    // step 3: GET invalid routes → exact status, no 5xx (was: body not empty)
    // was: n3 › should handle invalid routes properly
    // unprefixed → redirected into the default locale; /de/country/* is untranslated for de, so the
    // catch-all slug pages render Index (the slug is not validated)
    const unprefixed = await request.get('/invalid-route', { maxRedirects: 0 })
    expect(unprefixed.status()).toBe(302)
    expect(unprefixed.headers().location).toBe('/de/invalid-route')
    expect((await request.get('/de/invalid-route', { maxRedirects: 0 })).status()).toBe(404)
    for (const path of ['/de/country/invalid-country', '/de/country/germany/invalid-state']) {
      const response = await request.get(path, { maxRedirects: 0 })
      expect(response.status(), path).toBe(200)
      expect(await response.text(), path).toContain('id="data">Index')
    }
  })

  test('browser hop: default locale, then routes in sampled locales hydrate', async ({ page, goto }) => {
    // step 1: open / → default locale de
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de')
    await expect(page.locator('#data')).toHaveText('Index')

    // step 2: first non-default locale (en) and a long translated slug (ru), dynamic + nested (only de has them) → Index after hydration
    for (const path of ['/en/search', '/ru/домашняя-страница', '/de/campingplatz/example-campsite', '/de/campingplatz/example-campsite/rate']) {
      await goto(encodeURI(path), { waitUntil: 'hydration' })
      await expect(page.locator('#data')).toHaveText('Index')
    }
  })
})
