import { renderI18nT, type RenderSlots } from '@i18n-micro/core/render'
import type { PluralFunc, TranslationKey } from '@i18n-micro/types'
import { type FunctionalComponent, Fragment, h, inject, type PropType } from 'vue'
import type { VueI18n } from '../composer'
import { I18nInjectionKey } from '../injection'

export interface I18nTProps {
  keypath: TranslationKey
  plural?: number | string | null
  tag?: string
  params?: Record<string, string | number | boolean>
  defaultValue?: string
  html?: boolean
  hideIfEmpty?: boolean
  customPluralRule?: PluralFunc | null
  number?: number | string | null
  date?: Date | string | number | null
  relativeDate?: Date | string | number | null
}

const renderApi = { h, Fragment }

/** Stateless, so functional: no instance per translation on a page of them. */
const render: FunctionalComponent<I18nTProps> = (props, { slots, attrs }) => {
  const i18n = inject<VueI18n>(I18nInjectionKey)
  if (!i18n) throw new Error('[i18n-micro] I18nT: i18n instance not found. Make sure i18n plugin is installed.')
  return renderI18nT(renderApi, i18n, props, slots as RenderSlots, attrs) as ReturnType<FunctionalComponent>
}

export const I18nT = /*#__PURE__*/ Object.assign(render, {
  displayName: 'I18nT',
  inheritAttrs: false,
  props: {
    keypath: { type: String as PropType<TranslationKey>, required: true },
    plural: { type: [Number, String] as PropType<number | string | null> },
    tag: { type: String, default: 'span' },
    params: { type: Object as PropType<Record<string, string | number | boolean>> },
    defaultValue: { type: String, default: '' },
    html: { type: Boolean, default: false },
    hideIfEmpty: { type: Boolean, default: false },
    customPluralRule: { type: Function as PropType<PluralFunc>, default: null },
    number: { type: [Number, String] as PropType<number | string | null> },
    date: { type: [Date, String, Number] as PropType<Date | string | number | null> },
    relativeDate: { type: [Date, String, Number] as PropType<Date | string | number | null> },
  },
})
