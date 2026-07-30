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
    // Off by default: prerendering `/_locales` without a live handler writes empty public stubs.
    // Opt in when you need static `/{apiBaseUrl}/.../data.json` and payloads are already available.
    prerenderRoutes: options.translationPayloads?.prerenderRoutes === true,
    publicDir: options.translationPayloads?.publicDir,
    warnFileCount: options.translationPayloads?.warnFileCount,
    warnSizeBytes: options.translationPayloads?.warnSizeBytes,
  }
}

/**
 * Public payload directory relative to Nitro's public root.
 * Defaults to `apiBaseUrl` (`_locales`) so static files match client fetch URLs.
 */
export function resolveTranslationPayloadPublicRel(options: ModuleOptions, apiBaseUrl?: string): string {
  const explicit = options.translationPayloads?.publicDir
  if (explicit !== undefined && explicit !== null && String(explicit).length > 0) {
    return String(explicit).replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/') || '_locales'
  }
  const base = (apiBaseUrl ?? options.apiBaseUrl ?? '_locales').replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/')
  return base || '_locales'
}

export function resolveTranslationPayloadPublicDir(
  outputPublicDir: string | undefined,
  options: ModuleOptions,
  apiBaseUrl?: string,
): string {
  return join(outputPublicDir ?? './dist', resolveTranslationPayloadPublicRel(options, apiBaseUrl))
}

/**
 * Whether production builds should copy the payload tree into Nitro public output.
 * - `publicAssets: true` always copies (CDN / static clients).
 * - On Node, `serverAssets: true` also forces a copy — SSR reads `public/` via fs (no Rollup `raw:`).
 * - On Edge, `serverAssets` means Nitro `serverAssets` embed only — do not force a public tree.
 */
export function shouldCopyTranslationPayloadsToPublic(
  translationPayloads: ResolvedTranslationPayloadOptions,
  isNode: boolean,
): boolean {
  if (translationPayloads.publicAssets) return true
  return isNode && translationPayloads.serverAssets
}

/** Edge-only: register Nitro `serverAssets` (`assets:i18n`) when local SSR payloads are enabled. */
export function shouldRegisterNitroServerAssets(
  translationPayloads: ResolvedTranslationPayloadOptions,
  isNode: boolean,
): boolean {
  return !isNode && translationPayloads.serverAssets
}

export function resolveTranslationPayloadWarningThresholds(options?: TranslationPayloadOptions): Required<TranslationPayloadSizeThresholds> {
  return {
    warnFileCount: options?.warnFileCount ?? DEFAULT_TRANSLATION_PAYLOAD_WARN_FILE_COUNT,
    warnSizeBytes: options?.warnSizeBytes ?? DEFAULT_TRANSLATION_PAYLOAD_WARN_SIZE_BYTES,
  }
}

export function hasLocalTranslationPayloadOutput(translationPayloads: ResolvedTranslationPayloadOptions): boolean {
  return translationPayloads.serverAssets || translationPayloads.serverHandler || translationPayloads.publicAssets || translationPayloads.prerenderRoutes
}

export function getTranslationPayloadMisconfigurationWarnings(input: TranslationPayloadMisconfigurationInput): string[] {
  const warnings: string[] = []

  if (!input.translationPayloads.serverAssets && !input.translationPayloads.publicAssets && !input.apiBaseServerHost) {
    warnings.push(
      '[nuxt-i18n-micro] translationPayloads.serverAssets and publicAssets are false and apiBaseServerHost is not set. SSR will load empty translations unless you provide an external server payload host.',
    )
  }

  if (hasLocalTranslationPayloadOutput(input.translationPayloads)) {
    return warnings
  }

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

  return `[nuxt-i18n-micro] Generated translation payloads are large (${stats.fileCount} files, ${formatBytes(stats.totalBytes)}). Consider translationPayloads.mode: 'source' for public output, hosting payloads externally, or disabling unused public/prerender outputs.`
}
