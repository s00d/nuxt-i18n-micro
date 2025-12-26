import { h, Fragment } from 'preact'
import type { JSX } from 'preact'
import { useI18n } from '../context'
import type { TranslationKey, PluralFunc } from '@i18n-micro/types'

export interface I18nTProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> {
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

export const I18nT = (props: I18nTProps): JSX.Element | null => {
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
    ...restProps
  } = props

  const route = getRoute()

  // Helper function to create element with proper typing
  const createElement = (
    elementTag: keyof JSX.IntrinsicElements,
    elementProps: JSX.HTMLAttributes<HTMLElement>,
    children?: string,
  ): JSX.Element => {
    return h(
      elementTag as unknown as keyof JSX.IntrinsicElements,
      elementProps as unknown as JSX.HTMLAttributes<HTMLElement>,
      children,
    ) as JSX.Element
  }

  // Handle number formatting
  if (number !== undefined) {
    const numberValue = Number(number)
    const formattedNumber = tn(numberValue)
    const translation = t(keypath, { number: formattedNumber, ...(params || {}) }, undefined, route)
    const content = typeof translation === 'string' ? translation : String(translation)
    if (html) {
      return createElement(tag, { ...restProps, dangerouslySetInnerHTML: { __html: content } }, undefined)
    }
    return createElement(tag, restProps, content)
  }

  // Handle date formatting
  if (date !== undefined) {
    const formattedDate = td(date)
    const translation = t(keypath, { date: formattedDate, ...(params || {}) }, undefined, route)
    const content = typeof translation === 'string' ? translation : String(translation)
    if (html) {
      return createElement(tag, { ...restProps, dangerouslySetInnerHTML: { __html: content } }, undefined)
    }
    return createElement(tag, restProps, content)
  }

  // Handle relative date formatting
  if (relativeDate !== undefined) {
    const formattedRelativeDate = tdr(relativeDate)
    const translation = t(keypath, { relativeDate: formattedRelativeDate, ...(params || {}) }, undefined, route)
    const content = typeof translation === 'string' ? translation : String(translation)
    if (html) {
      return createElement(tag, { ...restProps, dangerouslySetInnerHTML: { __html: content } }, undefined)
    }
    return createElement(tag, restProps, content)
  }

  // Handle pluralization
  if (plural !== undefined) {
    const count = Number.parseInt(plural.toString())
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
    }
    else {
      translation = tc(keypath, { count, ...(params || {}) }, defaultValue)
    }
    if (html) {
      return createElement(tag, { ...restProps, dangerouslySetInnerHTML: { __html: translation } }, undefined)
    }
    return createElement(tag, restProps, translation)
  }

  // Regular translation
  const translation = t(keypath, params, defaultValue, route)
  const content = typeof translation === 'string' ? translation : String(translation)

  if (hideIfEmpty && !content.trim()) {
    return defaultValue ? (h(Fragment, null, defaultValue) as JSX.Element) : null
  }

  if (html) {
    return createElement(tag, { ...restProps, dangerouslySetInnerHTML: { __html: content } }, undefined)
  }

  return createElement(tag, restProps, content)
}
