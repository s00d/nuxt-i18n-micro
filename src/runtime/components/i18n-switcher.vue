<script lang="ts">
import { createLocaleSwitcher, type RenderSlots } from '@i18n-micro/core/render'
import type { Locale } from '@i18n-micro/types'
import { hasProtocol } from 'ufo'
import type { CSSProperties, PropType, SlotsType } from 'vue'
import { defineComponent, Fragment, h, onMounted, onUnmounted, ref } from 'vue'
import { useNuxtApp, useRouter } from '#imports'

const styleProp = () => ({})

/**
 * A locale switcher: a button showing the current locale and a dropdown of the rest,
 * each linking to the equivalent route in that locale.
 *
 * It ships small inline default styles; each `custom*Style` prop is merged on top of the
 * matching part, and the slots add markup around it. Locales with `disabled: true` are not listed.
 * A click on a link is one navigation; with a modifier key it is the browser's (a new tab).
 */
export default defineComponent({
  name: 'I18nSwitcher',
  props: {
    /** Display name per locale code, overriding the `displayName` from the locale config. */
    customLabels: { type: Object as PropType<Record<string, string>>, default: styleProp },
    /** Inline style for the outer wrapper. */
    customWrapperStyle: { type: Object as PropType<CSSProperties>, default: styleProp },
    /** Inline style for the button that opens the dropdown. */
    customButtonStyle: { type: Object as PropType<CSSProperties>, default: styleProp },
    /** Inline style for the dropdown panel. */
    customDropdownStyle: { type: Object as PropType<CSSProperties>, default: styleProp },
    /** Inline style for each item in the dropdown. */
    customItemStyle: { type: Object as PropType<CSSProperties>, default: styleProp },
    /** Inline style for the link inside an item. */
    customLinkStyle: { type: Object as PropType<CSSProperties>, default: styleProp },
    /** Inline style for the link of the currently active locale. */
    customActiveLinkStyle: { type: Object as PropType<CSSProperties>, default: styleProp },
    /** Inline style for the *current* locale button when it is `disabled: true` in config. */
    customDisabledLinkStyle: { type: Object as PropType<CSSProperties>, default: styleProp },
    /** Inline style for the caret icon on the button. */
    customIconStyle: { type: Object as PropType<CSSProperties>, default: styleProp },
  },
  slots: Object as SlotsType<{
    /** Content before the button that opens the dropdown. */
    'before-button': () => unknown
    /** Content before the active locale label inside the button. */
    'before-selected-locale': () => unknown
    /** Content after the active locale label inside the button. */
    'after-selected-locale': () => unknown
    /** Content between the button and the dropdown panel. */
    'before-dropdown': () => unknown
    /** Content at the top of the dropdown, above the locale list. */
    'before-dropdown-items': () => unknown
    /** Content before each locale entry. */
    'before-item': (scope: { locale: Locale }) => unknown
    /** Content before a locale's label inside its link. */
    'before-link-content': (scope: { locale: Locale }) => unknown
    /** Content after a locale's label inside its link. */
    'after-link-content': (scope: { locale: Locale }) => unknown
    /** Content after each locale entry. */
    'after-item': (scope: { locale: Locale }) => unknown
    /** Content at the bottom of the dropdown, below the locale list. */
    'after-dropdown-items': () => unknown
    /** Content after the dropdown panel. */
    'after-dropdown': () => unknown
  }>,
  setup(props, { slots }) {
    const { $switchLocalePath, $switchLocale, $getLocales, $getLocale, $getLocaleName } = useNuxtApp()
    const router = useRouter()

    return createLocaleSwitcher(
      { h, Fragment, ref, onMounted, onUnmounted },
      {
        // `$getLocales()` stays complete for SEO/meta; the switcher lists only the enabled ones
        locales: () => ($getLocales() ?? []) as Locale[],
        locale: () => $getLocale(),
        localeName: () => $getLocaleName(),
        // the router adds `app.baseURL`; a URL of another domain is complete already
        href: (code) => {
          const path = $switchLocalePath(code)
          return hasProtocol(path) ? path : router.resolve(path).href
        },
        select: (code) => void $switchLocale(code),
        // in the server HTML, for crawlers
        keepList: true,
        onMissingLabel: (code) => {
          if (!import.meta.dev) return
          console.warn(
            `[i18n-switcher] No label for "${code}" — set a customLabels entry or a displayName in nuxt.config.i18n. Falling back to the code.`,
          )
        },
      },
      props,
      slots as unknown as RenderSlots,
    )
  },
})
</script>
