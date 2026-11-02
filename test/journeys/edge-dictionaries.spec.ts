import type { Page } from '@playwright/test'
import { ssr } from '../helpers/journeys-b'
import { describe, expect, test } from '../helpers/guarded-test.ts'

// basic-edge: `/one?k=<key>&m=<mode>` renders one dictionary key through one API, between two neighbours and a button.
// Real dictionaries hold broken markup and odd values, and real clients send garbage: nothing here may cost the page.

declare const useNuxtApp: () => { $switchLocale: (code: string) => Promise<void> }
declare const window: { __xss?: number }

const one = (key: string, mode: string) => `/one?k=${encodeURIComponent(key)}&m=${mode}`
const switchTo = (page: Page, code: string) => page.evaluate((locale) => useNuxtApp().$switchLocale(locale), code)

async function expectAlive(page: Page) {
  await expect(page.locator('#before')).toHaveText('before')
  await expect(page.locator('#after')).toContainText('after')
  await expect(page.locator('#after-p')).toContainText('para')
  const clicks = Number(await page.locator('#btn').textContent())
  await page.locator('#btn').click()
  await expect(page.locator('#btn')).toHaveText(String(clicks + 1))
}

const HTML_MODES = ['vhtml', 'vhtml-p', 'it-html', 'it-p', 'it-plural-html', 'tc-html']
const TEXT_MODES = ['text', 'it', 'it-slot', 'it-default', 'it-plural', 'tc']

describe('journey: dictionaries at their worst', () => {
  test.override({ harness: 'basic-edge' })

  // the parser moves such markup around, so the server's tree is not the client's: Vue reports it and carries on
  test('broken markup in html mode keeps the page alive, on the server and after a locale switch', async ({ page, goto, guard }) => {
    guard.allow(/Hydration completed but contains mismatches/)
    for (const key of ['a_unclosed', 'a_stray', 'a_mess', 'a_nested', 'b_unclosed', 'h3_stray', 'h3_unclosed']) {
      for (const mode of HTML_MODES) {
        await goto(one(key, mode), { waitUntil: 'hydration' })
        await expectAlive(page)
        await switchTo(page, 'de')
        await expect(page.locator('#locale')).toHaveText('de')
        await expectAlive(page)
      }
    }
  })

  test('broken markup and script as text stay text, and hydrate clean', async ({ page, goto }) => {
    for (const key of ['a_unclosed', 'a_mess', 'b_unclosed', 'h3_stray', 'textarea_open', 'script_open', 'xss_script', 'xss_close', 'xss_img']) {
      for (const mode of TEXT_MODES) {
        await goto(one(key, mode), { waitUntil: 'hydration' })
        await expect(page.locator('#host b, #host a, #host img, #host script, #host textarea')).toHaveCount(0)
        await expectAlive(page)
        expect(await page.evaluate(() => window.__xss), `${key} ${mode}`).toBeUndefined()
      }
    }
  })

  test('a key off the URL is text, html mode or not', async ({ page, goto }) => {
    for (const mode of ['it-html', 'it-plural-html']) {
      await goto(one('<img src=x onerror="window.__xss=1">', mode), { waitUntil: 'hydration' })
      await expect(page.locator('#host img')).toHaveCount(0)
      expect(await page.evaluate(() => window.__xss)).toBeUndefined()
    }
  })

  test('any value under a key renders: a tree, a number, a boolean, null, an array, a name off Object.prototype', async ({ page, goto }) => {
    const keys = [
      'obj_tostr',
      'obj_valueof',
      'obj_ctor',
      'v_obj',
      'v_arr',
      'v_arr0',
      'v_null',
      'v_0',
      'v_false',
      'v_empty',
      'constructor',
      '__proto__',
    ]
    for (const key of [...keys, 'br_proto', 'br_ctor', 'br_tostr', 'br_open', 'br_close', 'pipe_lone', 'pipe_two', 'zero_marker', 't_long']) {
      for (const mode of TEXT_MODES) {
        const res = await goto(one(key, mode), { waitUntil: 'hydration' })
        expect(res?.status(), `${key} ${mode}`).toBe(200)
        await expectAlive(page)
        await switchTo(page, 'de')
        await expectAlive(page)
      }
    }
  })

  // the HTML parser turns NUL into U+FFFD, so the server's text cannot equal the client's
  test('a NUL in a translation keeps the page alive', async ({ page, goto, guard }) => {
    guard.allow(/Hydration completed but contains mismatches/)
    for (const mode of TEXT_MODES) {
      await goto(one('t_nul', mode), { waitUntil: 'hydration' })
      await expectAlive(page)
    }
  })

  test('a locale with an empty dictionary, with a page file only, with no file: renders and switches', async ({ page, goto }) => {
    await goto('/one?k=home', { waitUntil: 'hydration' })
    for (const code of ['zero', 'page-only', 'no-file']) {
      await switchTo(page, code)
      await expect(page.locator('#locale')).toHaveText(code)
      await expect(page.locator('#host')).toHaveText('home')
      await switchTo(page, 'en')
      await expect(page.locator('#host')).toHaveText('Home')

      await goto(`/${code}/one?k=home`, { waitUntil: 'hydration' })
      await expect(page.locator('#host')).toHaveText('home')
      await goto('/one?k=home', { waitUntil: 'hydration' })
    }
    await goto('/page-only', { waitUntil: 'hydration' })
    await expect(page.locator('#title')).toHaveText('Page only home')
  })

  test('switches at once: the last one wins, URL and text agree', async ({ page, goto }) => {
    await goto('/one?k=home', { waitUntil: 'hydration' })
    await page.evaluate(() => {
      const { $switchLocale } = useNuxtApp()
      return Promise.allSettled(['de', 'ar', 'en', 'de', 'ar'].map((code) => $switchLocale(code)))
    })
    await expect(page.locator('#locale')).toHaveText('ar')
    await expect(page.locator('#host')).toHaveText('AR Home')
    await expect(page).toHaveURL(/\/ar\/one/)
  })

  test('garbage in a request is never a 5xx', async ({ baseURL }) => {
    const cases: [string, Record<string, string>?][] = [
      ['/', { 'accept-language': '!!!,,,;;;q=x' }],
      ['/', { 'accept-language': '<script>alert(1)</script>' }],
      ['/', { 'accept-language': 'de-DE,'.repeat(1500) }],
      ['/', { cookie: 'user-locale=%E0%A4%A' }],
      ['/', { cookie: 'user-locale=%%%; x' }],
      ['/', { cookie: 'user-locale=__proto__' }],
      ['/', { cookie: `user-locale=${'x'.repeat(12000)}` }],
      ['/?locale=<script>alert(1)</script>'],
      ['/?locale=__proto__'],
      ['/%E0%A4%A'],
      ['/de/%E0%A4%A'],
      ['/%00'],
      [`${baseURL}//de//one`],
      [`/de/${'a'.repeat(8000)}`],
      ['/de.'],
      ['/__proto__'],
      ['/_locales/%E0%A4%A/en/data.json'],
      ['/_locales/__proto__/en/data.json'],
      ['/_locales/constructor/en/data.json'],
      ['/_locales/index/__proto__/data.json'],
      ['/_locales/..%2F..%2F..%2Fserver/en/data.json'],
    ]
    for (const [path, headers] of cases) {
      const { status, html } = await ssr(baseURL, path, { accept: 'text/html', ...headers })
      expect(status, path).toBeLessThan(500)
      expect(html, path).not.toContain('<script>alert(1)')
    }
    for (const method of ['HEAD', 'OPTIONS', 'POST']) {
      const { status } = await fetch(new URL('/de', baseURL), { method })
      expect(status, method).toBeLessThan(500)
    }
  })
})
