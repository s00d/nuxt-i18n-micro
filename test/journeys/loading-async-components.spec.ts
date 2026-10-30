import { describe, expect, test } from 'untestutils/vitest'

// `basic` fixture: /async-components is the suite home, the two test pages are ssr:false.
describe('J8 translation loading: async components', () => {
  test.override({ harness: 'basic' })

  test('page 1: async components render translated, dynamic load, navigation', async ({ page, goto }) => {
    // step 1: open /async-components-test → title, description, 5 sections
    // was: async-components › renders async components test page
    await goto('/async-components-test', { waitUntil: 'hydration' })
    await expect(page.locator('.async-components-test h1')).toHaveText('Async Components Test')
    await expect(page.locator('.async-components-test p').first()).toContainText('Testing async components with i18n translations')
    for (const id of ['#test1', '#test2', '#test3', '#test4', '#test5']) await expect(page.locator(id)).toBeVisible()

    // step 2: the 4 async components → translated h3 (the error component included)
    // was: async-components › async components load correctly with translations; › handle errors gracefully
    await expect(page.locator('#simple-async-component h3')).toHaveText('Simple Async Component')
    await expect(page.locator('.async-component-with-translations h3')).toHaveText('Async Component with Translations Loaded')
    await expect(page.locator('.async-component-with-i18n-route h3')).toHaveText('Async Component with defineI18nRoute Loaded')
    await expect(page.locator('.async-component-with-error h3')).toHaveText('Error loading component')

    // step 3: click the counter → (1)
    // was: async-components › async components load correctly
    await page.click('#simple-counter-btn')
    await expect(page.locator('#simple-counter-btn')).toContainText('(1)')

    // step 4: results section → locale, route name, translations loaded
    // was: async-components › test results section displays correct information; › test results display correct information
    await expect(page.locator('#test-results h2')).toHaveText('Test Results')
    await expect(page.locator('#current-locale')).toHaveText('en')
    await expect(page.locator('#route-name')).toHaveText('async-components-test')
    await expect(page.locator('#translations-loaded')).toHaveText('Yes')

    // step 5: switcher → heading, 3 buttons, en active
    // was: async-components › language switcher works correctly
    await expect(page.locator('#language-switcher h3')).toHaveText('Switch Language')
    for (const id of ['#locale-en', '#locale-ru', '#locale-de']) await expect(page.locator(id)).toBeVisible()
    await expect(page.locator('#locale-en')).toHaveClass(/active/)

    // step 6: load the dynamic component → container and h3 appear
    // was: async-components › dynamic async component loading works; › dynamic component loading works
    await expect(page.locator('#dynamic-component-container')).not.toBeVisible()
    await page.click('#load-dynamic-btn')
    await expect(page.locator('#dynamic-component-container')).toBeVisible()
    await expect(page.locator('.async-dynamic-component h3')).toHaveText('Dynamic Async Component Loaded')

    // step 7: to Test 2 and back → dynamic state reset; then home
    // was: async-components › navigation between test pages works; › navigation between test pages preserves state
    await page.click('text=Go to Test 2')
    await expect(page).toHaveURL('/async-components-test-2')
    await expect(page.locator('.async-components-test-2 h1')).toHaveText('Async Components Test 2')
    await page.click('text=Back to Test 1')
    await expect(page).toHaveURL('/async-components-test')
    await expect(page.locator('#dynamic-component-container')).not.toBeVisible()
    await page.click('text=Back to Home')
    await expect(page).toHaveURL('/async-components')
  })

  test('locales: switching re-translates async components on both pages', async ({ page, goto }) => {
    // step 1: #locale-ru → /ru/async-components-test, h1 and components in ru
    // was: async-components › locale switching works on async components page; › async components work with locale switching
    await goto('/async-components-test', { waitUntil: 'hydration' })
    await page.click('#locale-ru')
    await expect(page).toHaveURL('/ru/async-components-test')
    await expect(page.locator('#current-locale')).toHaveText('ru')
    await expect(page.locator('.async-components-test h1')).toHaveText('Тест Асинхронных Компонентов')
    await expect(page.locator('.simple-async-component h3')).toHaveText('Простой Асинхронный Компонент')
    await expect(page.locator('.async-component-with-translations h3')).toHaveText('Асинхронный Компонент с Переводами Загружен')
    await expect(page.locator('.async-component-with-i18n-route h3')).toHaveText('Асинхронный Компонент с defineI18nRoute Загружен')

    // step 2: ru link to Test 2 → /ru/async-components-test-2, ru texts
    // was: async-components › language switcher works on both pages; › different locales on second page
    await page.click('text=Перейти к Тесту 2')
    await expect(page).toHaveURL('/ru/async-components-test-2')
    await expect(page.locator('#current-locale')).toHaveText('ru')
    await expect(page.locator('.delayed-async-component h3')).toHaveText('Отложенный Асинхронный Компонент Загружен')
    await expect(page.locator('.multiple-async-component-1 h3')).toHaveText('Множественный Асинхронный Компонент 1 Загружен')

    // step 3: #locale-de → /de/async-components-test-2, de texts
    await page.click('#locale-de')
    await expect(page).toHaveURL('/de/async-components-test-2')
    await expect(page.locator('#current-locale')).toHaveText('de')
    await expect(page.locator('.delayed-async-component h3')).toHaveText('Verzögerte Async-Komponente Geladen')
    await expect(page.locator('.multiple-async-component-1 h3')).toHaveText('Mehrere Async-Komponente 1 Geladen')

    // step 4: direct loads of page 1 in de and ru → translated on first render
    // was: async-components › locale switching (de title); › async components work with different locales
    await goto('/de/async-components-test', { waitUntil: 'hydration' })
    await expect(page.locator('.async-components-test h1')).toHaveText('Async-Komponenten Test')
    await expect(page.locator('.simple-async-component h3')).toHaveText('Einfache Async-Komponente')
    await expect(page.locator('.async-component-with-translations h3')).toHaveText('Async-Komponente mit Übersetzungen Geladen')
    await goto('/ru/async-components-test', { waitUntil: 'hydration' })
    await expect(page.locator('#simple-async-component h3')).toHaveText('Простой Асинхронный Компонент')
  })

  test('page 2 and home: delayed, multiple and conditional components, home switcher', async ({ page, goto }) => {
    // step 1: open /async-components-test-2 → title, 3 sections
    // was: async-components › second test page renders correctly
    await goto('/async-components-test-2', { waitUntil: 'hydration' })
    await expect(page.locator('.async-components-test-2 h1')).toHaveText('Async Components Test 2')
    for (const id of ['#test6', '#test7', '#test8']) await expect(page.locator(id)).toBeVisible()

    // step 2: delayed component → Loading... then loaded (fixture timer is 3 s)
    // was: async-components › delayed async component shows loading state
    await expect(page.locator('.delayed-async-component h3')).toHaveText('Delayed Async Component Loaded')
    await expect(page.locator('.delayed-async-component .loading-indicator')).toHaveText('Loading...')
    await expect(page.locator('.delayed-async-component .loaded-content')).toHaveText('Component loaded successfully!', { timeout: 6000 })

    // step 3: the 3 multiple components → each action reports success
    // was: async-components › multiple async components interactions work
    for (const n of [1, 2, 3]) {
      await page.click(`.multiple-async-component-${n} .action-button`)
      await expect(page.locator(`.multiple-async-component-${n} .action-result`)).toHaveText(`Action completed successfully in Component ${n}`)
    }

    // step 4: conditional toggle → show then hide
    // was: async-components › conditional async component toggles correctly
    await expect(page.locator('#conditional-component-container')).not.toBeVisible()
    await page.click('#toggle-conditional-btn')
    await expect(page.locator('#toggle-conditional-btn')).toHaveText('Hide Component')
    await expect(page.locator('.conditional-async-component h3')).toHaveText('Conditional Async Component Loaded')
    await page.click('#toggle-conditional-btn')
    await expect(page.locator('#toggle-conditional-btn')).toHaveText('Show Component')
    await expect(page.locator('#conditional-component-container')).not.toBeVisible()

    // step 5: suite home → h1, links to both tests, locale buttons → /ru, /de titles
    // was: async-components › main page navigation works; › locale switching on main page works
    await goto('/async-components', { waitUntil: 'hydration' })
    await expect(page.locator('h1')).toHaveText('Async Components Test Suite')
    await page.click('text=🧪 Async Components Test 1')
    await expect(page).toHaveURL('/async-components-test')
    await goto('/async-components', { waitUntil: 'hydration' })
    await page.click('text=🧪 Async Components Test 2')
    await expect(page).toHaveURL('/async-components-test-2')
    await goto('/async-components', { waitUntil: 'hydration' })
    await expect(page.locator('text=Current Locale:')).toBeVisible()
    await page.click('button:has-text("Русский")')
    await expect(page).toHaveURL('/ru/async-components')
    await expect(page.locator('h1')).toHaveText('Набор Тестов Асинхронных Компонентов')
    await page.click('button:has-text("Deutsch")')
    await expect(page).toHaveURL('/de/async-components')
    await expect(page.locator('h1')).toHaveText('Async-Komponenten Test-Suite')
  })
})
