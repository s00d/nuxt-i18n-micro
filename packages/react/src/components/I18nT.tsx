import { API, type HostElement, useStore } from '#host'
import { useI18nContext } from '../injection'
import { type I18nTProps, renderText } from './render-text'

export type { I18nTComponent, I18nTProps } from './render-text'

export const I18nT = (props: I18nTProps): HostElement => {
  const i18n = useI18nContext()
  useStore(i18n.subscribe, i18n.getSnapshot)
  return renderText(API, i18n, props)
}
