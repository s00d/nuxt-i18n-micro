/**
 * Edge payload reader: Nitro `serverAssets` via `assets:i18n` (Rollup `raw:` embed).
 */
import { resolveContainedRelPath } from '@i18n-micro/utils/app-path'
import { useStorage } from 'nitropack/runtime'

export const embeddedPayloads = true

export async function readPayload(relPath: string): Promise<Record<string, unknown>> {
  const safeRel = resolveContainedRelPath(relPath)
  if (!safeRel) return {}
  const key = safeRel.split('/').join(':')
  const value = await useStorage().getItem(`assets:i18n:${key}`)
  if (value === null || value === undefined) return {}
  // a payload that does not parse is a failed read, not an empty dictionary
  if (typeof value === 'string') return JSON.parse(value) as Record<string, unknown>
  if (typeof value === 'object') return value as Record<string, unknown>
  return {}
}
