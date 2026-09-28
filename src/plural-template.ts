import type { PluralFunc } from '@i18n-micro/types'
import { defaultPlural } from '@i18n-micro/core'

/**
 * Build contents of the virtual `i18n.plural.mjs` Nitro/Nuxt template.
 * `helpersImportPath` must be an absolute (or file URL) path so consumers resolve
 * `@i18n-micro/core` without depending on their own node_modules layout.
 */
export function buildI18nPluralTemplate(plural: PluralFunc | undefined, helpersImportPath: string): string {
  // defaultPlural closes over `interpolate` — `.toString()` into a virtual file drops that
  // binding and the bundler leaves a free `u(...)` → SSR 500 "u is not defined".
  if (!plural || plural === defaultPlural) {
    return `export { defaultPlural as plural } from '${helpersImportPath}'\n`
  }
  // Custom rules that call interpolate (same pattern as default) need the import in scope.
  return `import { interpolate } from '${helpersImportPath}'\nexport const plural = ${plural.toString()}\n`
}
