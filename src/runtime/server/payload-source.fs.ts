/**
 * Node / prerender payload reader: JSON from the public locales dir (prod) or
 * buildDir payload dir (dev / prerender). Avoids Nitro `serverAssets` / Rollup `raw:`.
 */
import { access, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveContainedRelPath } from '@i18n-micro/utils/app-path'
import { getI18nPrivateConfig } from '#i18n-internal/config'

export const embeddedPayloads = false

/** Names a request can make up: no such file, a path through a file, a name past the file system's limit. */
const MISSING_FILE = new Set(['ENOENT', 'ENOTDIR', 'ENAMETOOLONG'])

let treeChecked = false

function baseDir(): string {
  const cfg = getI18nPrivateConfig()
  if (import.meta.dev || import.meta.prerender) {
    return cfg.payloadFsDir
  }
  // Prod: `.output/public/<payloadPublicRel>` next to `.output/server/`
  return join(dirname(fileURLToPath(import.meta.url)), '..', 'public', cfg.payloadPublicRel)
}

/**
 * A file can be missing on purpose (a page with no folder, a made-up URL). The folder cannot: the build
 * writes it, so without it `public/` did not reach this server and every page renders raw keys.
 */
async function reportMissingTree(dir: string): Promise<void> {
  if (treeChecked) return
  treeChecked = true
  await access(dir).catch(() =>
    console.error(
      `[nuxt-i18n-micro] ${dir} does not exist: public/ is not deployed next to the server, so pages render raw keys. Build with nitro.serveStatic: false to embed the dictionaries.`,
    ),
  )
}

export async function readPayload(relPath: string): Promise<Record<string, unknown>> {
  const rel = resolveContainedRelPath(relPath)
  if (!rel) return {}
  const dir = baseDir()
  try {
    return JSON.parse(await readFile(join(dir, rel), 'utf8')) as Record<string, unknown>
  } catch (error) {
    const { code } = error as NodeJS.ErrnoException
    // anything else (EACCES, EMFILE, a corrupt file) is a failed read: `{}` would be cached, or merged into a partial chunk
    if (!MISSING_FILE.has(code!)) throw error
    if (code === 'ENOENT') await reportMissingTree(dir)
    return {}
  }
}
