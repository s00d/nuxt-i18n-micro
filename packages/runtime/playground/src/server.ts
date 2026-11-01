// `pnpm serve`: every API item as a page of `data-testid` rows. Driven by `benchmark/integrations/matrix.mjs`.
import { createI18n, fetchJsonTranslations, FormatService, I18n, interpolate } from '@i18n-micro/runtime'
import * as all from '@i18n-micro/runtime'
import { messages } from '../../../../benchmark/integrations/catalogue'
import { type Create, instancePages } from '../../../../benchmark/integrations/instance-pages'
import { rowsOf, serve } from '../../../../benchmark/integrations/server'

const port = Number(process.env.PORT ?? 5900)
const url = (path: string) => `http://127.0.0.1:${port}${path}`
const fresh = () => createI18n({ locale: 'en', fallbackLocale: 'en', missingWarn: false })

const settled = async (run: () => Promise<unknown>): Promise<string> => {
  try {
    return JSON.stringify(await run())
  } catch (error) {
    return `throws: ${(error as Error).message.replace(/:\d{4}\b/, '')}`
  }
}

serve(
  {
    ...instancePages(createI18n as unknown as Create),
    exports: () =>
      rowsOf([
        ['is-instance', () => fresh() instanceof I18n],
        ['interpolate', () => interpolate('Hi {name}', { name: 'Ada' })],
        ['format-number', () => new FormatService().formatNumber(1234.5, 'de')],
        ['format-date', () => new FormatService({ timeZone: 'UTC' }).formatDate(0, 'en')],
        ['format-relative', () => new FormatService({ now: () => 7_200_000 }).formatRelativeTime(0, 'en')],
        ['locale-iso-map', () => all.localeIsoMap([{ code: 'ua', iso: 'uk-UA' }, { code: 'en' }])],
      ]),
    fetch: async () => {
      const load = async (run: (i18n: I18n) => Promise<unknown>, read: (i18n: I18n) => unknown) => {
        const i18n = fresh()
        const outcome = await settled(() => run(i18n))
        return [outcome, read(i18n)]
      }
      const list = [
        ['fetch-json', await settled(() => fetchJsonTranslations(url('/locales/de.json')))],
        ['fetch-404', await settled(() => fetchJsonTranslations(url('/none.json')))],
        [
          'url-default-locale',
          await load(
            (i) => i.loadFromUrl(url('/locales/en.json')),
            (i) => i.t('welcome'),
          ),
        ],
        [
          'url-locale',
          await load(
            (i) => i.loadFromUrl(url('/locales/de.json'), { locale: 'de' }),
            (i) => [i.t('welcome'), (i.locale = 'de'), i.t('welcome')],
          ),
        ],
        [
          'url-route',
          await load(
            (i) => i.loadFromUrl(url('/locales/en.json'), { routeName: 'home' }),
            (i) => [i.t('welcome'), i.t('welcome', undefined, undefined, 'home')],
          ),
        ],
        [
          'url-init',
          await load(
            (i) => i.loadFromUrl(url('/echo'), { init: { headers: { 'x-a': '1' } } }),
            (i) => i.t('welcome'),
          ),
        ],
        [
          'urls-order',
          await load(
            (i) =>
              i.loadFromUrls([
                { url: url('/locales/en.json'), locale: 'en' },
                { url: url('/locales/de.json'), locale: 'en' },
              ]),
            (i) => i.t('welcome'),
          ),
        ],
        [
          'urls-failed-keeps',
          await load(
            (i) =>
              i.loadFromUrls([
                { url: url('/locales/en.json'), locale: 'en' },
                { url: url('/none.json'), locale: 'en' },
              ]),
            (i) => i.t('welcome'),
          ),
        ],
      ] as const
      return list.map(([id, value]) => ({ id, value: JSON.stringify(value) }))
    },
  },
  (path, headers) => {
    if (path === '/echo') return { welcome: headers['x-a'] ?? 'no header' }
    const locale = /^\/locales\/(\w+)\.json$/.exec(path)?.[1]
    return locale ? messages[locale] : undefined
  },
)
