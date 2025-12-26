/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { splitProps, createMemo, type Component, type JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { useI18nContext } from '../injection'
import type { TranslationKey, PluralFunc } from '@i18n-micro/types'

interface I18nTProps extends JSX.HTMLAttributes<HTMLElement> {
  keypath: TranslationKey
  params?: Record<string, string | number | boolean>
  tag?: string
  plural?: number | string
  defaultValue?: string
  html?: boolean
  hideIfEmpty?: boolean
  customPluralRule?: PluralFunc
  number?: number | string
  date?: Date | string | number
  relativeDate?: Date | string | number
}

export const I18nT: Component<I18nTProps> = (props): JSX.Element => {
  const i18n = useI18nContext()
  const [local, others] = splitProps(props, [
    'keypath',
    'params',
    'tag',
    'plural',
    'defaultValue',
    'html',
    'hideIfEmpty',
    'customPluralRule',
    'number',
    'date',
    'relativeDate',
  ])

  // Используем createMemo для реактивности (отслеживает изменения локали и роута)
  // В Solid мемо автоматически отслеживает зависимости при использовании в JSX
  const translation = createMemo(() => {
    // Отслеживаем изменения локали и роута через accessors
    const locale = i18n.localeAccessor()
    const route = i18n.routeAccessor()

    // Handle number formatting
    if (local.number !== undefined) {
      const numberValue = Number(local.number)
      const formattedNumber = i18n.tn(numberValue)
      const result = i18n.t(local.keypath, { number: formattedNumber, ...(local.params || {}) }, undefined, route)
      return typeof result === 'string' ? result : String(result)
    }

    // Handle date formatting
    if (local.date !== undefined) {
      const formattedDate = i18n.td(local.date)
      const result = i18n.t(local.keypath, { date: formattedDate, ...(local.params || {}) }, undefined, route)
      return typeof result === 'string' ? result : String(result)
    }

    // Handle relative date formatting
    if (local.relativeDate !== undefined) {
      const formattedRelativeDate = i18n.tdr(local.relativeDate)
      const result = i18n.t(local.keypath, { relativeDate: formattedRelativeDate, ...(local.params || {}) }, undefined, route)
      return typeof result === 'string' ? result : String(result)
    }

    // Handle pluralization
    if (local.plural !== undefined) {
      const count = Number.parseInt(local.plural.toString())
      if (local.customPluralRule) {
        const translationResult = local.customPluralRule(
          local.keypath,
          count,
          local.params || {},
          locale,
          (k: TranslationKey, p?: Record<string, string | number | boolean>, dv?: string) => i18n.t(k, p, dv, route),
        )
        return translationResult || ''
      }
      else {
        return i18n.tc(local.keypath, { count, ...(local.params || {}) }, local.defaultValue)
      }
    }

    // Regular translation
    const translationResult = (i18n.t(local.keypath, local.params, local.defaultValue, route) ?? '').toString()

    if (local.hideIfEmpty && !translationResult.trim()) {
      return local.defaultValue || ''
    }

    return translationResult
  })

  // Если html=true, используем innerHTML и не рендерим children
  if (local.html) {
    return (
      // @ts-expect-error - Dynamic component type conflict with Vue JSX
      <Dynamic
        component={local.tag || 'span'}
        {...(others as unknown as Record<string, unknown>)}
        innerHTML={translation()}
      />
    ) as unknown as JSX.Element
  }

  // Если html=false, рендерим как текст (Solid автоматически экранирует HTML)
  const translationValue = translation()
  if (local.hideIfEmpty && !translationValue.trim()) {
    if (local.defaultValue) {
      return (
        <Dynamic
          component={local.tag || 'span'}
          {...(others as unknown as Record<string, unknown>)}
        >
          {local.defaultValue}
        </Dynamic>
      ) as unknown as JSX.Element
    }
    return null as unknown as JSX.Element
  }

  return (
    // @ts-expect-error - Dynamic component type conflict with Vue JSX
    <Dynamic
      component={local.tag || 'span'}
      {...(others as unknown as Record<string, unknown>)}
    >
      {translationValue}
    </Dynamic>
  ) as unknown as JSX.Element
}
