<script lang="ts">
import type { PluralFunc } from '@i18n-micro/types'
import type { PropType, VNode } from 'vue'
import { defineComponent, h as hyperscript } from 'vue'
import { useNuxtApp, useRoute } from '#imports'
import type { PluginsInjections } from '../../runtime/plugins/01.plugin'

/**
 * Renders one translation into an element, with pluralization, interpolation and
 * number/date formatting handled for you.
 *
 * Exactly one of `plural`, `number`, `date` and `relativeDate` applies at a time; when
 * several are set the first of that list wins.
 *
 * @slot default — receives `{ translation }`, for wrapping the resolved string in markup
 * @slot {name} — any other named slot replaces the `{name}` placeholder inside the translation
 */
export default defineComponent({
  name: 'I18nT',
  props: {
    /** Translation key to render. */
    keypath: {
      type: String as PropType<string>,
      required: true,
    },
    /** Count selecting the plural form. Set it to use `$tc` instead of `$t`. */
    plural: {
      type: [Number, String] as PropType<number | string>,
    },
    /** Element to render. */
    tag: {
      type: String as PropType<string>,
      default: 'span',
    },
    /** Interpolation values substituted into the translation. */
    params: {
      type: Object as PropType<Record<string, string | number | boolean>>,
      default: () => ({}),
    },
    /** Rendered instead of the component when `hideIfEmpty` suppresses an empty translation. */
    defaultValue: {
      type: String as PropType<string>,
      default: '',
    },
    /** Render the translation as HTML rather than text. Only for content you control. */
    html: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    /** Render nothing when the translation resolves to an empty string. */
    hideIfEmpty: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    /** Plural rule for this element only, overriding the configured one. */
    customPluralRule: {
      type: Function as PropType<PluralFunc>,
      default: null,
    },
    /** Formats the value with `$tn` and passes it to the translation as `{number}`. */
    number: {
      type: [Number, String] as PropType<number | string>,
    },
    /** Formats the value with `$td` and passes it to the translation as `{date}`. */
    date: {
      type: [Date, String, Number] as PropType<Date | string | number>,
    },
    /** Formats the value with `$tdr` and passes it to the translation as `{relativeDate}`. */
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
