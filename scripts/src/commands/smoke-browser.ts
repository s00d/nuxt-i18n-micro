import { chromium } from '@playwright/test'
import { defineCommand } from 'citty'

interface CheckResult {
  name: string
  ok: boolean
  detail: string
}

export const smokeBrowserCommand = defineCommand({
  meta: {
    name: 'smoke-browser',
    description: [
      'Browser half of the release smoke check: hydration, client-side navigation and',
      'locale switching against a running deployment.',
      '',
      'Separate from `smoke-verify` because it needs Playwright and a browser download,',
      'which a plain HTTP check does not — those stay usable anywhere, including against',
      'a deployed URL from a machine with no browsers installed.',
      '',
      'Example:',
      '  pnpm -C scripts cli smoke-browser --url http://127.0.0.1:3000',
    ].join('\n'),
  },
  args: {
    url: {
      type: 'string',
      required: true,
      description: 'Base URL of the running app',
    },
  },
  async setup({ args }) {
    const base = args.url.replace(/\/+$/, '')
    const results: CheckResult[] = []

    const check = async (name: string, fn: () => Promise<string | null | undefined>) => {
      try {
        results.push({ name, ok: true, detail: (await fn()) ?? 'ok' })
      } catch (error) {
        results.push({ name, ok: false, detail: String((error as Error)?.message ?? error).slice(0, 300) })
      }
    }
    const expect = (condition: boolean, message: string) => {
      if (!condition) throw new Error(message)
    }

    const browser = await chromium.launch()
    const page = await browser.newPage()

    // A raw key surfacing mid-transition is the failure this is here to catch: the
    // merge-on-transition machinery exists precisely to prevent it.
    const keyHits = new Set<string>()
    // Passed as source text, not a function: tsx transpiles this file with esbuild's
    // keep-names on, which injects a `__name` helper — harmless in Node, but the browser
    // has never heard of it and every page then throws.
    await page.addInitScript({
      content: `
        window.__keyHits = new Set()
        var KEY_RE = /^(?:nav\\.\\w+|[a-z0-9_]+(?:\\.[a-z0-9_]+)+)$/
        var scan = function () {
          var nodes = document.querySelectorAll('h1,p,a')
          for (var i = 0; i < nodes.length; i++) {
            var text = (nodes[i].textContent || '').trim()
            if (text && text.length < 60 && KEY_RE.test(text)) window.__keyHits.add(text)
          }
        }
        // Init scripts run before the document exists, so the observer has to wait for a
        // node to attach to — otherwise every page logs an uncaught MutationObserver error.
        var observe = function () {
          new MutationObserver(scan).observe(document.documentElement, { subtree: true, childList: true, characterData: true })
        }
        if (document.documentElement) observe()
        else document.addEventListener('DOMContentLoaded', observe, { once: true })
      `,
    })

    /** Drain the page's hits before a navigation throws the document away. */
    const drainKeyHits = async () => {
      const hits = await page.evaluate(() => [...((window as unknown as { __keyHits?: Set<string> }).__keyHits ?? [])])
      for (const key of hits) keyHits.add(key)
    }

    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(String(error.message).slice(0, 200)))

    try {
      await check('app hydrates on the default locale', async () => {
        await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 60_000 })
        await page.waitForSelector('#title', { timeout: 30_000 })
        expect((await page.textContent('#title')) === 'Smoke Home EN', 'unexpected title')
        return await page.textContent('#title')
      })

      await check('client navigation to another page keeps translations', async () => {
        await page.click('#nav-about')
        await page.waitForURL('**/about', { timeout: 30_000 })
        await page.waitForSelector('#body', { timeout: 30_000 })
        expect((await page.textContent('#title')) === 'Smoke About EN', 'about title not translated')
        return await page.textContent('#title')
      })

      await check('locale switch loads the other dictionary', async () => {
        await drainKeyHits()
        await page.goto(`${base}/de`, { waitUntil: 'networkidle', timeout: 60_000 })
        await page.waitForSelector('#title', { timeout: 30_000 })
        expect((await page.textContent('#title')) === 'Smoke Home DE', 'German title missing')
        await page.click('#nav-about')
        await page.waitForURL('**/de/about', { timeout: 30_000 })
        expect((await page.textContent('#title')) === 'Smoke About DE', 'German about title missing')
        return 'de -> de/about'
      })

      await check('no raw translation key was ever visible', async () => {
        await drainKeyHits()
        expect(keyHits.size === 0, `saw: ${[...keyHits].slice(0, 5).join(', ')}`)
        return 'none'
      })

      await check('no uncaught page errors', async () => {
        expect(pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '))
        return 'none'
      })
    } finally {
      await browser.close()
    }

    const failed = results.filter((r) => !r.ok)
    console.log(`\nBrowser checks against ${base}\n`)
    for (const r of results) {
      console.log(`  ${r.ok ? '\u2713' : '\u2716'} ${r.name}${r.ok ? ` \u2014 ${r.detail}` : ''}`)
      if (!r.ok) console.log(`      ${r.detail}`)
    }
    console.log(`\n${results.length - failed.length}/${results.length} passed\n`)

    if (failed.length > 0) process.exit(1)
  },
})
