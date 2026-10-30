import type { I18nRoutingStrategy } from './types'

/** The path of what a strategy or a `localeRoute` prop answers. */
export const pathOf = (location: string | { path?: string }): string => (typeof location === 'string' ? location : location.path || '/')

/** Where the visitor is, query and hash included: a locale switch keeps them. */
export const currentFullPath = (routing: I18nRoutingStrategy): string => routing.getRoute?.().fullPath ?? routing.getCurrentPath()
