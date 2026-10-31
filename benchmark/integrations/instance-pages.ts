// Pages for a bare instance (`@i18n-micro/runtime`, `@i18n-micro/node`): everything the class can do beyond the read calls.
import { bigKey, bigMessages, caseRows, type I18nLike, instanceOptions, localeCodes, messages, routeMessages, show } from './catalogue'
import { type Page, rowsOf } from './server'

// oxlint-disable-next-line typescript/no-explicit-any -- the old and new class differ on purpose: a missing method is a row of its own
export type Instance = I18nLike & Record<string, any>
export type Create = (options: Record<string, unknown>) => Instance

const tick = (ms: number) => new Promise((done) => setTimeout(done, ms))

export const fullOptions = (locale: string) => ({ locale, ...instanceOptions, messages, routeMessages })

export function instancePages(create: Create): Record<string, Page> {
  const shared = create(fullOptions('en'))
  /** One request's instance: a cheap fork where the class has one. */
  const perRequest = (locale: string): Instance => (shared.fork ? shared.fork(locale) : create(fullOptions(locale)))
  const fresh = (locale = 'en', extra: object = {}) => create({ ...fullOptions(locale), ...extra })

  const writes = (): ReturnType<typeof rowsOf> => {
    const input = { a: { b: 'x' } }
    const snapshot = JSON.stringify(input)
    return rowsOf([
      [
        'add-merge',
        () => {
          const i = fresh()
          i.addTranslations('en', { added: 'yes', section: { title: 'New' } })
          return [i.t('added'), i.t('section.title'), i.t('section.deep.er.value')]
        },
      ],
      [
        'add-replace',
        () => {
          const i = fresh()
          i.addTranslations('en', { added: 'yes' }, false)
          return [i.t('added'), i.t('welcome')]
        },
      ],
      [
        'add-route-merge',
        () => {
          const i = fresh()
          i.addRouteTranslations('en', 'home', { extra: 'r' })
          return [i.t('extra', undefined, undefined, 'home'), i.t('title', undefined, undefined, 'home')]
        },
      ],
      [
        'add-route-replace',
        () => {
          const i = fresh()
          i.addRouteTranslations('en', 'home', { extra: 'r' }, false)
          return [i.t('extra', undefined, undefined, 'home'), i.t('title', undefined, undefined, 'home')]
        },
      ],
      [
        'add-input-untouched',
        () => {
          const i = fresh()
          i.addTranslations('en', input)
          i.setTranslation('a.b', 'y')
          return JSON.stringify(input) === snapshot
        },
      ],
      [
        'set-translation',
        () => {
          const i = fresh()
          i.setTranslation('section.title', 'Set')
          return [i.t('section.title'), i.t('section.deep.er.value')]
        },
      ],
      [
        'set-translation-subtree',
        () => {
          const i = fresh()
          i.setTranslation('section', { only: 'x' })
          return [i.t('section.only'), i.t('section.title')]
        },
      ],
      [
        'load-messages',
        () => {
          const i = create({ locale: 'en' })
          i.loadMessages({ en: { a: '1' } }, { p: { en: { b: '2' } } })
          return [i.t('a'), i.t('b', undefined, undefined, 'p')]
        },
      ],
      [
        'clear-then-read',
        () => {
          const i = fresh()
          i.clear()
          return i.t('welcome')
        },
      ],
      [
        'clear-cache-then-read',
        () => {
          const i = fresh()
          i.clearCache()
          return i.t('welcome')
        },
      ],
      [
        'has-translation',
        () => {
          const i = fresh()
          i.setRoute('about')
          return [i.hasTranslation('title'), i.hasTranslation('no.such'), i.has('title')]
        },
      ],
      [
        'locale-get-set',
        () => {
          const i = fresh()
          i.locale = 'de'
          return [i.locale, i.getLocale(), i.t('welcome')]
        },
      ],
      [
        'fallback-get-set',
        () => {
          const i = fresh('pt')
          const before = i.t('welcome')
          i.fallbackLocale = 'de'
          return [before, i.fallbackLocale, i.getFallbackLocale(), i.t('welcome')]
        },
      ],
      [
        'fallback-default',
        () => {
          const i = create({ locale: 'de', messages })
          return [i.getFallbackLocale(), i.t('only.en')]
        },
      ],
      [
        'route-get-set',
        () => {
          const i = fresh()
          i.setRoute('home')
          return [i.getRoute(), i.currentRoute, i.t('title')]
        },
      ],
      ['route-default', () => fresh().getRoute()],
      [
        'subscribe-locale',
        () => {
          const i = fresh()
          let n = 0
          const off = i.subscribe(() => n++)
          i.locale = 'de'
          i.locale = 'de'
          off()
          i.locale = 'fr'
          return n
        },
      ],
      [
        'subscribe-add-active',
        () => {
          const i = fresh()
          let n = 0
          i.subscribe(() => n++)
          i.addTranslations('en', { x: '1' })
          return n
        },
      ],
      [
        'subscribe-add-other',
        () => {
          const i = fresh()
          let n = 0
          i.subscribe(() => n++)
          i.addTranslations('fr', { x: '1' })
          return n
        },
      ],
      [
        'subscribe-throwing',
        () => {
          const i = fresh()
          let n = 0
          i.subscribe(() => {
            throw new Error('peer')
          })
          i.subscribe(() => n++)
          try {
            i.locale = 'de'
          } catch {}
          return n
        },
      ],
      [
        'snapshot-changes',
        () => {
          const i = fresh()
          const a = i.getSnapshot()
          i.locale = 'de'
          return a !== i.getSnapshot()
        },
      ],
      [
        'extend',
        () => {
          const i = fresh()
          const e = i.extend({
            hello(this: Instance) {
              return this.t('welcome')
            },
          })
          return e.hello()
        },
      ],
      [
        'plural-custom',
        () => {
          const i = fresh('en', { plural: (_k: string, count: number) => `custom ${count}` })
          return i.tc('apples', 2)
        },
      ],
      [
        'plural-custom-null',
        () => {
          const i = fresh('en', { plural: () => null })
          return i.tc('apples', 2)
        },
      ],
      [
        'missing-handler',
        () => {
          const seen: string[] = []
          const i = fresh('de', { missingHandler: (l: string, k: string, r: string) => seen.push(`${l}/${k}/${r}`) })
          i.t('no.key')
          i.tc('no.key2', 2)
          i.t('welcome')
          return seen
        },
      ],
      [
        'missing-warn-on',
        () => {
          const logged: string[] = []
          const { warn } = console
          const had = 'window' in globalThis
          console.warn = (m: string) => logged.push(String(m))
          Object.assign(globalThis, { window: {} })
          const i = fresh('de', { missingWarn: true })
          i.t('no.key')
          console.warn = warn
          if (!had) Reflect.deleteProperty(globalThis, 'window')
          return logged
        },
      ],
      [
        'locale-iso-plural',
        () => {
          const i = create({ locale: 'ua', messages: { ua: { n: '=0 нуль | одне | кілька | багато | інше' } }, localeIso: { ua: 'uk-UA' } })
          return [i.tc('n', 0), i.tc('n', 1), i.tc('n', 3), i.tc('n', 5)]
        },
      ],
      [
        'add-locale-iso',
        () => {
          const i = create({ locale: 'ua', messages: { ua: { n: '=0 нуль | одне | кілька | багато | інше' } } })
          i.addLocaleIso({ ua: 'uk-UA' })
          return [i.tc('n', 3), i.pluralLocale()]
        },
      ],
      ['option-now', () => create({ locale: 'en', now: () => 1_000_000_000 }).tdr(1_000_000_000 - 7_200_000)],
      [
        'option-timezone',
        () => create({ locale: 'en', timeZone: 'Asia/Tokyo' }).td(Date.UTC(2024, 0, 15, 20), { hour: 'numeric', day: 'numeric', hour12: false }),
      ],
      [
        'resolve-translations',
        () => {
          const i = fresh()
          i.setRoute('about')
          const all = i.resolveTranslations()
          return [all.title, all.welcome]
        },
      ],
      [
        'storage-read',
        () => {
          const i = fresh()
          return typeof i.storage.translations
        },
      ],
      [
        'fork-locale',
        () => {
          const parent = fresh()
          const child = parent.fork('de')
          return [child.t('welcome'), parent.t('welcome')]
        },
      ],
      [
        'fork-sees-parent',
        () => {
          const parent = fresh()
          const child = parent.fork('en')
          parent.addTranslations('en', { later: 'yes' })
          return child.t('later')
        },
      ],
      [
        'fork-write-stays',
        () => {
          const parent = fresh()
          const child = parent.fork('en')
          child.addTranslations('en', { mine: 'yes' })
          return [child.t('mine'), parent.t('mine')]
        },
      ],
      [
        'fork-of-fork',
        () => {
          const a = fresh()
          const b = a.fork('de')
          const c = b.fork('fr')
          return [a.getLocale(), b.getLocale(), c.getLocale(), c.t('welcome')]
        },
      ],
      [
        'fork-route',
        () => {
          const parent = fresh()
          parent.setRoute('home')
          const child = parent.fork('de')
          child.setRoute('about')
          return [child.t('title'), parent.t('title')]
        },
      ],
    ])
  }

  const race = async (query: URLSearchParams): Promise<string[]> => {
    const count = Number(query.get('count') ?? 200)
    const outcomes = await Promise.all(
      Array.from({ length: count }, async (_, n) => {
        const locale = localeCodes[n % 5]!
        const instance = perRequest(locale)
        const expected = show(instance.t('welcome'))
        await tick(n % 7)
        return show(instance.t('welcome')) === expected ? '' : `${locale}:${n}`
      }),
    )
    return outcomes.filter(Boolean)
  }

  return {
    cases: (query) => caseRows(perRequest(query.get('locale') ?? 'en')),
    writes,
    forks: async (query) => [{ id: 'leaks', value: show(await race(query)) }],
    big: (query) => {
      const size = Number(query.get('size') ?? 5000)
      const calls = Number(query.get('calls') ?? 200_000)
      const i = create({ locale: 'en', messages: { en: bigMessages(size, 'en'), de: bigMessages(size, 'de') } })
      const started = performance.now()
      let length = 0
      for (let n = 0; n < calls; n++) length += (i.t(bigKey(n % size), { x: n }) as string).length
      return rowsOf([
        ['sample', () => i.t(bigKey(1234), { x: 'y' })],
        ['length', () => length],
        ['ms', () => Math.round(performance.now() - started)],
      ])
    },
    memory: async (query) => {
      const rounds = Number(query.get('rounds') ?? 6)
      const calls = Number(query.get('calls') ?? 500_000)
      const heap: number[] = []
      for (let round = 0; round < rounds; round++) {
        const instance = perRequest(localeCodes[round % 5]!)
        for (let n = 0; n < calls; n++) {
          instance.t('greeting', { name: n })
          instance.t(`miss.${n % 1000}`)
          instance.tn(n)
        }
        // oxlint-disable-next-line no-await-in-loop -- rounds are measured one after the other
        await tick(0)
        globalThis.gc?.()
        heap.push(Math.round(process.memoryUsage().heapUsed / 1e6))
      }
      return rowsOf([['heap-mb', () => heap]])
    },
  }
}
