/**
 * route-strategy against its documented semantics, over the generated config matrix:
 * - vue-router accepts the generated routes (no relative top-level paths),
 * - route names are unique (vue-router silently drops all but the last duplicate),
 * - every locale serves `about-team` at the documented URL:
 *   top-level and flat pages use the custom value as the full path; a child value is relative
 *   to the parent unless it already starts with the parent's localized path (then it is the
 *   full URL); the build picks the file-path key over the name key.
 */
import { describe, expect, test } from 'vitest'
import {
  createAppRouter,
  DEFAULT_LOCALE,
  duplicateNames,
  generate,
  LOCALE_CODES,
  matrixConfigs,
  routerUrl,
  type Rules,
  SHAPES,
  STRATEGIES,
  type Strategy,
} from './helpers/routing-matrix'

const strip = (p: string) => p.replace(/^\/+/, '').replace(/\/+$/, '')
const pick = (rules: Rules, keys: string[]) => keys.map((k) => rules[k]).find(Boolean)

/** Documented URL (without locale prefix) of `about-team` in `locale`. */
function specPath(shape: string, rules: Rules, locale: string): string {
  if (shape === 'sibling') {
    const value = pick(rules, ['about-team', '/about-team'])?.[locale]
    return value ? `/${strip(value)}` : '/about-team'
  }
  const own = pick(rules, ['about/team', '/about/team', 'about-team'])?.[locale]
  if (shape === 'flat') return own ? `/${strip(own)}` : '/about/team'
  const parentValue = pick(rules, ['about', '/about'])?.[locale]
  const parent = parentValue ? `/${strip(parentValue)}` : '/about'
  if (!own) return `${parent}/team`
  if (!own.startsWith('/')) return `${parent}/${strip(own)}`
  const full = `/${strip(own)}`
  if (full === parent) return parent
  if (full.startsWith(`${parent}/`)) return full
  // a full URL that leaves the parent's path keeps what follows the shared part
  const value = strip(own).split('/')
  const parentSegments = strip(parent).split('/')
  let shared = 0
  while (shared < value.length && shared < parentSegments.length && value[shared] === parentSegments[shared]) shared++
  return `${parent}/${value.slice(shared).join('/')}`.replace(/\/$/, '')
}

const prefixed = (strategy: Strategy, locale: string, path: string) =>
  strategy === 'no_prefix' || (strategy === 'prefix_except_default' && locale === DEFAULT_LOCALE) ? path : `/${locale}${path === '/' ? '' : path}`

const configs = matrixConfigs()

describe('route-strategy build matches the documented semantics', () => {
  for (const strategy of STRATEGIES) {
    test(`${strategy}: ${configs.length * Object.keys(SHAPES).length} configs`, () => {
      const problems: string[] = []
      for (const shape of Object.keys(SHAPES)) {
        for (const { label, rules } of configs) {
          const id = `${shape} | ${label}`
          const pages = generate(strategy, shape, rules)
          const duplicates = duplicateNames(pages)
          if (duplicates.length) problems.push(`${id}: duplicate route names ${duplicates.join(', ')}`)
          let router
          try {
            router = createAppRouter(pages)
          } catch (error) {
            problems.push(`${id}: vue-router rejects the routes: ${(error as Error).message}`)
            continue
          }
          for (const locale of LOCALE_CODES) {
            const expected = prefixed(strategy, locale, specPath(shape, rules, locale))
            const actual = routerUrl(strategy, locale, router)
            if (actual !== expected) problems.push(`${id} | ${locale}: ${actual ?? 'no route'}, expected ${expected}`)
          }
          if (strategy === 'prefix_and_default') {
            // the default locale is also served without a prefix, at its custom path
            const expected = specPath(shape, rules, DEFAULT_LOCALE)
            const actual = router.hasRoute('about-team') ? router.resolve({ name: 'about-team' }).path : 'no route'
            if (actual !== expected) problems.push(`${id} | unprefixed default: ${actual}, expected ${expected}`)
          }
        }
      }
      expect(problems.slice(0, 20)).toEqual([])
    })
  }
})
