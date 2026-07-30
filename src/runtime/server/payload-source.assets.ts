/**
 * Edge payload reader: Nitro `serverAssets` via `assets:i18n` (Rollup `raw:` embed).
 */
import { useStorage } from 'nitropack/runtime'

export async function readPayload(relPath: string): Promise<Record<string, unknown>> {
  const key = relPath.replace(/^\/+/, '').replace(/\\/g, '/').replace(/\//g, ':')
  const value = await useStorage().getItem(`assets:i18n:${key}`)
  if (value === null || value === undefined) return {}
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Record<string, unknown>
    }
    catch {
      return {}
    }
  }
  if (typeof value === 'object') return value as Record<string, unknown>
  return {}
}
