import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Page } from '@playwright/test'
import availableLanguages from './fixtures/n3/app/locales/availableLanguages'
import { pollUntil, runSequential } from './helpers/sequential'

import { describe, expect, setupE2E, test } from './setup/vitest-e2e'

await setupE2E({ shared: 'n3' })

export function loadJsonFile<T>(relativePath: string): T {
  const fullPath = join(process.cwd(), relativePath)
  const content = readFileSync(fullPath, 'utf-8')
  return JSON.parse(content) as T
}

interface RouteTranslations {
  [key: string]: {
    [key: string]: string
  }
}

const routeTranslations = loadJsonFile<RouteTranslations>('./test/fixtures/n3/app/locales/routeTranslations.json')

// Static pages that don't require parameters
const staticRoutes = ['home', 'search', 'info', 'sea', 'topic']
async function checkPageContent(page: Page, path: string) {
  await expect(page).toHaveURL(path, { timeout: process.env.CI ? 15_000 : 5_000 })

  await pollUntil(
    async () => {
      const content = await page.locator('#data').textContent()
      return Boolean(content?.includes('Index'))
    },
    {
      timeoutMs: process.env.CI ? 30_000 : 10_000,
      message: `Expected #data to contain "Index" at ${path}`,
    },
  )

  const notFound = await page.locator('text=404').count()
  expect(notFound).toBe(0)
}

function buildStaticRouteCases(): Array<{ path: string }> {
  return availableLanguages.flatMap((lang) =>
    staticRoutes.flatMap((route) => {
      let translatedRoute = routeTranslations[lang.code]?.[route]
      if (!translatedRoute) return []

      if (route === 'home') translatedRoute = ''

      return [{ path: `/${lang.code}/${translatedRoute}` }]
    }),
  )
}

function buildDynamicRouteCases(): Array<{ path: string }> {
  const dynamicParams = {
    city: ['berlin', 'paris', 'rome'],
    country: ['germany', 'france', 'italy'],
    campsite: ['example-campsite', 'beach-camp'],
    popularRegion: ['bavaria', 'provence', 'tuscany'],
  }

  return availableLanguages.flatMap((lang) =>
    Object.entries(dynamicParams).flatMap(([pageType, params]) => {
      const translatedRoute = routeTranslations[lang.code]?.[pageType]
      if (!translatedRoute) return []

      return params.map((param) => ({ path: `/${lang.code}/${translatedRoute}/${param}` }))
    }),
  )
}

function buildNestedRouteCases(): Array<{ path: string }> {
  const nestedRoutes = [
    {
      type: 'country',
      params: [
        { country: 'germany', state: 'bavaria' },
        { country: 'france', state: 'provence' },
      ],
    },
    {
      type: 'campsite',
      params: [
        { id: 'example-campsite', section: 'rate' },
        { id: 'example-campsite', section: 'media' },
      ],
    },
  ]

  return availableLanguages.flatMap((lang) =>
    nestedRoutes.flatMap((route) => {
      const translatedRoute = routeTranslations[lang.code]?.[route.type]
      if (!translatedRoute) return []

      return route.params.map((select) => {
        const param = select as unknown as { country: string; state: string; id: number; section: string }
        if (route.type === 'country') {
          return { path: `/${lang.code}/${translatedRoute}/${param.country}/${param.state}` }
        }

        const section = routeTranslations[lang.code]?.[param.section] ?? param.section
        return { path: `/${lang.code}/${translatedRoute}/${param.id}/${section}` }
      })
    }),
  )
}

describe('n3', () => {
  // 27 languages × many routes — the heaviest suite; grant a generous timeout.
  describe('Page tests', { timeout: process.env.CI ? 300_000 : 180_000 }, async () => {
    // 27 languages * 5 routes = 135 page navigations — needs generous timeout
    test('static pages should work in all languages', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      await runSequential(buildStaticRouteCases(), async ({ path }) => {
        console.log(`Testing static route: ${path}`)
        await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 })
        await checkPageContent(page, path)
      })
    })

    test('pages with dynamic parameters should work in all languages', async ({ page }) => {
      await runSequential(buildDynamicRouteCases(), async ({ path }) => {
        console.log(`Testing dynamic route: ${path}`)
        await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 })
        await checkPageContent(page, path)
      })
    })

    test('nested pages should work in all languages', async ({ page }) => {
      await runSequential(buildNestedRouteCases(), async ({ path }) => {
        console.log(`Testing nested route: ${path}`)
        await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 })
        await checkPageContent(page, path)
      })
    })

    test('should handle invalid routes properly', async ({ page }) => {
      const firstLang = availableLanguages[0]
      if (!firstLang) return
      const invalidRoutes = [
        '/invalid-route',
        `/${firstLang.code}/invalid-route`,
        `/${firstLang.code}/country/invalid-country`,
        `/${firstLang.code}/country/germany/invalid-state`,
      ]

      await runSequential(invalidRoutes, async (route) => {
        console.log(`Testing invalid route: ${route}`)
        await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 })
        const content = await page.textContent('body')
        expect(content?.trim().length).toBeGreaterThan(0)
      })
    })

    test('pages should have correct metadata in all languages', async ({ page }) => {
      await runSequential(availableLanguages, async (lang) => {
        const homePath = `/${lang.code}`
        console.log(`Testing metadata for: ${homePath}`)
        await page.goto(homePath, { waitUntil: 'domcontentloaded', timeout: 15000 })

        const htmlLang = await page.getAttribute('html', 'lang')
        expect(htmlLang).toBe(lang.code)

        const hasOgUrl = await page.locator('meta[id="i18n-og-url"]').count()
        expect(hasOgUrl).toBeGreaterThan(0)
      })
    })
  })
})
