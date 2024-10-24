<template>
  <div :style="[wrapperStyle, customWrapperStyle]">
    <button
      class="language-switcher"
      :style="[buttonStyle, customButtonStyle]"
      @click="toggleDropdown"
    >
      {{ currentLocaleLabel }}
      <span :style="[iconStyle, dropdownOpen ? openIconStyle : {}, customIconStyle]">&#9662;</span>
    </button>
    <ul
      v-if="dropdownOpen"
      :style="[dropdownStyle, customDropdownStyle]"
    >
      <li
        v-for="locale in locales"
        :key="locale.code"
        :style="[itemStyle, customItemStyle]"
      >
        <NuxtLink
          :class="`switcher-locale-${locale.code}`"
          :to="getLocaleLink(locale)"
          :style="[
            linkStyle,
            locale.code === currentLocale ? activeLinkStyle : {},
            locale.code === currentLocale ? disabledLinkStyle : {},
            customLinkStyle,
          ]"
          :hreflang="locale.iso || locale.code"
          @click="toggleDropdown"
        >
          {{ localeLabel(locale) }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { CSSProperties } from 'vue'
import { useNuxtApp } from '#app'
import { useRoute } from '#imports'

type LocaleCode = string
interface Locale {
  code: LocaleCode
  disabled?: boolean
  iso?: string
  dir?: 'ltr' | 'rtl' | 'auto'
  displayName?: string
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

const { $localeRoute, $getLocales, $getLocale, $getLocaleName } = useNuxtApp()
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

const getLocaleLink = (locale: Locale) => {
  const route = useRoute()
  const routeName = (route?.name ?? '')
    .toString()
    .replace(`localized-`, '')
    .replace(new RegExp(`-${currentLocale.value}$`), '')
    .replace(new RegExp(`-${locale}$`), '')

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return $localeRoute({ name: routeName }, locale.code)
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
