import type { RenderApi } from '@i18n-micro/core/render'
import { createElement, Fragment } from 'react'

/** How `<I18nT>` draws in React. No hooks in here: the server entry shares it under the `react-server` condition. */
export const renderApi: RenderApi = {
  h: createElement,
  Fragment,
  markup: (html) => ({ dangerouslySetInnerHTML: { __html: html } }),
  dated: { suppressHydrationWarning: true },
}
