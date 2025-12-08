import { defineComponent, h, type PropType, type VNode } from 'vue'
import type { PluralFunc, TranslationKey } from '@i18n-micro/types'
import { useI18n } from '../use-i18n'

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
    const { t, tc, tn, td, tdr, locale, getRoute } = useI18n()

    return () => {
      const options: Record<string, string | number | boolean> = {}
      const route = getRoute()

      // Handle number formatting
      if (props.number !== undefined) {
        const numberValue = Number(props.number)
        const formattedNumber = tn(numberValue)
        const translation = t(props.keypath, { number: formattedNumber, ...props.params }, undefined, route)
        return h(props.tag, { ...attrs, innerHTML: translation })
      }

      // Handle date formatting
      if (props.date !== undefined) {
        const formattedDate = td(props.date)
        const translation = t(props.keypath, { date: formattedDate, ...props.params }, undefined, route)
        return h(props.tag, { ...attrs, innerHTML: translation })
      }

      // Handle relative date formatting
      if (props.relativeDate !== undefined) {
        const formattedRelativeDate = tdr(props.relativeDate)
        const translation = t(props.keypath, { relativeDate: formattedRelativeDate, ...props.params }, undefined, route)
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
            locale.value,
            (k: TranslationKey, p?: Record<string, string | number | boolean>, dv?: string) => t(k, p, dv, route),
          )
          return h(props.tag, { ...attrs, innerHTML: translation || '' })
        }
        else {
          const translation = tc(props.keypath, { count, ...props.params })
          return h(props.tag, { ...attrs, innerHTML: translation })
        }
      }

      // Regular translation
      const translation = (t(props.keypath, { ...props.params, ...options }, undefined, route) ?? '').toString()

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
