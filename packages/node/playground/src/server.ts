// `pnpm serve`: every API item as a page of `data-testid` rows. Driven by `benchmark/integrations/matrix.mjs`.
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createI18n, FormatService, I18n, interpolate, loadRootTranslations, loadTranslations } from '@i18n-micro/node'
import * as all from '@i18n-micro/node'
import { caseRows, localeCodes, show } from '../../../../benchmark/integrations/catalogue'
import { type Create, fullOptions, type Instance, instancePages } from '../../../../benchmark/integrations/instance-pages'
import { rowsOf, serve } from '../../../../benchmark/integrations/server'

const dir = fileURLToPath(new URL('./locales', import.meta.url))
const tick = (ms: number) => new Promise((done) => setTimeout(done, ms))
const shared = createI18n(fullOptions('en')) as unknown as Instance

const settled = async (id: string, run: () => Promise<unknown>) => {
  try {
    return { id, value: show(await run()) }
  } catch (error) {
    return { id, value: `throws: ${(error as Error).message}` }
  }
}

/** Runs against a copy of the folder, so a test can rewrite files. */
async function inCopy(run: (copy: string) => Promise<unknown>): Promise<unknown> {
  const copy = mkdtempSync(join(tmpdir(), 'i18n-bench-'))
  cpSync(dir, copy, { recursive: true })
  try {
    return await run(copy)
  } finally {
    rmSync(copy, { recursive: true, force: true })
  }
}

const quietly = async (run: () => Promise<unknown>): Promise<unknown> => {
  const { warn, log, error } = console
  const said: string[] = []
  console.warn = console.log = console.error = (...parts: unknown[]) => void said.push(parts.join(' ').replaceAll(dir, 'DIR'))
  try {
    return [await run(), said]
  } finally {
    Object.assign(console, { warn, log, error })
  }
}

serve({
  ...instancePages(createI18n as unknown as Create),
  exports: () =>
    rowsOf([
      ['is-instance', () => createI18n({ locale: 'en' }) instanceof I18n],
      ['interpolate', () => interpolate('Hi {name}', { name: 'Ada' })],
      ['format-number', () => new FormatService().formatNumber(1234.5, 'de')],
      ['locale-iso-map', () => all.localeIsoMap([{ code: 'ua', iso: 'uk-UA' }, { code: 'en' }])],
    ]),
  // one after the other: `quietly` swaps the console
  files: async () => {
    const steps: Array<[string, () => Promise<unknown>]> = [
      [
        'load-function',
        async () => {
          const { root, routes } = await loadTranslations(dir)
          return [Object.keys(root).sort(), Object.keys(routes).sort(), (root.en as Record<string, unknown>).welcome]
        },
      ],
      ['load-root', async () => Object.keys(await loadRootTranslations(dir)).sort()],
      ['load-disabled-pages', async () => Object.keys((await loadTranslations(dir, true)).root).sort()],
      ['load-missing-dir', () => quietly(() => loadTranslations(join(dir, 'nope')))],
      [
        'instance-load',
        async () => {
          const i = createI18n({ locale: 'en', fallbackLocale: 'en', translationDir: dir, missingWarn: false })
          await i.loadTranslations()
          i.setRoute('home')
          return [i.t('welcome'), i.t('title'), i.t('hero.title'), i.t('title', undefined, undefined, 'about')]
        },
      ],
      [
        'instance-load-arg',
        async () => {
          const i = createI18n({ locale: 'de', missingWarn: false })
          await i.loadTranslations(dir)
          return i.t('welcome')
        },
      ],
      ['instance-load-none', () => quietly(() => createI18n({ locale: 'en' }).loadTranslations())],
      [
        'instance-no-page-locales',
        async () => {
          const i = createI18n({ locale: 'en', translationDir: dir, disablePageLocales: true, missingWarn: false })
          await i.loadTranslations()
          return [i.t('welcome'), i.t('title', undefined, undefined, 'home')]
        },
      ],
      [
        'reload-reads-new',
        () =>
          inCopy(async (copy) => {
            const i = createI18n({ locale: 'en', translationDir: copy, missingWarn: false })
            await i.loadTranslations()
            writeFileSync(join(copy, 'en.json'), '{"welcome":"Reloaded"}')
            await quietly(() => i.reload())
            return [i.t('welcome'), i.t('greeting')]
          }),
      ],
      [
        'reload-dir-gone',
        () =>
          inCopy(async (copy) => {
            const i = createI18n({ locale: 'en', translationDir: copy, missingWarn: false })
            await i.loadTranslations()
            rmSync(copy, { recursive: true })
            await quietly(() => i.reload())
            return i.t('welcome')
          }),
      ],
      ['reload-no-dir', () => quietly(() => createI18n({ locale: 'en' }).reload())],
      [
        'broken-file',
        () =>
          inCopy(async (copy) => {
            writeFileSync(join(copy, 'bad.json'), '{oops')
            const [loaded, said] = (await quietly(() => loadTranslations(copy))) as [Awaited<ReturnType<typeof loadTranslations>>, string[]]
            return [Object.keys(loaded.root).sort(), said.length]
          }),
      ],
      [
        'fork-keeps-dir',
        async () => {
          const parent = createI18n({ locale: 'en', translationDir: dir, missingWarn: false })
          const child = parent.fork('de')
          await child.loadTranslations()
          return [child.translationDir === dir, child.t('welcome'), parent.t('welcome')]
        },
      ],
    ]
    const rows = []
    // oxlint-disable-next-line no-await-in-loop -- see above
    for (const [id, run] of steps) rows.push(await settled(id, run))
    return rows
  },
  run: async (query) => {
    const count = Number(query.get('count') ?? 200)
    const outcomes = await Promise.all(
      Array.from({ length: count }, (_, n) => {
        const locale = localeCodes[n % 5]!
        return shared.run(locale, async () => {
          const before = show(shared.t('welcome'))
          await tick(n % 7)
          const after = show(shared.t('welcome'))
          return shared.locale === locale && before === after ? '' : `${locale}:${n}`
        })
      }),
    )
    return rowsOf([
      ['leaks', () => outcomes.filter(Boolean)],
      ['outside-run', () => shared.locale],
    ])
  },
  'run-cases': (query) => shared.run(query.get('locale') ?? 'en', (fork: Instance) => caseRows(fork)),
  'run-set': async () =>
    rowsOf([
      ['set-inside', () => shared.run('de', () => ((shared.locale = 'fr'), shared.t('welcome')))],
      ['route-inside', () => shared.run('de', () => (shared.setRoute('home'), shared.t('title')))],
      ['after', () => [shared.locale, shared.getRoute()]],
      ['nested', () => shared.run('de', () => shared.run('fr', () => shared.t('welcome')))],
      [
        'throws-clean',
        () => {
          try {
            shared.run('de', () => {
              throw new Error('x')
            })
          } catch {}
          return shared.locale
        },
      ],
      ['sync-result', () => shared.run('de', () => 41 + 1)],
    ]),
})
