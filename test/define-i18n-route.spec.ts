import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/define-i18n-route', import.meta.url)),
  },
})

test.describe('$defineI18nRoute behavior', () => {
  test('should generate alternates only for specified locales in $defineI18nRoute', async ({ page, goto }) => {
    // Переходим на страницу test, которая использует $defineI18nRoute с locales: ['en']
    await goto('/test', { waitUntil: 'domcontentloaded' })

    // Проверяем, что страница загрузилась
    await expect(page.getByText('test in en')).toBeVisible()

    // Получаем все alternate ссылки
    const alternateLinks = page.locator('link[rel="alternate"]')
    const count = await alternateLinks.count()

    // Должны быть только alternate ссылки для 'en' локали
    const hreflangs = await Promise.all(
      Array.from({ length: count }).map((_, i) =>
        alternateLinks.nth(i).getAttribute('hreflang'),
      ),
    )

    // Проверяем, что есть только 'en' и 'en_EN' (ISO код)
    expect(hreflangs).toContain('en')
    expect(hreflangs).toContain('en_EN')

    // Проверяем, что НЕТ 'es' и 'es-ES' alternate ссылок
    expect(hreflangs).not.toContain('es')
    expect(hreflangs).not.toContain('es-ES')
  })

  test('should generate correct canonical URL for restricted locale page', async ({ page, goto }) => {
    await goto('/test', { waitUntil: 'domcontentloaded' })

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toContain('/test')
  })

  test('should generate correct og:locale meta for restricted locale page', async ({ page, goto }) => {
    await goto('/test', { waitUntil: 'domcontentloaded' })

    const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content')
    expect(ogLocale).toBe('en_EN')
  })

  test('should generate correct og:locale:alternate meta only for specified locales', async ({ page, goto }) => {
    await goto('/test', { waitUntil: 'domcontentloaded' })

    const ogAlternate = await page.locator('meta[property="og:locale:alternate"]').all()
    const contents = await Promise.all(ogAlternate.map(el => el.getAttribute('content')))

    // Должен быть только 'en_EN'
    expect(contents).toContain('en_EN')

    // НЕ должно быть 'es-ES'
    expect(contents).not.toContain('es-ES')
  })

  test('should return 404 for non-specified locale when accessing directly', async ({ page }) => {
    // Попытка доступа к /es/test должна вернуть 404, так как 'es' не указан в $defineI18nRoute
    const response = await page.goto('/es/test', { waitUntil: 'networkidle' })

    // Проверяем, что страница недоступна (404 или редирект)
    expect(response?.status()).toBeGreaterThanOrEqual(400)
  })

  test('should work correctly for default locale without prefix', async ({ page, goto }) => {
    // Тестируем доступ к странице без префикса (default locale)
    await goto('/test', { waitUntil: 'domcontentloaded' })

    // Проверяем, что контент отображается корректно
    await expect(page.getByText('test in en')).toBeVisible()

    // Проверяем, что alternate ссылки корректны
    const alternateLinks = page.locator('link[rel="alternate"]')
    const hreflangs = await Promise.all(
      Array.from({ length: await alternateLinks.count() }).map((_, i) =>
        alternateLinks.nth(i).getAttribute('hreflang'),
      ),
    )

    expect(hreflangs).toContain('en')
    expect(hreflangs).not.toContain('es')
  })

  test('should not generate alternates for non-specified locales in build output', async ({ page, goto }) => {
    await goto('/test', { waitUntil: 'domcontentloaded' })

    // Получаем HTML содержимое страницы
    const html = await page.content()

    // Проверяем, что в HTML НЕТ alternate ссылок для 'es'
    expect(html).not.toContain('hreflang="es"')
    expect(html).not.toContain('hreflang="es-ES"')

    // Проверяем, что в HTML НЕТ og:locale:alternate для 'es-ES'
    expect(html).not.toContain('og:locale:alternate" content="es-ES"')

    // Проверяем, что есть alternate ссылки для 'en'
    expect(html).toContain('hreflang="en"')
    expect(html).toContain('hreflang="en_EN"')
  })
})
