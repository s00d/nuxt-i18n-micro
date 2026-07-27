import { defineLoader } from 'vitepress'
import { dataFile, readData } from '../.vitepress/data/loaders'

export interface ModuleOption {
  path: string
  type: string
  default: string | null
  description: string
  optional: boolean
  deprecated: string | null
}

/** Options are shown in named groups; anything unlisted falls into "Other". */
const GROUPS: { title: string; blurb: string; match: (path: string) => boolean }[] = [
  {
    title: 'Locales and routing',
    blurb: 'Which languages exist and how they appear in the URL.',
    match: (path) =>
      ['locales', 'defaultLocale', 'strategy', 'globalLocaleRoutes', 'routeLocales', 'noPrefixRedirect', 'customRegexMatcher', 'excludePatterns', 'localeCookie'].includes(path),
  },
  {
    title: 'Translations',
    blurb: 'Where translation files live and how keys are resolved.',
    match: (path) => path.startsWith('translationDir') || ['disablePageLocales', 'fallbackLocale', 'plural', 'routesLocaleLinks', 'disableWatcher'].includes(path),
  },
  {
    title: 'Payloads and caching',
    blurb: 'How translations reach the browser. The Performance guide explains what these change at runtime.',
    match: (path) => path.startsWith('translationPayloads') || path.startsWith('api') || path === 'serverTranslationPreload',
  },
  { title: 'SEO', blurb: 'Meta tags generated for each localized page.', match: (path) => path.startsWith('meta') || path === 'canonicalQueryWhitelist' },
  { title: 'Detection and redirects', blurb: 'Choosing a locale for a visitor who has not picked one.', match: (path) => path.startsWith('autoDetect') || path === 'redirects' },
  { title: 'Registration', blurb: 'Parts of the module you can switch off.', match: (path) => ['define', 'plugin', 'hooks', 'components', 'types', 'debug'].includes(path) },
]

export interface ModuleOptionsData {
  groups: { title: string; blurb: string; options: ModuleOption[] }[]
  total: number
  deprecated: number
}

declare const data: ModuleOptionsData
export { data }

export default defineLoader({
  watch: [dataFile('module-options')],
  load(): ModuleOptionsData {
    const options = readData<ModuleOption[]>('module-options', [])
    const claimed = new Set<string>()

    const groups = GROUPS.map((group) => {
      const matched = options.filter((option) => group.match(option.path))
      for (const option of matched) claimed.add(option.path)
      return { title: group.title, blurb: group.blurb, options: matched }
    }).filter((group) => group.options.length > 0)

    const rest = options.filter((option) => !claimed.has(option.path))
    if (rest.length > 0) groups.push({ title: 'Other', blurb: 'Everything not covered above.', options: rest })

    return { groups, total: options.length, deprecated: options.filter((option) => option.deprecated).length }
  },
})
