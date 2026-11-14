import type { PluralFunc } from '@i18n-micro/types'
import { defaultPlural } from '@i18n-micro/core'

/**
 * Build contents of the virtual `i18n.plural.mjs` Nitro/Nuxt template.
 * `helpersImportPath` must be an absolute path so consumers resolve
 * `@i18n-micro/core` without depending on their own node_modules layout.
 */
export function buildI18nPluralTemplate(plural: PluralFunc | undefined, helpersImportPath: string): string {
  // defaultPlural closes over `interpolate` — `.toString()` into a virtual file drops that
  // binding and the bundler leaves a free `u(...)` → SSR 500 "u is not defined".
  if (!plural || plural === defaultPlural) {
    return `export { defaultPlural as plural } from '${helpersImportPath}'\n`
  }
  // A rule that calls interpolate, as the default does, needs it in scope. Only then: Nitro's Rollup warns about an
  // unused import (a re-export doesn't count, it is shaken out). A mention in a comment or a string only adds the import.
  const source = plural.toString()
  const imports = /\binterpolate\b/.test(source) ? `import { interpolate } from '${helpersImportPath}'\n` : ''
  return `${imports}export const plural = ${source}\n`
}
