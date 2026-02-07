// @ts-nocheck

import { i18nDevToolsPlugin } from '@i18n-micro/devtools-ui/vite'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [
    solidPlugin(),
    i18nDevToolsPlugin({
      base: '/__i18n_api',
      translationDir: 'src/locales',
      injectButton: true,
    }),
  ],
})
