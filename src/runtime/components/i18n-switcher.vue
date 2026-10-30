<template>
  <component :is="render" />
</template>

<script lang="ts" setup>
import { createLocaleSwitcher, type RenderSlots } from '@i18n-micro/core/render'
import type { CSSProperties } from 'vue'
import { Fragment, h, onMounted, onUnmounted, ref } from 'vue'
import { useNuxtApp } from '#imports'

type LocaleCode = string
interface Locale {
  code: LocaleCode
  disabled?: boolean
  iso?: string
  dir?: 'ltr' | 'rtl' | 'auto'
  displayName?: string
  baseUrl?: string
  baseDefault?: boolean
  [key: string]: unknown
}

/**
 * A locale switcher: a button showing the current locale and a dropdown of the rest,
 * each linking to the equivalent route in that locale.
 *
 * It ships small inline default styles; each `custom*Style` prop is merged on top of the
 * matching part, and the slots add markup around it. Locales with `disabled: true` are not listed.
 * A click on a link is one navigation; with a modifier key it is the browser's (a new tab).
 */
defineOptions({ name: 'I18nSwitcher' })

interface Props {
  /** Display name per locale code, overriding the `displayName` from the locale config. */
  customLabels?: Record<string, string>
  /** Inline style for the outer wrapper. */
  customWrapperStyle?: CSSProperties
  /** Inline style for the button that opens the dropdown. */
  customButtonStyle?: CSSProperties
  /** Inline style for the dropdown panel. */
  customDropdownStyle?: CSSProperties
  /** Inline style for each item in the dropdown. */
  customItemStyle?: CSSProperties
  /** Inline style for the link inside an item. */
  customLinkStyle?: CSSProperties
  /** Inline style for the link of the currently active locale. */
  customActiveLinkStyle?: CSSProperties
  /** Inline style for the *current* locale button when it is `disabled: true` in config. */
  customDisabledLinkStyle?: CSSProperties
  /** Inline style for the caret icon on the button. */
  customIconStyle?: CSSProperties
}

const props = withDefaults(defineProps<Props>(), {
  customLabels: () => ({}),
  customWrapperStyle: () => ({}),
  customButtonStyle: () => ({}),
  customDropdownStyle: () => ({}),
  customItemStyle: () => ({}),
  customLinkStyle: () => ({}),
  customActiveLinkStyle: () => ({}),
  customDisabledLinkStyle: () => ({}),
  customIconStyle: () => ({}),
})

const slots = defineSlots<{
  /** Content before the button that opens the dropdown. */
  'before-button'?: () => unknown
  /** Content before the active locale label inside the button. */
  'before-selected-locale'?: () => unknown
  /** Content after the active locale label inside the button. */
  'after-selected-locale'?: () => unknown
  /** Content between the button and the dropdown panel. */
  'before-dropdown'?: () => unknown
  /** Content at the top of the dropdown, above the locale list. */
  'before-dropdown-items'?: () => unknown
  /** Content before each locale entry. */
  'before-item'?: (scope: { locale: Locale }) => unknown
  /** Content before a locale's label inside its link. */
  'before-link-content'?: (scope: { locale: Locale }) => unknown
  /** Content after a locale's label inside its link. */
  'after-link-content'?: (scope: { locale: Locale }) => unknown
  /** Content after each locale entry. */
  'after-item'?: (scope: { locale: Locale }) => unknown
  /** Content at the bottom of the dropdown, below the locale list. */
  'after-dropdown-items'?: () => unknown
  /** Content after the dropdown panel. */
  'after-dropdown'?: () => unknown
}>()

const { $switchLocalePath, $switchLocale, $getLocales, $getLocale, $getLocaleName } = useNuxtApp()

const render = createLocaleSwitcher(
  { h, Fragment, ref, onMounted, onUnmounted },
  {
    // `$getLocales()` stays complete for SEO/meta; the switcher lists only the enabled ones
    locales: () => ($getLocales() ?? []) as Locale[],
    locale: () => $getLocale(),
    localeName: () => $getLocaleName(),
    href: (code) => $switchLocalePath(code),
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
  slots as RenderSlots,
)
</script>
