/**
 * Edge payload reader: Nitro `serverAssets` via `assets:i18n` (Rollup `raw:` embed).
 */
import { resolveContainedRelPath } from '@i18n-micro/utils/app-path'
import { useStorage } from 'nitropack/runtime'

export async function readPayload(relPath: string): Promise<Record<string, unknown>> {
  const safeRel = resolveContainedRelPath(relPath)
  if (!safeRel) return {}
  const key = safeRel.replace(/\//g, ':')
  const value = await useStorage().getItem(`assets:i18n:${key}`)
  if (value === null || value === undefined) return {}
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Record<string, unknown>
    } catch {
      return {}
    }
  }
  if (typeof value === 'object') return value as Record<string, unknown>
  return {}
}
