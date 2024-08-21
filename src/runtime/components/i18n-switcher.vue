<template>
  <div :class="wrapperClass">
    <button
      :class="buttonClass"
      @click="toggleDropdown"
    >
      {{ currentLocaleLabel }}
      <span :class="[iconClass, dropdownOpen ? 'open' : '']">&#9662;</span>
    </button>
    <ul
      v-if="dropdownOpen"
      :class="dropdownClass"
    >
      <li
        v-for="locale in locales"
        :key="locale.code"
        :class="[itemClass, locale.code === currentLocale ? activeClass : '']"
      >
        <NuxtLink
          :to="getLocaleLink(locale)"
          :class="[linkClass, locale.code === currentLocale ? disabledClass : '']"
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
import { useNuxtApp } from '#app'
import { useRoute } from '#imports'

interface Locale {
  code: string
  iso?: string
  dir?: 'rtl' | 'ltr'
}

interface Props {
  wrapperClass?: string
  buttonClass?: string
  dropdownClass?: string
  itemClass?: string
  linkClass?: string
  activeClass?: string
  disabledClass?: string
  iconClass?: string
  customLabels?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  wrapperClass: 'locale-switcher',
  buttonClass: 'locale-button',
  dropdownClass: 'locale-dropdown',
  itemClass: 'locale-item',
  linkClass: 'locale-link',
  activeClass: 'active',
  disabledClass: 'disabled',
  iconClass: 'dropdown-icon',
  customLabels: () => ({}),
})

const { $localeRoute, $getLocales, $getLocale } = useNuxtApp()
const locales = ref($getLocales())
const currentLocale = ref($getLocale())
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

  const routeName = (route?.name ?? '').toString().replace(`localized-`, '')

  return $localeRoute({ name: routeName }, locale.code)
}
</script>

<style scoped>
.locale-switcher {
  position: relative;
  display: inline-block;
}

.locale-button {
  padding: 4px 12px;
  font-size: 16px;
  cursor: pointer;
  background-color: #fff;
  border: 1px solid #333;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.locale-button:hover {
  background-color: #f0f0f0;
}

.locale-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  background-color: #fff;
  border: 1px solid #333;
  list-style: none;
  padding: 0;
  margin: 4px 0 0 0;
}

.locale-item {
  margin: 0;
  padding: 0;
}

.locale-link {
  display: block;
  padding: 8px 12px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.locale-link:hover {
  background-color: #f0f0f0;
}

.locale-link.disabled {
  cursor: not-allowed;
  color: #aaa;
}

.locale-link.active {
  font-weight: bold;
  color: #007bff;
}

.dropdown-icon {
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.dropdown-icon.open {
  transform: rotate(180deg);
}
</style>
