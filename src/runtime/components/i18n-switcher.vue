<template>
  <div :style="[wrapperStyle, customWrapperStyle]">
    <button
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
          @click="toggleDropdown"
          :to="getLocaleLink(locale)"
          :style="[linkStyle, locale.code === currentLocale ? activeLinkStyle : {}, locale.code === currentLocale ? disabledLinkStyle : {}, customLinkStyle]"
          :hreflang="locale.iso || locale.code"
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

interface Locale {
  code: string
  iso?: string
  dir?: 'rtl' | 'ltr'
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

const { $localeRoute, $getLocales, $getLocale } = useNuxtApp()
const locales = ref($getLocales())
const currentLocale = computed(() => $getLocale())
const dropdownOpen = ref(false)

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const localeLabel = (locale: Locale) => {
  return props.customLabels[locale.code] || locale.code.toUpperCase()
}

const currentLocaleLabel = computed(() => localeLabel({ code: currentLocale.value }))

const getLocaleLink = (locale: Locale) => {
  const route = useRoute()
  const routeName = (route?.name ?? '').toString()
    .replace(`localized-`, '')
    .replace(new RegExp(`-${currentLocale.value}$`), '')
    .replace(new RegExp(`-${locale}$`), '')

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
