import { mergeTranslationChunk } from '@i18n-micro/core/helpers'
import type { Translations } from '@i18n-micro/types'
import { PREMERGED_ROOT_MARK } from '@i18n-micro/utils/merge-source'
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

/** The root mark of a file just read, taken off it: nothing above the loader sees one. `undefined`: a whole chunk. */
export function takeRootMark(file: Record<string, unknown>): string | undefined {
  const mark = file[PREMERGED_ROOT_MARK]
  delete file[PREMERGED_ROOT_MARK]
  return typeof mark === 'string' ? mark : undefined
}

/** A page's tree: only the paths the delta touches are copied, the rest is the root's. A stored tree is never written to. */
export function overRoot(root: Record<string, unknown>, delta: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(delta).length ? mergeTranslationChunk(root, delta) : root
}
