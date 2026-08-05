import type { Translations } from '@i18n-micro/types'

/**
 * Vite `import.meta.glob(..., { eager: true })` modules look like
 * `{ default: { …json } }` or `{ default: { … }, __esModule: true }`.
 * Do not treat a real dictionary that only has a `default` string key as a namespace.
 */
function isModuleNamespace(mod: object): mod is { default: Translations } {
  if (!('default' in mod)) return false
  const keys = Object.keys(mod)
  if (!keys.every((key) => key === 'default' || key === '__esModule')) return false
  const value = (mod as { default: unknown }).default
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Tiny helper if you still prefer `import.meta.glob` instead of `defineI18nTheme`.
 * Only unwraps Vite module namespaces — dictionaries with a `default` key stay intact.
 */
export function messagesFromGlob(
  modules: Record<string, { default: Translations } | Translations>,
): Record<string, Translations> {
  const messages: Record<string, Translations> = {}
  for (const [path, mod] of Object.entries(modules)) {
    const file = path.split('/').pop() || ''
    const code = file.replace(/\.json$/, '')
    if (!code) continue
    if (mod && typeof mod === 'object' && isModuleNamespace(mod)) {
      messages[code] = mod.default
    }
    else {
      messages[code] = mod as Translations
    }
  }
  return messages
}
