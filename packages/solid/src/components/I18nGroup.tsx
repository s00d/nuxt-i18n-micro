// @ts-nocheck

import type { TranslationKey } from '@i18n-micro/types'
import { type Component, type JSX, splitProps } from 'solid-js'
import { useI18nContext } from '../injection'

interface I18nGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  prefix: string
  groupClass?: string
}

export const I18nGroup: Component<I18nGroupProps> = (props): JSX.Element => {
  const i18n = useI18nContext()
  const [local, others] = splitProps(props, ['prefix', 'groupClass'])

  const translate = (key: string, params?: Record<string, string | number | boolean>): string => {
    // Use type assertion for dynamic keys with prefix
    // The developer is responsible for ensuring the key exists
    const result = i18n.t(`${local.prefix}.${key}` as TranslationKey, params, undefined, i18n.getRoute())
    return typeof result === 'string' ? result : String(result)
  }

  return (
    // @ts-expect-error - Type conflict with Vue JSX in monorepo
    (
      <div class={['i18n-group', local.groupClass].filter(Boolean).join(' ')} {...(others as unknown as JSX.HTMLAttributes<HTMLDivElement>)}>
        {typeof props.children === 'function'
          ? (
              props.children as (props: {
                prefix: string
                t: (key: string, params?: Record<string, string | number | boolean>) => string
              }) => JSX.Element
            )({ prefix: local.prefix, t: translate })
          : props.children}
      </div>
    ) as unknown as JSX.Element
  )
}
