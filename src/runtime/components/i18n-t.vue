<script lang="ts">
import { h, defineComponent } from 'vue'
import type { VNode, PropType } from 'vue'
import type { PluralFunc } from 'nuxt-i18n-micro-types'
import type { PluginsInjections } from '../../runtime/plugins/01.plugin'
import { useNuxtApp } from '#imports'

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

      const { $getLocale, $t, $tc, $tn, $td, $tdr } = useNuxtApp() as unknown as PluginsInjections

      if (props.number !== undefined) {
        const numberValue = Number(props.number)
        return h(props.tag, { ...attrs, innerHTML: $t(props.keypath, { number: $tn(numberValue) }) })
      }

      if (props.date !== undefined) {
        return h(props.tag, { ...attrs, innerHTML: $t(props.keypath, { date: $td(props.date) }) })
      }

      if (props.relativeDate !== undefined) {
        return h(props.tag, { ...attrs, innerHTML: $t(props.keypath, { relativeDate: $tdr(props.relativeDate) }) })
      }

      if (props.plural !== undefined) {
        const count = Number.parseInt(props.plural.toString())
        if (props.customPluralRule) {
          return h(props.tag, { ...attrs, innerHTML: props.customPluralRule(
            props.keypath,
            count,
            props.params,
            $getLocale(),
            $t,
          ) })
        }
        else {
          return h(props.tag, { ...attrs, innerHTML: $tc(props.keypath, { count, ...props.params }) })
        }
      }

      const translation = ($t(props.keypath, { ...props.params, ...options }) ?? '').toString()

      if (props.hideIfEmpty && !translation.trim()) {
        return props.defaultValue ?? null
      }

      if (props.html) {
        return h(props.tag, { ...attrs, innerHTML: translation })
      }

      if (slots.default) {
        return h(
          props.tag,
          attrs,
          slots.default({ translation }),
        )
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

          children.push(h(slotFn!))

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

      return h(props.tag, attrs, children)
    }
  },
})
</script>
