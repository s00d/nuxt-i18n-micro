<script lang="ts">
import type { PluralFunc } from '@i18n-micro/types'
import type { PropType, VNode } from 'vue'
import { defineComponent, h as hyperscript } from 'vue'
import { useNuxtApp, useRoute } from '#imports'
import type { PluginsInjections } from '../../runtime/plugins/01.plugin'

export default defineComponent({
  name: 'I18nT',
  props: {
    keypath: {
      type: String as PropType<string>,
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
    return () => {
      const options: Record<string, string | number | boolean> = {}

      const { $getLocale, $_t, $tc, $tn, $td, $tdr } = useNuxtApp() as unknown as PluginsInjections
      const route = useRoute()
      const $t = $_t(route)

      if (props.number !== undefined) {
        const numberValue = Number(props.number)
        return hyperscript(props.tag, { ...attrs, innerHTML: $t(props.keypath, { number: $tn(numberValue) }) })
      }

      if (props.date !== undefined) {
        return hyperscript(props.tag, { ...attrs, innerHTML: $t(props.keypath, { date: $td(props.date) }) })
      }

      if (props.relativeDate !== undefined) {
        return hyperscript(props.tag, { ...attrs, innerHTML: $t(props.keypath, { relativeDate: $tdr(props.relativeDate) }) })
      }

      if (props.plural !== undefined) {
        const count = Number.parseInt(props.plural.toString(), 10)
        if (props.customPluralRule) {
          return hyperscript(props.tag, { ...attrs, innerHTML: props.customPluralRule(props.keypath, count, props.params, $getLocale(), $t) })
        } else {
          return hyperscript(props.tag, { ...attrs, innerHTML: $tc(props.keypath, { count, ...props.params }) })
        }
      }

      const translation = ($t(props.keypath, { ...props.params, ...options }) ?? '').toString()

      if (props.hideIfEmpty && !translation.trim()) {
        return props.defaultValue ?? null
      }

      if (props.html) {
        return hyperscript(props.tag, { ...attrs, innerHTML: translation })
      }

      if (slots.default) {
        return hyperscript(props.tag, attrs, slots.default({ translation }))
      }

      const children: (string | VNode)[] = []
      let lastIndex = 0

      for (const [slotName, slotFn] of Object.entries(slots)) {
        const placeholder = `{${slotName}}`
        const index = translation.indexOf(placeholder, lastIndex)

        if (index !== -1) {
          if (index > lastIndex) {
            children.push(translation.slice(lastIndex, index))
          }

          children.push(hyperscript(slotFn!))

          lastIndex = index + placeholder.length
        }
      }

      if (lastIndex < translation.length) {
        children.push(translation.slice(lastIndex))
      }

      if (slots.default) {
        return hyperscript(props.tag, attrs, slots.default({ children }))
      }

      return hyperscript(props.tag, attrs, children)
    }
  },
})
</script>
