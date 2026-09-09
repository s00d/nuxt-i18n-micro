import { resolveContainedRelPath } from '@i18n-micro/utils/app-path'
import { describe, expect, it, vi } from 'vitest'

/**
 * Mirrors `readPayload` in `src/runtime/server/payload-source.fs.ts`:
 * confine the relative path before any filesystem read.
 */
async function readPayloadLike(
  relPath: string,
  readFile: (absPath: string) => Promise<string>,
  baseDir = '/virtual/locales',
): Promise<Record<string, unknown>> {
  const safeRel = resolveContainedRelPath(relPath)
  if (!safeRel) return {}
  const path = `${baseDir}/${safeRel}`
  try {
    return JSON.parse(await readFile(path)) as Record<string, unknown>
  } catch {
    return {}
  }
}

describe('readPayload path confinement', () => {
  it('returns {} for traversal paths without reading outside the payload directory', async () => {
    const readFile = vi.fn(async () => '{"leaked":true}')

    expect(await readPayloadLike('../secret.json', readFile)).toEqual({})
    expect(await readPayloadLike('../../server/chunks/index.mjs', readFile)).toEqual({})
    expect(await readPayloadLike('foo/../../etc/passwd', readFile)).toEqual({})
    expect(readFile).not.toHaveBeenCalled()
  })

  it('reads only contained relative paths under the payload root', async () => {
    const readFile = vi.fn(async () => '{"ok":true}')

    expect(await readPayloadLike('index/en/data.json', readFile)).toEqual({ ok: true })
    expect(readFile).toHaveBeenCalledTimes(1)
    expect(readFile).toHaveBeenCalledWith('/virtual/locales/index/en/data.json')
  })
})
