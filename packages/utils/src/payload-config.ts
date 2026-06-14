import { join } from 'node:path'
import type { ModuleOptions, TranslationPayloadOptions } from '@i18n-micro/types'

export type TranslationPayloadMode = 'premerged' | 'source'

export interface ResolvedTranslationPayloadOptions {
  mode: TranslationPayloadMode
  serverAssets: boolean
  serverHandler: boolean
  publicAssets: boolean
  prerenderRoutes: boolean
  publicDir?: string
  warnFileCount?: number
  warnSizeBytes?: number
}

export interface TranslationPayloadMisconfigurationInput {
  translationPayloads: ResolvedTranslationPayloadOptions
  apiBaseClientHost?: string
  apiBaseServerHost?: string
}

export interface TranslationPayloadStats {
  fileCount: number
  totalBytes: number
}

export interface TranslationPayloadSizeThresholds {
  warnFileCount?: number
  warnSizeBytes?: number
}

export const DEFAULT_TRANSLATION_PAYLOAD_WARN_FILE_COUNT = 500
export const DEFAULT_TRANSLATION_PAYLOAD_WARN_SIZE_BYTES = 10 * 1024 * 1024

export function resolveTranslationPayloadMode(options: ModuleOptions): TranslationPayloadMode {
  return options.translationPayloads?.mode === 'source' ? 'source' : 'premerged'
}

export function resolveTranslationPayloadOptions(options: ModuleOptions): ResolvedTranslationPayloadOptions {
  const mode = resolveTranslationPayloadMode(options)
  const isSourceMode = mode === 'source'

  return {
    mode,
    serverAssets: options.translationPayloads?.serverAssets !== false,
    serverHandler: options.translationPayloads?.serverHandler !== false,
    publicAssets: isSourceMode ? options.translationPayloads?.publicAssets === true : options.translationPayloads?.publicAssets !== false,
    prerenderRoutes: isSourceMode ? options.translationPayloads?.prerenderRoutes === true : options.translationPayloads?.prerenderRoutes !== false,
    publicDir: options.translationPayloads?.publicDir,
    warnFileCount: options.translationPayloads?.warnFileCount,
    warnSizeBytes: options.translationPayloads?.warnSizeBytes,
  }
}

export function resolveTranslationPayloadPublicDir(outputPublicDir: string | undefined, options: ModuleOptions): string {
  const translationPayloads = resolveTranslationPayloadOptions(options)
  return join(outputPublicDir ?? './dist', translationPayloads.publicDir ?? options.translationDir ?? 'locales')
}

export function resolveTranslationPayloadWarningThresholds(options?: TranslationPayloadOptions): Required<TranslationPayloadSizeThresholds> {
  return {
    warnFileCount: options?.warnFileCount ?? DEFAULT_TRANSLATION_PAYLOAD_WARN_FILE_COUNT,
    warnSizeBytes: options?.warnSizeBytes ?? DEFAULT_TRANSLATION_PAYLOAD_WARN_SIZE_BYTES,
  }
}

export function hasLocalTranslationPayloadOutput(translationPayloads: ResolvedTranslationPayloadOptions): boolean {
  return (
    translationPayloads.serverAssets || translationPayloads.serverHandler || translationPayloads.publicAssets || translationPayloads.prerenderRoutes
  )
}

export function getTranslationPayloadMisconfigurationWarnings(input: TranslationPayloadMisconfigurationInput): string[] {
  if (hasLocalTranslationPayloadOutput(input.translationPayloads)) return []

  const warnings: string[] = []

  if (!input.apiBaseServerHost) {
    warnings.push(
      '[nuxt-i18n-micro] translationPayloads disabled all local outputs but apiBaseServerHost is not set. SSR will load empty translations unless you provide an external server payload host.',
    )
  }

  if (!input.apiBaseClientHost) {
    warnings.push(
      '[nuxt-i18n-micro] translationPayloads disabled all local outputs but apiBaseClientHost is not set. Client-side navigation may load empty translations unless you provide an external client payload host.',
    )
  }

  return warnings
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${bytes} B`
}

export function getTranslationPayloadSizeWarning(stats: TranslationPayloadStats, thresholds?: TranslationPayloadSizeThresholds): string | null {
  const warnFileCount = thresholds?.warnFileCount ?? DEFAULT_TRANSLATION_PAYLOAD_WARN_FILE_COUNT
  const warnSizeBytes = thresholds?.warnSizeBytes ?? DEFAULT_TRANSLATION_PAYLOAD_WARN_SIZE_BYTES

  if (stats.fileCount < warnFileCount && stats.totalBytes < warnSizeBytes) {
    return null
  }

  return `[nuxt-i18n-micro] Generated translation payloads are large (${stats.fileCount} files, ${formatBytes(stats.totalBytes)}). Consider translationPayloads.mode: 'source' for serverless deployments, disabling unused outputs, or hosting payloads externally.`
}
