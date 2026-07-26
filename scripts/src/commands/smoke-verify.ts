import { defineCommand } from 'citty'

interface CheckResult {
  name: string
  ok: boolean
  detail: string
}

export const smokeVerifyCommand = defineCommand({
  meta: {
    name: 'smoke-verify',
    description: [
      'Assert that a running deployment of the smoke app actually works.',
      '',
      'Written against a base URL rather than a build directory, so the same checks run',
      'against a locally started server, a Cloudflare Pages deployment and a Vercel one —',
      'a release is only verified if the thing users will hit behaves.',
      '',
      'Examples:',
      '  pnpm -C scripts cli smoke-verify --url http://127.0.0.1:3000',
      '  pnpm -C scripts cli smoke-verify --url https://foo.pages.dev --json',
    ].join('\n'),
  },
  args: {
    url: {
      type: 'string',
      required: true,
      description: 'Base URL of the running app',
    },
    json: {
      type: 'boolean',
      default: false,
      description: 'Print machine-readable output',
    },
  },
  async setup({ args }) {
    const base = args.url.replace(/\/+$/, '')
    const results: CheckResult[] = []

    const check = async (name: string, fn: () => Promise<string>) => {
      try {
        results.push({ name, ok: true, detail: await fn() })
      } catch (error) {
        results.push({ name, ok: false, detail: String((error as Error)?.message ?? error).slice(0, 300) })
      }
    }

    const get = async (path: string) => {
      const res = await fetch(`${base}${path}`, { redirect: 'follow', signal: AbortSignal.timeout(60_000) })
      return { res, body: await res.text() }
    }

    const expect = (condition: boolean, message: string) => {
      if (!condition) throw new Error(message)
    }

    /** A bare translation key rendered as text — what a broken payload looks like on screen. */
    const RAW_KEY = /<(?:h1|p|a)[^>]*>\s*(?:[a-z0-9_]+(?:\.[a-z0-9_]+)+|nav\.\w+)\s*<\//i

    // --- SSR and localized routes -----------------------------------------------------

    await check('default locale renders translated content', async () => {
      const { res, body } = await get('/')
      expect(res.ok, `HTTP ${res.status}`)
      expect(body.includes('Smoke Home EN'), 'page title missing')
      expect(body.includes('Hello World EN'), 'interpolated greeting missing')
      return `${body.length} bytes`
    })

    // Sequential on purpose: results are printed in order, and a deployment being
    // smoke-tested should not be hit with a burst of parallel requests.
    // oxlint-disable-next-line no-await-in-loop
    const localeCases: [string, string, string][] = [
      ['de', 'Smoke Home DE', 'Hallo World DE'],
      ['fr', 'Smoke Home FR', 'Bonjour World FR'],
    ]
    for (const [locale, title, greeting] of localeCases) {
      // oxlint-disable-next-line no-await-in-loop
      await check(`/${locale} renders its own translations`, async () => {
        const { res, body } = await get(`/${locale}`)
        expect(res.ok, `HTTP ${res.status}`)
        expect(body.includes(title), `expected "${title}"`)
        expect(body.includes(greeting), `expected "${greeting}"`)
        return `${body.length} bytes`
      })
    }

    await check('page-scoped translations resolve on a second route', async () => {
      const { res, body } = await get('/de/about')
      expect(res.ok, `HTTP ${res.status}`)
      expect(body.includes('Smoke About DE'), 'about title missing')
      expect(body.includes('About body DE'), 'about body missing')
      return 'ok'
    })

    await check('plural form resolves', async () => {
      const { body } = await get('/de')
      expect(body.includes('2 Einträge'), 'plural form missing')
      return 'ok'
    })

    await check('no raw translation keys in the HTML', async () => {
      // oxlint-disable-next-line no-await-in-loop -- see above
      for (const path of ['/', '/de', '/fr', '/de/about']) {
        // oxlint-disable-next-line no-await-in-loop
        const { body } = await get(path)
        const hit = body.match(RAW_KEY)
        expect(!hit, `${path} rendered a raw key: ${hit?.[0]?.slice(0, 60)}`)
      }
      return 'checked 4 pages'
    })

    // --- Translation payload route ----------------------------------------------------

    await check('_locales payload responds with translations', async () => {
      const { res, body } = await get('/_locales/index/de/data.json')
      expect(res.ok, `HTTP ${res.status}`)
      const data = JSON.parse(body)
      expect(data.title === 'Smoke Home DE', `unexpected payload: ${body.slice(0, 120)}`)
      return `${body.length} bytes`
    })

    await check('_locales payload is cacheable', async () => {
      const { res } = await get('/_locales/index/de/data.json')
      const cacheControl = res.headers.get('cache-control') ?? ''
      // Static hosts answer from their own CDN layer and may rewrite this; only the
      // absence of an explicit no-store is a real problem.
      expect(!/no-store/i.test(cacheControl), `Cache-Control: ${cacheControl}`)
      return cacheControl || '(none)'
    })

    // --- SEO ---------------------------------------------------------------------------

    await check('hreflang alternates are emitted', async () => {
      const { body } = await get('/de')
      for (const locale of ['en', 'de', 'fr']) {
        expect(body.includes(`hreflang="${locale}`), `missing hreflang for ${locale}`)
      }
      expect(body.includes('hreflang="x-default"'), 'missing x-default')
      return 'en, de, fr, x-default'
    })

    await check('canonical and og:locale are emitted', async () => {
      const { body } = await get('/fr')
      expect(/<link[^>]+rel="canonical"/i.test(body), 'missing canonical')
      expect(/og:locale/i.test(body), 'missing og:locale')
      return 'ok'
    })

    await check('html lang matches the locale', async () => {
      const { body } = await get('/de')
      expect(/<html[^>]+lang="de/i.test(body), 'html lang is not de')
      return 'ok'
    })

    const failed = results.filter((r) => !r.ok)

    if (args.json) {
      console.log(JSON.stringify({ base, results, failed: failed.length }, null, 2))
    } else {
      console.log(`\nSmoke checks against ${base}\n`)
      for (const r of results) {
        console.log(`  ${r.ok ? '\u2713' : '\u2716'} ${r.name}${r.ok ? ` \u2014 ${r.detail}` : ''}`)
        if (!r.ok) console.log(`      ${r.detail}`)
      }
      console.log(`\n${results.length - failed.length}/${results.length} passed\n`)
    }

    if (failed.length > 0) process.exit(1)
  },
})
