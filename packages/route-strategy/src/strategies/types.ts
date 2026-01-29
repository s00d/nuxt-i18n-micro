import type { NuxtPage } from '@nuxt/schema'
import type { GeneratorContext } from '../core/context'

export interface RouteStrategy {
  /**
   * Processes a page and returns an array of routes (base + aliases, etc.).
   */
  processPage(page: NuxtPage, context: GeneratorContext): NuxtPage[]

  /**
   * Post-processes the full pages array (e.g. removing unprefixed routes).
   */
  postProcess(pages: NuxtPage[], context: GeneratorContext): NuxtPage[]
}

/**
 * Shared type for global/files-level locale routes configuration.
 * Used in Context and RouteGenerator to avoid repeating the same signature.
 */
export type LocaleRoutesConfig = Record<string, Record<string, string> | false | boolean>
