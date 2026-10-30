import type { TranslationKey } from '@i18n-micro/types'
import { type Component, createMemo, type JSX, splitProps } from 'solid-js'
import { useI18nContext } from '../injection'

export interface I18nGroupProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> {
  prefix: string
  groupClass?: string
  children?:
    | JSX.Element
    | ((props: { prefix: string; t: (key: string, params?: Record<string, string | number | boolean>) => string }) => JSX.Element)
}

export const I18nGroup: Component<I18nGroupProps> = (props): JSX.Element => {
  const i18n = useI18nContext()
  const [local, others] = splitProps(props, ['prefix', 'groupClass', 'class', 'children'])

  const translate = (key: string, params?: Record<string, string | number | boolean>): string =>
    String(i18n.t(`${local.prefix}.${key}` as TranslationKey, params))

  const className = createMemo(() => ['i18n-group', local.groupClass, local.class].filter(Boolean).join(' '))

  return (
    <div class={className()} {...others}>
      {typeof local.children === 'function' ? local.children({ prefix: local.prefix, t: translate }) : local.children}
    </div>
  )
}
