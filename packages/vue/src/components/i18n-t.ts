import { defineComponent, h, inject, type PropType, type VNode } from 'vue'
import type { PluralFunc, TranslationKey } from '@i18n-micro/types'
import { I18nInjectionKey } from '../injection'
import type { VueI18n } from '../composer'

export const I18nT = defineComponent({
  name: 'I18nT',
  props: {
    keypath: {
      type: String as PropType<TranslationKey>,
      required: true,
    },
    plural: {
      type: [Number, String] as PropType<number | string>,
    },
    tag: {
      type: String as PropType<string>,
      default: 'span',
    },
    params: {
      type: Object as PropType<Record<string, string | number | boolean>>,
      default: () => ({}),
    },
    defaultValue: {
      type: String as PropType<string>,
      default: '',
    },
    html: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    hideIfEmpty: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    customPluralRule: {
      type: Function as PropType<PluralFunc>,
      default: null,
    },
    number: {
      type: [Number, String] as PropType<number | string>,
    },
    date: {
      type: [Date, String, Number] as PropType<Date | string | number>,
    },
    relativeDate: {
      type: [Date, String, Number] as PropType<Date | string | number>,
    },
  },
  setup(props, { slots, attrs }) {
    const i18n = inject<VueI18n>(I18nInjectionKey)

    if (!i18n) {
      throw new Error('[i18n-micro] I18nT: i18n instance not found. Make sure i18n plugin is installed.')
    }

    return () => {
      const options: Record<string, string | number | boolean> = {}
      const route = i18n.getRoute()

      // Handle number formatting
      if (props.number !== undefined) {
        const numberValue = Number(props.number)
        const formattedNumber = i18n.tn(numberValue)
        const translation = i18n.t(props.keypath, { number: formattedNumber, ...props.params }, undefined, route)
        return h(props.tag, { ...attrs, innerHTML: translation })
      }

      // Handle date formatting
      if (props.date !== undefined) {
        const formattedDate = i18n.td(props.date)
        const translation = i18n.t(props.keypath, { date: formattedDate, ...props.params }, undefined, route)
        return h(props.tag, { ...attrs, innerHTML: translation })
      }

      // Handle relative date formatting
      if (props.relativeDate !== undefined) {
        const formattedRelativeDate = i18n.tdr(props.relativeDate)
        const translation = i18n.t(props.keypath, { relativeDate: formattedRelativeDate, ...props.params }, undefined, route)
        return h(props.tag, { ...attrs, innerHTML: translation })
      }

      // Handle pluralization
      if (props.plural !== undefined) {
        const count = Number.parseInt(props.plural.toString())
        if (props.customPluralRule) {
          const translation = props.customPluralRule(
            props.keypath,
            count,
            props.params,
            i18n.locale.value,
            (k: TranslationKey, p?: Record<string, string | number | boolean>, dv?: string) => i18n.t(k, p, dv, route),
          )
          return h(props.tag, { ...attrs, innerHTML: translation || '' })
        }
        else {
          const translation = i18n.tc(props.keypath, { count, ...props.params })
          return h(props.tag, { ...attrs, innerHTML: translation })
        }
      }

      // Regular translation
      const translation = (i18n.t(props.keypath, { ...props.params, ...options }, undefined, route) ?? '').toString()

      if (props.hideIfEmpty && !translation.trim()) {
        return props.defaultValue ?? null
      }

      if (props.html) {
        return h(props.tag, { ...attrs, innerHTML: translation })
      }

      // Handle slots
      if (slots.default) {
        return h(
          props.tag,
          attrs,
          slots.default({ translation }),
        )
      }

      // Handle named slots for interpolation
      const children: (string | VNode)[] = []
      let lastIndex = 0

      for (const [slotName, slotFn] of Object.entries(slots)) {
        if (slotName === 'default') continue

        const placeholder = `{${slotName}}`
        const index = translation.indexOf(placeholder, lastIndex)

        if (index !== -1) {
          if (index > lastIndex) {
            children.push(translation.slice(lastIndex, index))
          }

          if (slotFn) {
            children.push(h(slotFn))
          }

          lastIndex = index + placeholder.length
        }
      }

      if (lastIndex < translation.length) {
        children.push(translation.slice(lastIndex))
      }

      if (slots.default) {
        return h(
          props.tag,
          attrs,
          slots.default({ children }),
        )
      }

      if (children.length > 0) {
        return h(props.tag, attrs, children)
      }

      return h(props.tag, attrs, translation)
    }
  },
})
