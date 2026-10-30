import type { TranslationKey } from '@i18n-micro/types'
import { h, type HostAttrs, type HostElement, type HostNode } from '#host'
import { useI18n } from '../context'

export interface I18nGroupProps extends Omit<HostAttrs<HTMLDivElement>, 'children'> {
  prefix: string
  groupClass?: string
  children?: HostNode | ((props: { prefix: string; t: (key: string, params?: Record<string, string | number | boolean>) => string }) => HostNode)
}

export const I18nGroup = (props: I18nGroupProps): HostElement => {
  const { prefix, groupClass, children, className, class: userClass, ...restProps } = props as I18nGroupProps & { class?: string }
  const { t } = useI18n()

  const translate = (key: string, params?: Record<string, string | number | boolean>): string =>
    String(t(`${prefix}.${key}` as TranslationKey, params))

  return h(
    'div',
    { ...restProps, className: ['i18n-group', groupClass, className, userClass].filter(Boolean).join(' ') },
    typeof children === 'function' ? children({ prefix, t: translate }) : children,
  )
}
