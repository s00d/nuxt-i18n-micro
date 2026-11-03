import { queryString } from '@i18n-micro/utils/locale-head'
import type { I18nRoutingStrategy } from './types'

/** The URL of what a strategy or a `localeRoute` prop answers, or of a target nothing resolves. */
export const pathOf = (location: string | { path?: string; query?: object; hash?: string }): string =>
  typeof location === 'string' ? location : `${location.path || '/'}${queryString(location.query)}${location.hash ?? ''}`

/** Where the visitor is, query and hash included: a locale switch keeps them. */
export const currentFullPath = (routing: I18nRoutingStrategy): string => routing.getRoute?.().fullPath ?? routing.getCurrentPath()
