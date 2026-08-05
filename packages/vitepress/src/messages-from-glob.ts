import type { Translations } from '@i18n-micro/types'

function isModuleNamespace(mod: object): mod is { default: Translations } {
  const keys = Object.keys(mod)
  return keys.length > 0 && keys.every((key) => key === 'default' || key === '__esModule')
}

/**
 * Tiny helper if you still prefer `import.meta.glob` instead of `defineI18nTheme`.
 * Only unwraps `{ default: … }` Vite module namespaces — a dictionary that happens
 * to contain a `default` key is kept intact.
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
