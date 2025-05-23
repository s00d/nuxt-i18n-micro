import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/undefault', import.meta.url)),
  },
  // launchOptions: {
  //   headless: false, // Показывать браузер
  //   slowMo: 500, // Замедлить выполнение шагов (в миллисекундах) для лучшей видимости
  // },
})

test.describe('undefault', () => {
  test('test redirection and link clicks in English', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })
    // Переход на страницу /page2, должно произойти редирект на /en/custom-page2-en
    await goto('/page2', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/en/custom-page2-en')

    // Клик по ссылке 'unlocalized', должно редиректнуть на /unlocalized
    await page.click('#unlocalized')
    await expect(page).toHaveURL('/unlocalized')

    // Клик по ссылке 'page2', должно вернуться на /en/custom-page2-en
    await page.click('#link-en')
    await expect(page).toHaveURL('/en/custom-page2-en')
  })

  test('test redirection and link clicks in German', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })
    // Переход на страницу /page2, должно произойти редирект на /de/custom-page2-de
    await goto('/de/custom-page2-de', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de/custom-page2-de')

    // Клик по ссылке 'unlocalized', должно редиректнуть на /unlocalized
    await page.click('#unlocalized')
    await expect(page).toHaveURL('/unlocalized')

    // Клик по ссылке 'page2', должно вернуться на /en/custom-page2-en
    await page.click('#link-de')
    await expect(page).toHaveURL('/de/custom-page2-de')
  })

  test('should correctly render post section pages with localized routes', async ({ page, goto }) => {
    // Проверка на немецком
    await goto('/de/post/1/all/s2', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#name')).toHaveText('de')
    await expect(page.locator('#name-page')).toHaveText('de page')

    // Проверка на английском
    await goto('/en/post/1/all/s2', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#name')).toHaveText('en')
    await expect(page.locator('#name-page')).toHaveText('en page')

    // Проверка на русском
    await goto('/ru/post/1/all/s2', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#name')).toHaveText('ru')
    await expect(page.locator('#name-page')).toHaveText('ru page')
  })
})
