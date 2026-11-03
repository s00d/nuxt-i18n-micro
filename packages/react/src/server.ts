// The `react-server` entry: no state, no context, nothing of `react` that a server component does not have.
import type { I18n } from '@i18n-micro/runtime'
import { type I18nTProps, renderText } from './components/render-text'
import { renderApi } from './render-api'

export { defaultPlural, FormatService, interpolate } from '@i18n-micro/core'
export type { I18nOptions as ReactI18nOptions } from '@i18n-micro/runtime'
export { createI18n, I18n as ReactI18n } from '@i18n-micro/runtime'
export type { I18nTComponent } from './components/render-text'

export interface ServerI18nTProps extends I18nTProps {
  /** The request's instance: a server component has no context. */
  i18n: I18n
}

/** `<I18nT>` for a server component. Its text stays out of the client bundle. */
export const I18nT = ({ i18n, ...props }: ServerI18nTProps) => renderText(renderApi, i18n, props)
