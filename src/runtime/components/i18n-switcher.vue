<template>
  <div :style="[wrapperStyle, customWrapperStyle]">
    <slot name="before-button" />

    <button
      class="language-switcher"
      :style="[buttonStyle, customButtonStyle]"
      @click="toggleDropdown"
    >
      <slot name="before-selected-locale" />
      {{ currentLocaleLabel }}
      <slot name="after-selected-locale" />
      <span :style="[iconStyle, dropdownOpen ? openIconStyle : {}, customIconStyle]">&#9662;</span>
    </button>

    <slot name="before-dropdown" />

    <ul
      v-show="dropdownOpen"
      :style="[dropdownStyle, customDropdownStyle]"
    >
      <slot name="before-dropdown-items" />

      <li
        v-for="locale in locales"
        :key="locale.code"
        :style="[itemStyle, customItemStyle]"
      >
        <slot
          name="before-item"
          :locale="locale"
        />

        <NuxtLink
          :class="`switcher-locale-${locale.code}`"
          :to="switchLocaleRoute(locale.code)"
          :style="[
            linkStyle,
            locale.code === currentLocale ? activeLinkStyle : {},
            locale.code === currentLocale ? disabledLinkStyle : {},
            customLinkStyle,
          ]"
          :hreflang="locale.iso || locale.code"
          @click="switchLocale()"
        >
          <slot
            name="before-link-content"
            :locale="locale"
          />
          {{ localeLabel(locale) }}
          <slot
            name="after-link-content"
            :locale="locale"
          />
        </NuxtLink>

        <slot
          name="after-item"
          :locale="locale"
        />
      </li>

      <slot name="after-dropdown-items" />
    </ul>

    <slot name="after-dropdown" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { CSSProperties } from 'vue'
import { useNuxtApp } from '#app'

type LocaleCode = string
interface Locale {
  code: LocaleCode
  disabled?: boolean
  iso?: string
  dir?: 'ltr' | 'rtl' | 'auto'
  displayName?: string
  baseUrl?: string
  baseDefault?: boolean
}

interface Props {
  customLabels?: Record<string, string>
  customWrapperStyle?: CSSProperties
  customButtonStyle?: CSSProperties
  customDropdownStyle?: CSSProperties
  customItemStyle?: CSSProperties
  customLinkStyle?: CSSProperties
  customActiveLinkStyle?: CSSProperties
  customDisabledLinkStyle?: CSSProperties
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

const { $switchLocaleRoute, $getLocales, $getLocale, $getLocaleName } = useNuxtApp()
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const locales = ref($getLocales())
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const currentLocale = computed(() => $getLocale())
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const currentLocaleName = computed(() => $getLocaleName())
const dropdownOpen = ref(false)

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const switchLocaleRoute = (code: string) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return $switchLocaleRoute(code)
}

const localeLabel = (locale: Locale) => {
  const current = props.customLabels[locale.code] || locale.displayName
  if (!current) {
    console.warn(
      '[i18n-switcher] Either define a custom label for the locale or provide a displayName in the nuxt.config.i18n',
    )
  }
  return current
}

const currentLocaleLabel = computed(() => localeLabel({
  code: currentLocale.value,
  displayName: currentLocaleName.value ?? undefined,
}))

const switchLocale = () => {
  toggleDropdown()
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
}

const disabledLinkStyle: CSSProperties = {
  cursor: 'not-allowed',
  color: '#aaa',
}

const iconStyle: CSSProperties = {
  marginLeft: '8px',
  transition: 'transform 0.3s ease',
}

const openIconStyle: CSSProperties = {
  transform: 'rotate(180deg)',
}
</script>
