/**
 * Pure functions for building route object (merge params, query, hash).
 */
import type { RouteLike, ResolvedRouteLike } from './types'

/**
 * Creates localized route object preserving params, query, hash from source.
 */
export function createLocalizedRouteObject(
  name: string | undefined,
  path: string,
  fullPath: string,
  source: RouteLike | ResolvedRouteLike,
  resolvedParams?: Record<string, unknown>,
  resolvedQuery?: Record<string, unknown>,
  resolvedHash?: string,
): RouteLike {
  return {
    ...(name ? { name } : {}),
    path,
    fullPath,
    params: resolvedParams ?? source.params ?? {},
    query: resolvedQuery ?? source.query ?? {},
    hash: source.hash ?? resolvedHash ?? '',
  }
}
