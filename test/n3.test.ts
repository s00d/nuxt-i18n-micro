import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@nuxt/test-utils/playwright'
import type { Page } from '@playwright/test'
import availableLanguages from './fixtures/n3/app/locales/availableLanguages'

export function loadJsonFile<T>(relativePath: string): T {
  const fullPath = join(process.cwd(), relativePath)
  const content = readFileSync(fullPath, 'utf-8')
  return JSON.parse(content) as T
}

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/n3', import.meta.url)),
  },
  // launchOptions: {
  //   headless: false, // Показывать браузер
  //   slowMo: 500, // Замедлить выполнение шагов (в миллисекундах) для лучшей видимости
  // },
})

interface RouteTranslations {
  [key: string]: {
    [key: string]: string
  }
}

const routeTranslations = loadJsonFile<RouteTranslations>('./test/fixtures/n3/app/locales/routeTranslations.json')

// Static pages that don't require parameters
const staticRoutes = [
  'home',
  'search',
  'info',
  'sea',
  'topic',
]
async function checkPageContent(page: Page, path: string) {
  // Check if we're on the correct URL
  await expect(page).toHaveURL(path)

  // Verify content exists
  const content = await page.textContent('#data')
  expect(content).toContain('Index')

  // Check for 404
  const notFound = await page.locator('text=404').count()
  expect(notFound).toBe(0)
}

test.describe('Page tests', async () => {
  test('static pages should work in all languages', async ({ page }) => {
    await page.goto('/')
    for (const lang of availableLanguages) {
      for (const route of staticRoutes) {
        let translatedRoute = routeTranslations[lang.code]?.[route]
        if (!translatedRoute) continue

        if (route === 'home') translatedRoute = ''

        const path = encodeURI(`/${lang.code}/${translatedRoute}`)
        console.log(`Testing static route: ${path}`)
        await page.goto(path)

        await checkPageContent(page, path)
      }
    }
  })

  test('pages with dynamic parameters should work in all languages', async ({ page }) => {
    const dynamicParams = {
      city: ['berlin', 'paris', 'rome'],
      country: ['germany', 'france', 'italy'],
      campsite: ['example-campsite', 'beach-camp'],
      popularRegion: ['bavaria', 'provence', 'tuscany'],
    }

    for (const lang of availableLanguages) {
      for (const [pageType, params] of Object.entries(dynamicParams)) {
        const translatedRoute = routeTranslations[lang.code]?.[pageType]
        if (!translatedRoute) continue

        for (const param of params) {
          const path = `/${lang.code}/${translatedRoute}/${param}`
          console.log(`Testing dynamic route: ${path}`)
          await page.goto(path)
          await checkPageContent(page, path)
        }
      }
    }
  })

  test('nested pages should work in all languages', async ({ page }) => {
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

    for (const lang of availableLanguages) {
      for (const route of nestedRoutes) {
        const translatedRoute = routeTranslations[lang.code]?.[route.type]
        if (!translatedRoute) continue

        for (const select of route.params) {
          const param = select as unknown as { country: string, state: string, id: number, section: string }
          let path: string
          if (route.type === 'country') {
            path = `/${lang.code}/${translatedRoute}/${param.country}/${param.state}`
          }
          else {
            const section = routeTranslations[lang.code]?.[param.section] ?? param.section
            path = `/${lang.code}/${translatedRoute}/${param.id}/${section}`
          }

          console.log(`Testing nested route: ${path}`)
          await page.goto(path)
          await checkPageContent(page, path)
        }
      }
    }
  })

  test('should handle invalid routes properly', async ({ page }) => {
    const invalidRoutes = [
      '/invalid-route',
      `/${availableLanguages[0].code}/invalid-route`,
      `/${availableLanguages[0].code}/country/invalid-country`,
      `/${availableLanguages[0].code}/country/germany/invalid-state`,
    ]

    for (const route of invalidRoutes) {
      console.log(`Testing invalid route: ${route}`)
      await page.goto(route)
      const content = await page.textContent('body')
      expect(content?.trim().length).toBeGreaterThan(0)
    }
  })

  test('pages should have correct metadata in all languages', async ({ page }) => {
    for (const lang of availableLanguages) {
      const homePath = `/${lang.code}`
      console.log(`Testing metadata for: ${homePath}`)
      await page.goto(homePath)

      // Check HTML lang attribute
      const htmlLang = await page.getAttribute('html', 'lang')
      expect(htmlLang).toBe(lang.code)

      // Check meta description
      const hasMetaDescription = await page.locator('meta[id="i18n-og"]').count()
      expect(hasMetaDescription).toBeGreaterThan(0)
    }
  })
})
