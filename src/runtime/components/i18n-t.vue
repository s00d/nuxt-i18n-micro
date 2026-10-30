<script lang="ts">
import { type I18nTRenderProps, renderI18nT, type RenderSlots, type TextHost } from '@i18n-micro/core/render'
import type { PluralFunc } from '@i18n-micro/types'
import type { FunctionalComponent, PropType, VNode } from 'vue'
import { Fragment, h } from 'vue'
import { useNuxtApp } from '#imports'
import type { PluginsInjections } from '../../runtime/plugins/01.plugin'

const renderApi = { h, Fragment }

/** Stateless, so functional: no instance per translation on a page of them. */
const render: FunctionalComponent<I18nTRenderProps> = (props, { slots, attrs }) => {
  const { $t, $tc, $tn, $td, $tdr, $getLocale, $pluralFunc, $pluralLocale } = useNuxtApp() as unknown as PluginsInjections
  // `$t`, not `$_t(route)`: the active dictionary, as in a template, at a twentieth of the cost per lookup
  const host = {
    t: $t,
    tc: $tc,
    tn: $tn,
    td: $td,
    tdr: $tdr,
    getLocale: $getLocale,
    pluralFunc: $pluralFunc,
    pluralLocale: $pluralLocale,
  } as unknown as TextHost
  return renderI18nT(renderApi, host, props, slots as RenderSlots, attrs) as VNode
}

/**
 * Renders one translation into an element, with pluralization, interpolation and
 * number/date formatting handled for you.
 *
 * Exactly one of `number`, `date`, `relativeDate` and `plural` applies at a time; when
 * several are set the first of that list wins — the order the render function checks them.
 *
 * @slot default — receives `{ translation }`, for wrapping the resolved string in markup
 * @slot {name} — any other named slot replaces every `{name}` placeholder inside the translation
 */
export default Object.assign(render, {
  displayName: 'I18nT',
  inheritAttrs: false,
  props: {
    /** Translation key to render. */
    keypath: {
      type: String as PropType<string>,
      required: true,
    },
    /** Count selecting the plural form. Set it to use `$tc` instead of `$t`. `null` means unset. */
    plural: {
      type: [Number, String] as PropType<number | string | null>,
    },
    /** Element to render. */
    tag: {
      type: String as PropType<string>,
      default: 'span',
    },
    /** Interpolation values substituted into the translation. */
    params: {
      type: Object as PropType<Record<string, string | number | boolean>>,
    },
    /** Rendered instead of the component when `hideIfEmpty` suppresses an empty translation. */
    defaultValue: {
      type: String as PropType<string>,
      default: '',
    },
    /** Render the translation as HTML rather than text. Only for translations you control: `params` are escaped, the translation is not. */
    html: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    /** Render nothing when the translation resolves to an empty string. */
    hideIfEmpty: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    /** Plural rule for this element only, overriding the configured one. Its answer is used as is; `null` renders empty. */
    customPluralRule: {
      type: Function as PropType<PluralFunc>,
      default: null,
    },
    /** Formats the value with `$tn` and passes it to the translation as `{number}`, alongside `params`. */
    number: {
      type: [Number, String] as PropType<number | string | null>,
    },
    /** Formats the value with `$td` and passes it to the translation as `{date}`, alongside `params`. */
    date: {
      type: [Date, String, Number] as PropType<Date | string | number | null>,
    },
    /** Formats the value with `$tdr` and passes it to the translation as `{relativeDate}`, alongside `params`. */
    relativeDate: {
      type: [Date, String, Number] as PropType<Date | string | number | null>,
    },
  },
})
</script>
