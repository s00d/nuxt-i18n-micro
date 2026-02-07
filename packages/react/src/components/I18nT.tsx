import type { PluralFunc, TranslationKey } from '@i18n-micro/types'
import React from 'react'
import { useI18n } from '../context'

export interface I18nTProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  keypath: TranslationKey
  params?: Record<string, string | number | boolean>
  tag?: keyof JSX.IntrinsicElements
  plural?: number | string
  defaultValue?: string
  html?: boolean
  hideIfEmpty?: boolean
  customPluralRule?: PluralFunc
  number?: number | string
  date?: Date | string | number
  relativeDate?: Date | string | number
  children?: never // I18nT doesn't support children - translation is rendered as content
}

export const I18nT = (props: I18nTProps): React.ReactElement | null => {
  const { t, tc, tn, td, tdr, locale, getRoute } = useI18n()
  const {
    keypath,
    params,
    tag = 'span',
    plural,
    defaultValue,
    html = false,
    hideIfEmpty = false,
    customPluralRule,
    number,
    date,
    relativeDate,
    children,
    ...restProps
  } = props

  const route = getRoute()

  // Handle number formatting
  if (number !== undefined) {
    const numberValue = Number(number)
    const formattedNumber = tn(numberValue)
    const translation = t(keypath, { number: formattedNumber, ...(params || {}) }, undefined, route)
    const content = typeof translation === 'string' ? translation : String(translation)
    if (html) {
      return React.createElement(tag, { ...restProps, dangerouslySetInnerHTML: { __html: content } }) as React.ReactElement
    }
    return React.createElement(tag, restProps, content) as React.ReactElement
  }

  // Handle date formatting
  if (date !== undefined) {
    const formattedDate = td(date)
    const translation = t(keypath, { date: formattedDate, ...(params || {}) }, undefined, route)
    const content = typeof translation === 'string' ? translation : String(translation)
    if (html) {
      return React.createElement(tag, { ...restProps, dangerouslySetInnerHTML: { __html: content } }) as React.ReactElement
    }
    return React.createElement(tag, restProps, content) as React.ReactElement
  }

  // Handle relative date formatting
  if (relativeDate !== undefined) {
    const formattedRelativeDate = tdr(relativeDate)
    const translation = t(keypath, { relativeDate: formattedRelativeDate, ...(params || {}) }, undefined, route)
    const content = typeof translation === 'string' ? translation : String(translation)
    if (html) {
      return React.createElement(tag, { ...restProps, dangerouslySetInnerHTML: { __html: content } }) as React.ReactElement
    }
    return React.createElement(tag, restProps, content) as React.ReactElement
  }

  // Handle pluralization
  if (plural !== undefined) {
    const count = Number.parseInt(plural.toString(), 10)
    let translation: string
    if (customPluralRule) {
      const result = customPluralRule(
        keypath,
        count,
        params || {},
        locale,
        (k: TranslationKey, p?: Record<string, string | number | boolean>, dv?: string) => {
          const tResult = t(k, p, dv, route)
          return typeof tResult === 'string' ? tResult : String(tResult)
        },
      )
      translation = result || ''
    } else {
      translation = tc(keypath, { count, ...(params || {}) }, defaultValue)
    }
    if (html) {
      return React.createElement(tag, { ...restProps, dangerouslySetInnerHTML: { __html: translation } }) as React.ReactElement
    }
    return React.createElement(tag, restProps, translation) as React.ReactElement
  }

  // Regular translation
  const translation = t(keypath, params, defaultValue, route)
  const content = typeof translation === 'string' ? translation : String(translation)

  if (hideIfEmpty && !content.trim()) {
    return defaultValue ? (React.createElement(React.Fragment, null, defaultValue) as React.ReactElement) : null
  }

  if (html) {
    return React.createElement(tag, { ...restProps, dangerouslySetInnerHTML: { __html: content } }) as React.ReactElement
  }

  return React.createElement(tag, restProps, content) as React.ReactElement
}
