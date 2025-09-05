import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/async-components', import.meta.url)),
  },
  // launchOptions: {
  //   headless: false, // Показывать браузер
  //   slowMo: 500, // Замедлить выполнение шагов (в миллисекундах) для лучшей видимости
  // },
})

test.describe('async-components', () => {
  test('renders async components test page', async ({ page, goto }) => {
    await goto('/async-components-test', { waitUntil: 'hydration' })

    // Проверяем заголовок страницы
    await expect(page.locator('.async-components-test h1')).toHaveText('Async Components Test')

    // Проверяем описание
    await expect(page.locator('.async-components-test p').first()).toContainText('Testing async components with i18n translations')

    // Проверяем наличие тестовых секций
    await expect(page.locator('#test1')).toBeVisible()
    await expect(page.locator('#test2')).toBeVisible()
    await expect(page.locator('#test3')).toBeVisible()
    await expect(page.locator('#test4')).toBeVisible()
    await expect(page.locator('#test5')).toBeVisible()
  })

  test('async components load correctly', async ({ page, goto }) => {
    await goto('/async-components-test', { waitUntil: 'hydration' })

    // Ждем загрузки асинхронных компонентов
    await page.waitForTimeout(1000)

    // Проверяем, что простой асинхронный компонент загрузился
    await expect(page.locator('#simple-async-component')).toBeVisible()
    await expect(page.locator('#simple-async-component h3')).toHaveText('Simple Async Component')

    // Проверяем кнопку счетчика
    await expect(page.locator('#simple-counter-btn')).toBeVisible()

    // Тестируем интерактивность
    await page.click('#simple-counter-btn')
    await expect(page.locator('#simple-counter-btn')).toContainText('(1)')
  })

  test('locale switching works on async components page', async ({ page, goto }) => {
    await goto('/async-components-test', { waitUntil: 'hydration' })

    // Проверяем текущую локаль
    await expect(page.locator('#current-locale')).toHaveText('en')

    // Переключаемся на русский
    await page.click('#locale-ru')
    await expect(page).toHaveURL('/ru/async-components-test')
    await expect(page.locator('#current-locale')).toHaveText('ru')

    // Проверяем, что заголовок изменился
    await expect(page.locator('.async-components-test h1')).toHaveText('Тест Асинхронных Компонентов')

    // Переключаемся на немецкий
    await page.click('#locale-de')
    await expect(page).toHaveURL('/de/async-components-test')
    await expect(page.locator('#current-locale')).toHaveText('de')

    // Проверяем, что заголовок изменился
    await expect(page.locator('.async-components-test h1')).toHaveText('Async-Komponenten Test')
  })

  test('navigation between test pages works', async ({ page, goto }) => {
    await goto('/async-components-test', { waitUntil: 'hydration' })

    // Проверяем навигацию на вторую тестовую страницу
    await page.click('text=Go to Test 2')
    await expect(page).toHaveURL('/async-components-test-2')

    // Проверяем навигацию обратно
    await page.click('text=Back to Test 1')
    await expect(page).toHaveURL('/async-components-test')

    // Проверяем навигацию на главную
    await page.click('text=Back to Home')
    await expect(page).toHaveURL('/')
  })

  test('dynamic component loading works', async ({ page, goto }) => {
    await goto('/async-components-test', { waitUntil: 'hydration' })

    // Проверяем, что кнопка загрузки динамического компонента видна
    await expect(page.locator('#load-dynamic-btn')).toBeVisible()

    // Нажимаем кнопку загрузки
    await page.click('#load-dynamic-btn')

    // Ждем загрузки компонента
    await page.waitForTimeout(500)

    // Проверяем, что контейнер динамического компонента появился
    await expect(page.locator('#dynamic-component-container')).toBeVisible()
  })

  test('test results section displays correct information', async ({ page, goto }) => {
    await goto('/async-components-test', { waitUntil: 'hydration' })

    // Проверяем секцию результатов
    await expect(page.locator('#test-results')).toBeVisible()
    await expect(page.locator('#test-results h2')).toHaveText('Test Results')

    // Проверяем информацию о локали
    await expect(page.locator('#current-locale')).toHaveText('en')
    await expect(page.locator('#route-name')).toHaveText('async-components-test')
    await expect(page.locator('#translations-loaded')).toHaveText('Yes')
  })

  test('language switcher works correctly', async ({ page, goto }) => {
    await goto('/async-components-test', { waitUntil: 'hydration' })

    // Проверяем наличие переключателя языков
    await expect(page.locator('#language-switcher')).toBeVisible()
    await expect(page.locator('#language-switcher h3')).toHaveText('Switch Language')

    // Проверяем кнопки языков
    await expect(page.locator('#locale-en')).toBeVisible()
    await expect(page.locator('#locale-ru')).toBeVisible()
    await expect(page.locator('#locale-de')).toBeVisible()

    // Проверяем активное состояние английского языка
    await expect(page.locator('#locale-en')).toHaveClass(/active/)
  })

  test('async components work with different locales', async ({ page, goto }) => {
    // Тестируем на русском языке
    await goto('/ru/async-components-test', { waitUntil: 'hydration' })
    await page.waitForTimeout(1000)

    // Проверяем, что компонент загрузился с русскими переводами
    await expect(page.locator('#simple-async-component h3')).toHaveText('Простой Асинхронный Компонент')

    // Тестируем на немецком языке
    await goto('/de/async-components-test', { waitUntil: 'hydration' })
    await page.waitForTimeout(1000)

    // Проверяем, что компонент загрузился с немецкими переводами
    await expect(page.locator('#simple-async-component h3')).toHaveText('Einfache Async-Komponente')
  })

  test('main page navigation works', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Проверяем заголовок главной страницы
    await expect(page.locator('h1')).toHaveText('Async Components Test Suite')

    // Проверяем навигацию к первой тестовой странице
    await page.click('text=🧪 Async Components Test 1')
    await expect(page).toHaveURL('/async-components-test')

    // Возвращаемся на главную
    await goto('/', { waitUntil: 'hydration' })

    // Проверяем навигацию ко второй тестовой странице
    await page.click('text=🧪 Async Components Test 2')
    await expect(page).toHaveURL('/async-components-test-2')
  })

  test('locale switching on main page works', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Проверяем текущую локаль
    await expect(page.locator('text=Current Locale:')).toBeVisible()

    // Переключаемся на русский
    await page.click('button:has-text("Русский")')
    await expect(page).toHaveURL('/ru')

    // Проверяем, что заголовок изменился
    await expect(page.locator('h1')).toHaveText('Набор Тестов Асинхронных Компонентов')

    // Переключаемся на немецкий
    await page.click('button:has-text("Deutsch")')
    await expect(page).toHaveURL('/de')

    // Проверяем, что заголовок изменился
    await expect(page.locator('h1')).toHaveText('Async-Komponenten Test-Suite')
  })

  test('async components load correctly with translations', async ({ page, goto }) => {
    await goto('/async-components-test', { waitUntil: 'hydration' })

    // Проверяем, что все асинхронные компоненты загрузились
    await expect(page.locator('.simple-async-component')).toBeVisible()
    await expect(page.locator('.async-component-with-translations')).toBeVisible()
    await expect(page.locator('.async-component-with-i18n-route')).toBeVisible()
    await expect(page.locator('.async-component-with-error')).toBeVisible()

    // Проверяем содержимое компонентов
    await expect(page.locator('.simple-async-component h3')).toHaveText('Simple Async Component')
    await expect(page.locator('.async-component-with-translations h3')).toHaveText('Async Component with Translations Loaded')
    await expect(page.locator('.async-component-with-i18n-route h3')).toHaveText('Async Component with defineI18nRoute Loaded')
    await expect(page.locator('.async-component-with-error h3')).toHaveText('Error loading component')
  })

  test('dynamic async component loading works', async ({ page, goto }) => {
    await goto('/async-components-test', { waitUntil: 'hydration' })

    // Проверяем, что динамический компонент не загружен изначально
    await expect(page.locator('#dynamic-component-container')).not.toBeVisible()

    // Нажимаем кнопку загрузки
    await page.click('#load-dynamic-btn')

    // Ждем загрузки и проверяем, что компонент появился
    await expect(page.locator('#dynamic-component-container')).toBeVisible()
    await expect(page.locator('.async-dynamic-component')).toBeVisible()
    await expect(page.locator('.async-dynamic-component h3')).toHaveText('Dynamic Async Component Loaded')
  })

  test('async components work with locale switching', async ({ page, goto }) => {
    await goto('/async-components-test', { waitUntil: 'hydration' })

    // Проверяем английский текст
    await expect(page.locator('.simple-async-component h3')).toHaveText('Simple Async Component')

    // Переключаемся на русский
    await page.click('#locale-ru')
    await expect(page).toHaveURL('/ru/async-components-test')

    // Проверяем, что компоненты обновились на русском
    await expect(page.locator('.simple-async-component h3')).toHaveText('Простой Асинхронный Компонент')
    await expect(page.locator('.async-component-with-translations h3')).toHaveText('Асинхронный Компонент с Переводами Загружен')
    await expect(page.locator('.async-component-with-i18n-route h3')).toHaveText('Асинхронный Компонент с defineI18nRoute Загружен')

    // Переключаемся на немецкий
    await page.click('#locale-de')
    await expect(page).toHaveURL('/de/async-components-test')

    // Проверяем немецкий текст
    await expect(page.locator('.simple-async-component h3')).toHaveText('Einfache Async-Komponente')
    await expect(page.locator('.async-component-with-translations h3')).toHaveText('Async-Komponente mit Übersetzungen Geladen')
  })

  test('second test page renders correctly', async ({ page, goto }) => {
    await goto('/async-components-test-2', { waitUntil: 'hydration' })

    // Проверяем заголовок
    await expect(page.locator('.async-components-test-2 h1')).toHaveText('Async Components Test 2')

    // Проверяем наличие всех тестовых секций
    await expect(page.locator('#test6')).toBeVisible()
    await expect(page.locator('#test7')).toBeVisible()
    await expect(page.locator('#test8')).toBeVisible()

    // Проверяем, что отложенный компонент загрузился
    await expect(page.locator('.delayed-async-component')).toBeVisible()
    await expect(page.locator('.delayed-async-component h3')).toHaveText('Delayed Async Component Loaded')

    // Проверяем множественные компоненты
    await expect(page.locator('.multiple-async-component-1')).toBeVisible()
    await expect(page.locator('.multiple-async-component-2')).toBeVisible()
    await expect(page.locator('.multiple-async-component-3')).toBeVisible()
  })

  test('conditional async component toggles correctly', async ({ page, goto }) => {
    await goto('/async-components-test-2', { waitUntil: 'hydration' })

    // Проверяем, что условный компонент скрыт изначально
    await expect(page.locator('#conditional-component-container')).not.toBeVisible()

    // Нажимаем кнопку показа
    await page.click('#toggle-conditional-btn')
    await expect(page.locator('#toggle-conditional-btn')).toHaveText('Hide Component')

    // Проверяем, что компонент появился
    await expect(page.locator('#conditional-component-container')).toBeVisible()
    await expect(page.locator('.conditional-async-component')).toBeVisible()
    await expect(page.locator('.conditional-async-component h3')).toHaveText('Conditional Async Component Loaded')

    // Скрываем компонент
    await page.click('#toggle-conditional-btn')
    await expect(page.locator('#toggle-conditional-btn')).toHaveText('Show Component')
    await expect(page.locator('#conditional-component-container')).not.toBeVisible()
  })

  test('multiple async components interactions work', async ({ page, goto }) => {
    await goto('/async-components-test-2', { waitUntil: 'hydration' })

    // Проверяем, что все множественные компоненты загрузились
    await expect(page.locator('.multiple-async-component-1')).toBeVisible()
    await expect(page.locator('.multiple-async-component-2')).toBeVisible()
    await expect(page.locator('.multiple-async-component-3')).toBeVisible()

    // Нажимаем кнопки в каждом компоненте
    await page.click('.multiple-async-component-1 .action-button')
    await expect(page.locator('.multiple-async-component-1 .action-result')).toHaveText('Action completed successfully in Component 1')

    await page.click('.multiple-async-component-2 .action-button')
    await expect(page.locator('.multiple-async-component-2 .action-result')).toHaveText('Action completed successfully in Component 2')

    await page.click('.multiple-async-component-3 .action-button')
    await expect(page.locator('.multiple-async-component-3 .action-result')).toHaveText('Action completed successfully in Component 3')
  })

  test('delayed async component shows loading state', async ({ page, goto }) => {
    await goto('/async-components-test-2', { waitUntil: 'hydration' })

    // Проверяем, что отложенный компонент показывает состояние загрузки
    await expect(page.locator('.delayed-async-component')).toBeVisible()

    // Проверяем, что изначально показывается загрузка
    await expect(page.locator('.delayed-async-component .loading-indicator')).toBeVisible()
    await expect(page.locator('.delayed-async-component .loading-indicator')).toHaveText('Loading...')

    // Ждем завершения загрузки (1 секунда)
    await expect(page.locator('.delayed-async-component .loaded-content')).toBeVisible({ timeout: 2000 })
    await expect(page.locator('.delayed-async-component .loaded-content')).toHaveText('Component loaded successfully!')
  })

  test('navigation between test pages preserves state', async ({ page, goto }) => {
    await goto('/async-components-test', { waitUntil: 'hydration' })

    // Загружаем динамический компонент
    await page.click('#load-dynamic-btn')
    await expect(page.locator('#dynamic-component-container')).toBeVisible()

    // Переходим на вторую страницу
    await page.click('text=Go to Test 2')
    await expect(page).toHaveURL('/async-components-test-2')

    // Проверяем, что вторая страница загрузилась
    await expect(page.locator('.async-components-test-2 h1')).toHaveText('Async Components Test 2')

    // Возвращаемся на первую страницу
    await page.click('text=Back to Test 1')
    await expect(page).toHaveURL('/async-components-test')

    // Проверяем, что состояние не сохранилось (динамический компонент должен быть скрыт)
    await expect(page.locator('#dynamic-component-container')).not.toBeVisible()
  })

  test('async components work with different locales on second page', async ({ page, goto }) => {
    await goto('/async-components-test-2', { waitUntil: 'hydration' })

    // Проверяем английский текст
    await expect(page.locator('.delayed-async-component h3')).toHaveText('Delayed Async Component Loaded')

    // Переключаемся на русский
    await page.click('#locale-ru')
    await expect(page).toHaveURL('/ru/async-components-test-2')

    // Проверяем русский текст
    await expect(page.locator('.delayed-async-component h3')).toHaveText('Отложенный Асинхронный Компонент Загружен')
    await expect(page.locator('.multiple-async-component-1 h3')).toHaveText('Множественный Асинхронный Компонент 1 Загружен')

    // Переключаемся на немецкий
    await page.click('#locale-de')
    await expect(page).toHaveURL('/de/async-components-test-2')

    // Проверяем немецкий текст
    await expect(page.locator('.delayed-async-component h3')).toHaveText('Verzögerte Async-Komponente Geladen')
    await expect(page.locator('.multiple-async-component-1 h3')).toHaveText('Mehrere Async-Komponente 1 Geladen')
  })

  test('async components handle errors gracefully', async ({ page, goto }) => {
    await goto('/async-components-test', { waitUntil: 'hydration' })

    // Проверяем, что компонент с ошибкой все равно отображается
    await expect(page.locator('.async-component-with-error')).toBeVisible()
    await expect(page.locator('.async-component-with-error h3')).toHaveText('Error loading component')
  })

  test('test results display correct information', async ({ page, goto }) => {
    await goto('/async-components-test', { waitUntil: 'hydration' })

    // Проверяем результаты тестов
    await expect(page.locator('#test-results')).toBeVisible()
    await expect(page.locator('#current-locale')).toHaveText('en')
    await expect(page.locator('#route-name')).toHaveText('async-components-test')
    await expect(page.locator('#translations-loaded')).toHaveText('Yes')
  })

  test('language switcher works on both pages', async ({ page, goto }) => {
    // Тестируем на первой странице
    await goto('/async-components-test', { waitUntil: 'hydration' })
    await page.click('#locale-ru')
    await expect(page).toHaveURL('/ru/async-components-test')
    await expect(page.locator('#current-locale')).toHaveText('ru')

    // Переходим на вторую страницу
    await page.click('text=Перейти к Тесту 2')
    await expect(page).toHaveURL('/ru/async-components-test-2')
    await expect(page.locator('#current-locale')).toHaveText('ru')

    // Переключаемся на немецкий на второй странице
    await page.click('#locale-de')
    await expect(page).toHaveURL('/de/async-components-test-2')
    await expect(page.locator('#current-locale')).toHaveText('de')
  })
})
