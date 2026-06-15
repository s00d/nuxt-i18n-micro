import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'
import type { Page } from '@playwright/test'
import availableLanguages from './fixtures/n3/app/locales/availableLanguages'
import { runSequential } from './helpers/sequential'

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
  // Check if we're on the correct URL
  await expect(page).toHaveURL(path)

  // Wait for #data element to be visible and have content
  const dataEl = page.locator('#data')
  await dataEl.waitFor({ state: 'visible' })

  // Verify content exists
  const content = await dataEl.textContent()
  expect(content).toContain('Index')

  // Check for 404
  const notFound = await page.locator('text=404').count()
  expect(notFound).toBe(0)
}

function buildStaticRouteCases(): Array<{ path: string }> {
  return availableLanguages.flatMap((lang) =>
    staticRoutes.flatMap((route) => {
      let translatedRoute = routeTranslations[lang.code]?.[route]
      if (!translatedRoute) return []

      if (route === 'home') translatedRoute = ''

      return [{ path: encodeURI(`/${lang.code}/${translatedRoute}`) }]
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

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/n3', import.meta.url)),
  },
})

test.describe('n3', () => {
  test.describe('Page tests', async () => {
    // 27 languages * 5 routes = 135 page navigations — needs generous timeout
    test('static pages should work in all languages', async ({ page }) => {
      test.setTimeout(180000)
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      await runSequential(buildStaticRouteCases(), async ({ path }) => {
        console.log(`Testing static route: ${path}`)
        await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 })
        await checkPageContent(page, path)
      })
    })

    test('pages with dynamic parameters should work in all languages', async ({ page }) => {
      test.setTimeout(180000)
      await runSequential(buildDynamicRouteCases(), async ({ path }) => {
        console.log(`Testing dynamic route: ${path}`)
        await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 })
        await checkPageContent(page, path)
      })
    })

    test('nested pages should work in all languages', async ({ page }) => {
      test.setTimeout(180000)
      await runSequential(buildNestedRouteCases(), async ({ path }) => {
        console.log(`Testing nested route: ${path}`)
        await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 })
        await checkPageContent(page, path)
      })
    })

    test('should handle invalid routes properly', async ({ page }) => {
      test.setTimeout(60000)
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
      test.setTimeout(120000)
      await runSequential(availableLanguages, async (lang) => {
        const homePath = `/${lang.code}`
        console.log(`Testing metadata for: ${homePath}`)
        await page.goto(homePath, { waitUntil: 'domcontentloaded', timeout: 15000 })

        const htmlLang = await page.getAttribute('html', 'lang')
        expect(htmlLang).toBe(lang.code)

        const hasMetaDescription = await page.locator('meta[id="i18n-og"]').count()
        expect(hasMetaDescription).toBeGreaterThan(0)
      })
    })
  })
})
