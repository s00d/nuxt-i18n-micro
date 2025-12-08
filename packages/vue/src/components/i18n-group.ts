import { defineComponent, h, type PropType } from 'vue'
import { useI18n } from '../use-i18n'
import type { TranslationKey } from '@i18n-micro/types'

export const I18nGroup = defineComponent({
  name: 'I18nGroup',
  props: {
    prefix: {
      type: String as PropType<string>,
      required: true,
    },
    groupClass: {
      type: String as PropType<string>,
      default: '',
    },
  },
  setup(props, { slots }) {
    const { t, getRoute } = useI18n()

    const translate = (key: string, params?: Record<string, string | number | boolean>) => {
      // Use type assertion for dynamic keys with prefix
      // The developer is responsible for ensuring the key exists
      return t(`${props.prefix}.${key}` as TranslationKey, params, undefined, getRoute())
    }

    return () => h('div', {
      class: ['i18n-group', props.groupClass],
    }, slots.default?.({ prefix: props.prefix, t: translate }))
  },
})
