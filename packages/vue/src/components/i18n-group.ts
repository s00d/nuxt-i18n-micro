import type { TranslationKey } from '@i18n-micro/types'
import { defineComponent, h, inject } from 'vue'
import type { VueI18n } from '../composer'
import { I18nInjectionKey } from '../injection'

interface I18nGroupProps {
  prefix: string
  groupClass?: string
}

export const I18nGroup = defineComponent<I18nGroupProps>({
  name: 'I18nGroup',
  props: {
    prefix: {
      type: String,
      required: true,
    },
    groupClass: {
      type: String,
      default: '',
    },
  },
  setup(props, { slots }) {
    const i18n = inject<VueI18n>(I18nInjectionKey)

    if (!i18n) {
      throw new Error('[i18n-micro] I18nGroup: i18n instance not found. Make sure i18n plugin is installed.')
    }

    const translate = (key: string, params?: Record<string, string | number | boolean>) => {
      // Use type assertion for dynamic keys with prefix
      // The developer is responsible for ensuring the key exists
      return i18n.t(`${props.prefix}.${key}` as TranslationKey, params, undefined, i18n.getRoute())
    }

    return () =>
      h(
        'div',
        {
          class: ['i18n-group', props.groupClass],
        },
        slots.default?.({ prefix: props.prefix, t: translate }),
      )
  },
})
