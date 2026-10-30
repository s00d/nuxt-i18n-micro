/**
 * Characterization of locale detection: every call is one `call → result` line in
 * `__golden__/detection.md`, so a behaviour change shows up as a one-line diff.
 */
import { expect, test } from 'vitest'
import { applyAutoDetectLanguage, detectLocaleFromAcceptLanguage, parseAcceptLanguage } from '../src/accept-language'
import { shouldAttemptLocaleRedirect } from '../src/auto-detect-path'
import { resolveLocale } from '../src/resolve-locale'

const show = (value: unknown) => (value === undefined ? 'undefined' : JSON.stringify(value))

function report(): string {
  const lines: string[] = []
  const section = (title: string) => lines.push('', `## ${title}`, '')
  const run = (label: string, fn: () => unknown) => {
    let out: string
    try {
      out = show(fn())
    } catch (error) {
      out = `throws ${(error as Error).name}: ${(error as Error).message}`
    }
    lines.push(`- \`${label}\` → ${out}`)
  }

  const headers = [
    undefined,
    '',
    'de',
    'de-DE',
    'DE-de',
    'en-US,en;q=0.9',
    'fr;q=0.1,de;q=0.9',
    'de;q=0,en',
    'en;q=0.5,de',
    '*',
    '*;q=0.5,fr',
    'en-US',
    'pt',
    'pt-BR',
    'zh-Hant-TW,zh;q=0.8',
    ' de , en ',
    ';;,,',
    'en;q=abc,de',
    'x'.repeat(40),
    '__proto__,constructor',
  ]
  const localeSets = [
    ['en', 'de', 'fr'],
    ['en-GB', 'de'],
    ['pt-BR', 'en'],
    ['zh', 'zh-Hant'],
  ]

  section('parseAcceptLanguage')
  for (const header of headers) run(`parseAcceptLanguage(${show(header)})`, () => parseAcceptLanguage(header))

  section('detectLocaleFromAcceptLanguage')
  for (const locales of localeSets) {
    for (const header of headers) run(`detect(${show(header)}, ${show(locales)})`, () => detectLocaleFromAcceptLanguage(header, locales))
  }

  section('applyAutoDetectLanguage')
  for (const explicit of [false, true]) {
    for (const auto of [undefined, false, true]) {
      run(`apply('en', explicit=${explicit}, auto=${auto}, 'de')`, () => applyAutoDetectLanguage('en', explicit, auto, 'de', ['en', 'de']))
    }
  }

  section('resolveLocale: url, query, cookie')
  const validLocales = ['en', 'de', 'ru']
  const urls: [boolean, string | null][] = [
    [false, null],
    [true, 'de'],
    [true, 'xx'],
    [false, 'de'],
  ]
  for (const [hasLocaleInUrl, urlLocale] of urls) {
    for (const queryLocale of [null, 'ru', 'xx']) {
      for (const cookieLocale of [null, 'de', 'xx']) {
        for (const autoDetectLanguage of [false, true]) {
          const input = {
            defaultLocale: 'en',
            validLocales,
            autoDetectLanguage,
            url: hasLocaleInUrl ? urlLocale : null,
            query: queryLocale,
            cookie: cookieLocale,
            acceptLanguage: 'ru,de;q=0.5',
          }
          run(
            `server(url=${hasLocaleInUrl ? 'prefix' : 'segment'}:${urlLocale}, q=${queryLocale}, cookie=${cookieLocale}, auto=${autoDetectLanguage})`,
            () => resolveLocale(input),
          )
        }
      }
    }
  }

  section('resolveLocale: state, cookie')
  for (const stateLocale of [null, 'ru', 'xx']) {
    for (const cookieLocale of [null, 'de', 'xx']) {
      for (const ignoreStateLocale of [false, true]) {
        for (const autoDetectLanguage of [false, true]) {
          const input = {
            defaultLocale: 'en',
            validLocales,
            autoDetectLanguage,
            state: ignoreStateLocale ? null : stateLocale,
            cookie: cookieLocale,
            acceptLanguage: 'ru',
          }
          run(`preferred(state=${stateLocale}, cookie=${cookieLocale}, ignoreState=${ignoreStateLocale}, auto=${autoDetectLanguage})`, () => resolveLocale(input))
        }
      }
    }
  }

  section('shouldAttemptLocaleRedirect')
  const paths = ['', '/', '/about', '/about/', '/de', '/de/about', '/welcome', '/welcome/', '/welcome/x']
  for (const autoDetectPath of [undefined, '/', '', '*', 'no_prefix', '/welcome', 'welcome']) {
    for (const path of paths) {
      for (const hasLocalePrefix of [false, true]) {
        run(`redirect(${show(path)}, mode=${show(autoDetectPath)}, prefixed=${hasLocalePrefix})`, () =>
          shouldAttemptLocaleRedirect(path, { autoDetectPath, hasLocalePrefix }),
        )
      }
    }
  }

  return `${lines.join('\n').trim()}\n`
}

test('locale detection characterization', async () => {
  await expect(report()).toMatchFileSnapshot('./__golden__/detection.md')
})
