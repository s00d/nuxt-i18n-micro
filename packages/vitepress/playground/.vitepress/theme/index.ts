import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { defineI18nTheme } from '@i18n-micro/vitepress'

// Messages + locales come from withI18nMicro (virtual:i18n-micro/*) — no glob boilerplate.
export default defineI18nTheme(DefaultTheme) satisfies Theme
