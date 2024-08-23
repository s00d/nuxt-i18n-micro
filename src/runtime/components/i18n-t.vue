<script lang="ts">
import { h, defineComponent } from 'vue'
import type { VNode } from 'vue'
import { useNuxtApp } from '#app'

export default defineComponent({
  name: 'I18nT',
  props: {
    keypath: {
      type: String,
      required: true,
    },
    plural: {
      type: [Number, String],
    },
    tag: {
      type: String,
      default: 'span',
    },
    params: {
      type: Object,
      default: () => ({}),
    },
    defaultValue: {
      type: String,
      default: '',
    },
    html: {
      type: Boolean,
      default: false,
    },
    hideIfEmpty: {
      type: Boolean,
      default: false,
    },
    customPluralRule: {
      type: Function,
      default: null,
    },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const options: Record<string, unknown> = {}

      if (props.plural !== undefined) {
        if (props.customPluralRule) {
          return props.customPluralRule(
            useNuxtApp().$t(props.keypath, { ...props.params, ...options }),
            props.plural,
            useNuxtApp().$getLocale(),
          )
        }
        else {
          return useNuxtApp().$tc(props.keypath, Number.parseInt(props.plural.toString()))
        }
      }

      const translation = (useNuxtApp().$t(props.keypath, { ...props.params, ...options }) ?? '').toString()

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
