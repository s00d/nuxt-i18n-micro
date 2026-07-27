/**
 * Module options, read from the type that declares them.
 *
 * A VitePress build-time loader rather than a generated Markdown file: the page has no
 * copy of this data to fall out of date, `watch` re-runs it on every edit to the type
 * during `docs:dev`, and there is no "did you regenerate?" step before a commit.
 */
import { defineLoader } from 'vitepress'
import { type ModuleOption, readModuleOptions } from '../../scripts/src/utils/module-options'

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
    blurb: 'Where translation files live and how they are resolved.',
    match: (path) => path.startsWith('translationDir') || ['disablePageLocales', 'fallbackLocale', 'plural', 'routesLocaleLinks', 'disableWatcher'].includes(path),
  },
  {
    title: 'Payloads and caching',
    blurb: 'How translations reach the browser. See the Performance guide for what these change at runtime.',
    match: (path) => path.startsWith('translationPayloads') || path.startsWith('api') || ['serverTranslationPreload'].includes(path),
  },
  {
    title: 'SEO',
    blurb: 'Meta tags generated for each localized page.',
    match: (path) => path.startsWith('meta') || ['canonicalQueryWhitelist'].includes(path),
  },
  {
    title: 'Detection and redirects',
    blurb: "Choosing a locale for a visitor who has not picked one.",
    match: (path) => path.startsWith('autoDetect') || ['redirects'].includes(path),
  },
  {
    title: 'Registration',
    blurb: 'Parts of the module you can switch off.',
    match: (path) => ['define', 'plugin', 'hooks', 'components', 'types', 'debug'].includes(path),
  },
]

export interface OptionGroup {
  title: string
  blurb: string
  options: ModuleOption[]
}

export interface ModuleOptionsData {
  groups: OptionGroup[]
  total: number
  deprecated: number
  source: string
}

declare const data: ModuleOptionsData
export { data }

export default defineLoader({
  watch: ['../../packages/types/src/index.ts'],
  load(): ModuleOptionsData {
    const options = readModuleOptions()
    const claimed = new Set<string>()

    const groups: OptionGroup[] = GROUPS.map((group) => {
      const matched = options.filter((option) => group.match(option.path))
      for (const option of matched) claimed.add(option.path)
      return { title: group.title, blurb: group.blurb, options: matched }
    }).filter((group) => group.options.length > 0)

    const rest = options.filter((option) => !claimed.has(option.path))
    if (rest.length > 0) {
      groups.push({ title: 'Other', blurb: 'Everything not covered above.', options: rest })
    }

    return {
      groups,
      total: options.length,
      deprecated: options.filter((option) => option.deprecated).length,
      source: 'packages/types/src/index.ts',
    }
  },
})
