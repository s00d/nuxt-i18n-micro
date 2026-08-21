import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { defineI18nTheme } from '@i18n-micro/vitepress/theme'
import PathHelpersDemo from './PathHelpersDemo.vue'

export default defineI18nTheme(DefaultTheme, {
  enhanceApp({ app }) {
    app.component('PathHelpersDemo', PathHelpersDemo)
  },
}) satisfies Theme
