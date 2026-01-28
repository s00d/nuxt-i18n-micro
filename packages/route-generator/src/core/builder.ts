import path from 'node:path'
import type { NuxtPage } from '@nuxt/schema'
import { normalizePath } from '../utils'

/**
 * Сливает путь родителя и сегмент дочернего маршрута.
 * Если childSegment абсолютный (начинается с `/`) — возвращает его (нормализованный).
 * Иначе — join(parentPath, childSegment) с нормализацией.
 */
export function resolveChildPath(parentPath: string, childSegment: string): string {
  const segment = (childSegment ?? '').trim()
  if (segment.startsWith('/')) {
    return normalizePath(segment)
  }
  return normalizePath(path.posix.join(parentPath || '', segment))
}

export interface CreateRouteOptions {
  path: string
  name?: string
  children?: NuxtPage[]
  meta?: Record<string, unknown>
  /** undefined — очистить alias (для основного локализованного маршрута при отдельных маршрутах-алиасах) */
  alias?: string[] | undefined
}

/**
 * Создаёт новый объект NuxtPage на основе страницы и переданных опций.
 * Копирует meta, component, file и т.д.; переданные опции перезаписывают поля.
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
  }
  else if ('alias' in options) {
    route.alias = undefined
    route.meta = { ...route.meta, alias: undefined }
  }
  return route
}
