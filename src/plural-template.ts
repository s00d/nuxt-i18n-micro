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
  // A rule may call interpolate, as the default does, so it is in scope. The re-export makes the import count as used:
  // a rule that doesn't call it would get an "imported but never used" warning. Nothing imports it, so it is shaken out.
  return `import { interpolate } from '${helpersImportPath}'\nexport { interpolate }\nexport const plural = ${plural.toString()}\n`
}
