import type { TranslationKey } from '@i18n-micro/types'
import type { ComponentChildren, JSX } from 'preact'
import { h } from 'preact'
import { useI18n } from '../context'

export interface I18nGroupProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> {
  prefix: string
  groupClass?: string
  children?: (props: { prefix: string; t: (key: string, params?: Record<string, string | number | boolean>) => string }) => ComponentChildren
}

export const I18nGroup = (props: I18nGroupProps): JSX.Element => {
  const { prefix, groupClass, children, ...restProps } = props
  const { t, getRoute } = useI18n()

  const translate = (key: string, params?: Record<string, string | number | boolean>): string => {
    const result = t(`${prefix}.${key}` as TranslationKey, params, undefined, getRoute())
    return typeof result === 'string' ? result : String(result)
  }

  const className = ['i18n-group', groupClass].filter(Boolean).join(' ')

  const childrenContent: ComponentChildren = typeof children === 'function' ? children({ prefix, t: translate }) : children

  return h('div', { ...restProps, className }, childrenContent) as JSX.Element
}
