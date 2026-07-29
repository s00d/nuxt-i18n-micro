<template>
  <div :style="[wrapperStyle, customWrapperStyle]">
    <!-- @slot Content before the button that opens the dropdown. -->
    <slot name="before-button" />

    <button class="language-switcher" :style="[buttonStyle, customButtonStyle, currentLocaleDisabled ? customDisabledLinkStyle : {}]" @click="toggleDropdown">
      <!-- @slot Content before the active locale label inside the button. -->
      <slot name="before-selected-locale" />
      {{ currentLocaleLabel }}
      <!-- @slot Content after the active locale label inside the button. -->
      <slot name="after-selected-locale" />
      <span :style="[iconStyle, dropdownOpen ? openIconStyle : {}, customIconStyle]">&#9662;</span>
    </button>

    <!-- @slot Content between the button and the dropdown panel. -->
    <slot name="before-dropdown" />

    <ul v-show="dropdownOpen" :style="[dropdownStyle, customDropdownStyle]">
      <!-- @slot Content at the top of the dropdown, above the locale list. -->
      <slot name="before-dropdown-items" />

      <li v-for="locale in locales" :key="locale.code" :style="[itemStyle, customItemStyle]">
        <!-- @slot Content before each locale entry. -->
        <slot name="before-item" :locale="locale" />

        <NuxtLink
          :class="`switcher-locale-${locale.code}`"
          :to="switchLocaleRoute(locale.code)"
          :style="[
            linkStyle,
            customLinkStyle,
            locale.code === currentLocale ? activeLinkStyle : {},
            locale.code === currentLocale ? customActiveLinkStyle : {},
          ]"
          :hreflang="locale.iso || locale.code"
          @click="switchLocale(locale.code)"
        >
          <!-- @slot Content before a locale's label inside its link. -->
          <slot name="before-link-content" :locale="locale" />
          {{ localeLabel(locale) }}
          <!-- @slot Content after a locale's label inside its link. -->
          <slot name="after-link-content" :locale="locale" />
        </NuxtLink>

        <!-- @slot Content after each locale entry. -->
        <slot name="after-item" :locale="locale" />
      </li>

      <!-- @slot Content at the bottom of the dropdown, below the locale list. -->
      <slot name="after-dropdown-items" />
    </ul>

    <!-- @slot Content after the dropdown panel. -->
    <slot name="after-dropdown" />
  </div>
</template>

<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import { computed, ref } from 'vue'
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
 * Every visual part is unstyled by default and can be replaced through a slot or styled
 * through the matching `custom*Style` prop.
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
  /** Inline style for the *current* locale when it is `disabled: true` in config. */
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

const { $switchLocaleRoute, $switchLocale, $getLocales, $getLocale, $getLocaleName } = useNuxtApp()
// Keep `$getLocales()` complete for SEO/meta; the switcher only shows switchable locales.
const allLocales = computed(() => $getLocales() ?? [])
const locales = computed(() => allLocales.value.filter((locale: Locale) => !locale.disabled))
const currentLocale = computed(() => $getLocale())
const currentLocaleDisabled = computed(() => allLocales.value.some((l: Locale) => l.code === currentLocale.value && l.disabled))
const currentLocaleName = computed(() => $getLocaleName())
const dropdownOpen = ref(false)

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const switchLocaleRoute = (code: string) => {
  return $switchLocaleRoute(code)
}

const localeLabel = (locale: Locale) => {
  const current = props.customLabels[locale.code] || locale.displayName
  if (!current) {
    console.warn('[i18n-switcher] Either define a custom label for the locale or provide a displayName in the nuxt.config.i18n')
  }
  return current
}

const currentLocaleLabel = computed(() =>
  localeLabel({
    code: currentLocale.value,
    displayName: currentLocaleName.value ?? undefined,
  }),
)

const switchLocale = (code: string) => {
  toggleDropdown()
  $switchLocale(code)
}

// Default Styles
const wrapperStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-block',
}

const buttonStyle: CSSProperties = {
  padding: '4px 12px',
  fontSize: '16px',
  cursor: 'pointer',
  backgroundColor: '#fff',
  border: '1px solid #333',
  transition: 'background-color 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const dropdownStyle: CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: '0',
  zIndex: '10',
  backgroundColor: '#fff',
  border: '1px solid #333',
  listStyle: 'none',
  padding: '0',
  margin: '4px 0 0 0',
}

const itemStyle: CSSProperties = {
  margin: '0',
  padding: '0',
}

const linkStyle: CSSProperties = {
  display: 'block',
  padding: '8px 12px',
  color: '#333',
  textDecoration: 'none',
  transition: 'background-color 0.3s ease',
}

const activeLinkStyle: CSSProperties = {
  fontWeight: 'bold',
  color: '#007bff',
  // Current locale is not a meaningful switch target
  cursor: 'not-allowed',
}

const iconStyle: CSSProperties = {
  marginLeft: '8px',
  transition: 'transform 0.3s ease',
}

const openIconStyle: CSSProperties = {
  transform: 'rotate(180deg)',
}
</script>
