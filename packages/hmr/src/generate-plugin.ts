export interface GenerateHmrPluginOptions {
  /**
   * Absolute paths of top-level additional `{locale}.json` files (array order = merge order).
   * Watched together with the matching primary root file so client HMR applies the same merge as build.
   */
  additionalRootFiles?: string[]
}

interface RootLocaleGroup {
  locale: string
  /** Absolute paths in merge order: additional… then primary (if any). */
  files: string[]
}

function parsePrimaryFile(file: string): { kind: 'page'; locale: string; pageName: string } | { kind: 'root'; locale: string } | null {
  const isPage = /\/pages\//.test(file)
  if (isPage) {
    const m = /\/pages\/(.+)\/([^/]+)\.json$/.exec(file)
    if (!m?.[1] || !m[2]) return null
    return { kind: 'page', pageName: m[1], locale: m[2] }
  }
  const m = /\/([^/]+)\.json$/.exec(file)
  if (!m?.[1]) return null
  return { kind: 'root', locale: m[1] }
}

function parseAdditionalRootFile(file: string): { locale: string } | null {
  if (file.includes('/pages/')) return null
  const m = /\/([^/]+)\.json$/.exec(file)
  if (!m?.[1]) return null
  return { locale: m[1] }
}

function buildRootGroups(primaryFiles: string[], additionalRootFiles: string[]): RootLocaleGroup[] {
  const byLocale = new Map<string, { additional: string[]; primary?: string }>()

  for (const file of additionalRootFiles) {
    const parsed = parseAdditionalRootFile(file)
    if (!parsed) continue
    let entry = byLocale.get(parsed.locale)
    if (!entry) {
      entry = { additional: [] }
      byLocale.set(parsed.locale, entry)
    }
    entry.additional.push(file)
  }

  for (const file of primaryFiles) {
    const parsed = parsePrimaryFile(file)
    if (!parsed || parsed.kind !== 'root') continue
    let entry = byLocale.get(parsed.locale)
    if (!entry) {
      entry = { additional: [] }
      byLocale.set(parsed.locale, entry)
    }
    entry.primary = file
  }

  const groups: RootLocaleGroup[] = []
  for (const [locale, entry] of byLocale) {
    const files = [...entry.additional]
    if (entry.primary) files.push(entry.primary)
    if (files.length) groups.push({ locale, files })
  }
  return groups
}

/**
 * Generates the HMR plugin source code for hot-reloading translation files.
 *
 * Root locale files (including `additionalTranslationDirs`) are accepted as a group and
 * deep-merged in the same order as build: additional… then primary.
 * On any change, every file in the group is re-imported so unchanged layers are not dropped
 * (Vite multi-accept only passes non-null modules for deps that actually changed).
 */
export function generateHmrPlugin(files: string[], options: GenerateHmrPluginOptions = {}): string {
  const additionalRootFiles = (options.additionalRootFiles ?? []).map((f) => f.replace(/\\/g, '/'))
  const primaryFiles = files.map((f) => f.replace(/\\/g, '/'))

  const pageBlocks: string[] = []
  for (const file of primaryFiles) {
    const parsed = parsePrimaryFile(file)
    if (!parsed || parsed.kind !== 'page') continue

    pageBlocks.push(
      `
if (import.meta.hot) {
  import.meta.hot.accept('${file}', async (mod) => {
    const nuxtApp = useNuxtApp()
    const data = (mod && typeof mod === 'object' && Object.prototype.hasOwnProperty.call(mod, 'default'))
      ? mod.default
      : mod
    try {
      await nuxtApp.$loadPageTranslations('${parsed.locale}', '${parsed.pageName}', data)
      console.log('[i18n HMR] Translations reloaded:', 'page', '${parsed.locale}', '${parsed.pageName}')
    }
    catch (e) {
      console.warn('[i18n HMR] Failed to reload translations for', '${file}', e)
    }
  })
}
`.trim(),
    )
  }

  const rootGroups = buildRootGroups(primaryFiles, additionalRootFiles)
  const rootBlocks: string[] = []

  for (const group of rootGroups) {
    const filesLiteral = group.files.map((f) => `'${f}'`).join(', ')

    rootBlocks.push(
      `
if (import.meta.hot) {
  import.meta.hot.accept([${filesLiteral}], async () => {
    const nuxtApp = useNuxtApp()
    const paths = [${filesLiteral}]
    let data = {}
    for (const path of paths) {
      try {
        const mod = await import(/* @vite-ignore */ path)
        const part = (mod && typeof mod === 'object' && Object.prototype.hasOwnProperty.call(mod, 'default'))
          ? mod.default
          : mod
        data = deepMergeTranslationsRecursive(data, part && typeof part === 'object' ? part : {})
      }
      catch (e) {
        console.warn('[i18n HMR] Failed to re-import', path, e)
      }
    }
    try {
      await nuxtApp.$loadPageTranslations('${group.locale}', 'index', data)
      console.log('[i18n HMR] Translations reloaded:', 'global', '${group.locale}')
    }
    catch (e) {
      console.warn('[i18n HMR] Failed to reload root translations for locale', '${group.locale}', e)
    }
  })
}
`.trim(),
    )
  }

  const needsMergeImport = rootGroups.length > 0

  return `
import { defineNuxtPlugin, useNuxtApp } from '#imports'
${needsMergeImport ? "import { deepMergeTranslationsRecursive } from '@i18n-micro/utils/deep-merge'\n" : ''}
export default defineNuxtPlugin(() => {
${[...pageBlocks, ...rootBlocks].join('\n')}
})
`.trim()
}
