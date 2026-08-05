import type { Translations } from '@i18n-micro/types'

/**
 * Tiny helper if you still prefer `import.meta.glob` instead of `defineI18nTheme`.
 */
export function messagesFromGlob(
  modules: Record<string, { default: Translations } | Translations>,
): Record<string, Translations> {
  const messages: Record<string, Translations> = {}
  for (const [path, mod] of Object.entries(modules)) {
    const file = path.split('/').pop() || ''
    const code = file.replace(/\.json$/, '')
    if (!code) continue
    if (mod && typeof mod === 'object' && 'default' in mod) {
      messages[code] = mod.default as Translations
    }
    else {
      messages[code] = mod as Translations
    }
  }
  return messages
}
