import type { GlobalLocaleRoutes, LocaleCode } from '@i18n-micro/types'

/**
 * One programmatic route entry for {@link splitLocaleRoutes} (#244).
 * Prefer route `name` as the `globalLocaleRoutes` key so shared wrapper SFCs do not collapse.
 */
export interface SplitLocaleRouteEntry {
  /** Route name — also the key in `globalLocaleRoutes`. */
  name: string
  /** Default (unlocalized) path pushed into `pages:extend`. */
  path: string
  /** Page component / wrapper SFC (Nuxt `file`). */
  file: string
  /**
   * Custom per-locale paths, or `false` to disable localization for this route.
   * Omitted → route is still pushed to `pages`, but no `globalLocaleRoutes` entry.
   */
  paths?: Record<LocaleCode, string> | false
}

export interface SplitLocaleRoutePage {
  name: string
  path: string
  file: string
}

export interface SplitLocaleRoutesResult {
  /** Pass into `pages:extend`: `pages.push(...pages)`. */
  pages: SplitLocaleRoutePage[]
  /** Merge into `i18n.globalLocaleRoutes` (keyed by route name). */
  globalLocaleRoutes: NonNullable<GlobalLocaleRoutes>
}

/**
 * Split one programmatic route registry into Nuxt pages + `globalLocaleRoutes` (#244).
 *
 * Keeps both halves in sync and keys locale paths by route **name** (not file path),
 * so N routes sharing one wrapper SFC do not overwrite each other.
 */
export function splitLocaleRoutes(entries: readonly SplitLocaleRouteEntry[]): SplitLocaleRoutesResult {
  const pages: SplitLocaleRoutePage[] = []
  const globalLocaleRoutes: NonNullable<GlobalLocaleRoutes> = {}
  const seen = new Set<string>()

  for (const entry of entries) {
    const name = entry.name?.trim()
    if (!name) {
      throw new Error('[splitLocaleRoutes] each entry needs a non-empty `name`')
    }
    if (!entry.path) {
      throw new Error(`[splitLocaleRoutes] entry "${name}" needs a \`path\``)
    }
    if (!entry.file) {
      throw new Error(`[splitLocaleRoutes] entry "${name}" needs a \`file\``)
    }
    if (seen.has(name)) {
      throw new Error(`[splitLocaleRoutes] duplicate route name "${name}"`)
    }
    seen.add(name)

    pages.push({ name, path: entry.path, file: entry.file })

    if (entry.paths !== undefined) {
      globalLocaleRoutes[name] = entry.paths
    }
  }

  return { pages, globalLocaleRoutes }
}
