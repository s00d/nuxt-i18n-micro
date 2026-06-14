import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { TranslationPayloadStats } from './payload-config'

function walkJsonFiles(dir: string, stats: TranslationPayloadStats): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      walkJsonFiles(fullPath, stats)
      continue
    }

    if (!entry.name.endsWith('.json')) continue

    stats.fileCount += 1
    stats.totalBytes += statSync(fullPath).size
  }
}

export function scanTranslationPayloadDirectory(dir: string): TranslationPayloadStats {
  const stats: TranslationPayloadStats = { fileCount: 0, totalBytes: 0 }
  if (!existsSync(dir)) return stats

  walkJsonFiles(dir, stats)
  return stats
}
