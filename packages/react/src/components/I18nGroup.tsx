import React from 'react'
import { useI18n } from '../context'
import type { TranslationKey } from '@i18n-micro/types'

export interface I18nGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  prefix: string
  groupClass?: string
  children?: (props: { prefix: string, t: (key: string, params?: Record<string, string | number | boolean>) => string }) => React.ReactNode
}

export const I18nGroup = (props: I18nGroupProps): React.ReactElement => {
  const { prefix, groupClass, children, ...restProps } = props
  const { t, getRoute } = useI18n()

  const translate = (key: string, params?: Record<string, string | number | boolean>): string => {
    const result = t(`${prefix}.${key}` as TranslationKey, params, undefined, getRoute())
    return typeof result === 'string' ? result : String(result)
  }

  const className = ['i18n-group', groupClass].filter(Boolean).join(' ')

  return React.createElement(
    'div',
    { ...restProps, className },
    typeof children === 'function' ? children({ prefix, t: translate }) : children,
  )
}
