import path from 'node:path'
import type { NuxtPage } from '@nuxt/schema'
import { normalizePath } from '../utils'

/**
 * Joins parent path and child segment.
 * If childSegment is absolute (starts with `/`) — returns it (normalized).
 * Otherwise, performs join(parentPath, childSegment) with normalization.
 */
export function resolveChildPath(parentPath: string, childSegment: string): string {
  const segment = (childSegment ?? '').trim()
  if (segment.startsWith('/')) {
    return normalizePath(segment)
  }
  return normalizePath(path.posix.join(parentPath || '', segment))
}

/** Strips a leading `/:locale(...)` segment: parents of shared all-locale routes carry it. */
const withoutLocaleParam = (routePath: string): string => routePath.replace(/^\/?:locale\([^)]*\)/, '') || '/'

/**
 * Route path segment of a child from its custom value. Child values are relative to the
 * parent (`book-activity/skiing` under `/activity`); a value that already starts with the
 * parent's localized path is a full URL and is taken from there (`/bereich/kategorie` under
 * `/bereich` is `kategorie`) — the same rule the runtime applies (joinNestedCustomPath).
 */
export function childSegment(parentLocalizedPath: string, customValue: string): string {
  const value = normalizePath(`/${customValue.replace(/^\/+/, '')}`)
  const parent = normalizePath(`/${withoutLocaleParam(parentLocalizedPath).replace(/^\/+/, '')}`)
  if (parent !== '/' && parent !== '' && value.startsWith(`${parent}/`)) return value.slice(parent.length + 1)
  return value.replace(/^\/+/, '')
}

export interface CreateRouteOptions {
  path: string
  name?: string
  children?: NuxtPage[]
  meta?: Record<string, unknown>
  /** When undefined, alias is cleared (for the main localized route when alias routes are created separately). */
  alias?: string[] | undefined
}

/**
 * Creates a new NuxtPage object from the original page and provided options.
 * Copies meta, component, file, etc.; provided options override the respective fields.
 */
export function createRoute(page: NuxtPage, options: CreateRouteOptions): NuxtPage {
  const { path: routePath, name, children, meta: metaOverride, alias: aliasOverride } = options
  const route: NuxtPage = {
    ...page,
    path: routePath,
  }
  if (name !== undefined) {
    route.name = name
  }
  if (children !== undefined) {
    route.children = children
  }
  if (metaOverride !== undefined) {
    route.meta = { ...page.meta, ...metaOverride }
  }
  if (aliasOverride !== undefined) {
    route.alias = aliasOverride
    route.meta = { ...route.meta, alias: aliasOverride }
  } else if ('alias' in options) {
    route.alias = undefined
    route.meta = { ...route.meta, alias: undefined }
  }
  return route
}
