import type { Translations } from '@i18n-micro/types'
import type { ServerTranslationCacheEntry } from '../server/internal/server-translation-cache'

/** `json` on demand: where the public dir answers `/_locales` the string would only hold memory (a chunk's size, per cached entry). */
export function toEntry(data: Translations): ServerTranslationCacheEntry {
  let json: string | undefined
  return {
    // every request reads this tree: its root is frozen, once, in place
    data: Object.freeze(data),
    get json() {
      return (json ??= JSON.stringify(data).replace(/</g, '\\u003c'))
    },
  }
}
