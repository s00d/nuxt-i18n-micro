/**
 * Node / prerender payload reader: JSON from the public locales dir (prod) or
 * buildDir payload dir (dev / prerender). Avoids Nitro `serverAssets` / Rollup `raw:`.
 */
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getI18nPrivateConfig } from '#i18n-internal/config'

function baseDir(): string {
  const cfg = getI18nPrivateConfig()
  if (import.meta.dev || import.meta.prerender) {
    return cfg.payloadFsDir
  }
  // Prod: `.output/public/<payloadPublicRel>` next to `.output/server/`
  return join(dirname(fileURLToPath(import.meta.url)), '..', 'public', cfg.payloadPublicRel)
}

export async function readPayload(relPath: string): Promise<Record<string, unknown>> {
  const path = join(baseDir(), relPath.replace(/^\/+/, '').replace(/\\/g, '/'))
  try {
    return JSON.parse(await readFile(path, 'utf8')) as Record<string, unknown>
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code !== 'ENOENT') {
      console.error(`[nuxt-i18n-micro] cannot read ${relPath} from ${baseDir()}:`, error)
    }
    return {}
  }
}
