import DefaultTheme from 'vitepress/theme'
import 'vitepress-plugin-chartjs/style.css'
import 'vitepress-plugin-folder-tree/style.css'
import { installRedirects } from '../redirects'
import './custom.css'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  async enhanceApp({ router, siteData }) {
    // Only load on client (SSR-safe)
    if (typeof window === 'undefined') return

    installRedirects(router, siteData.value.base, window.location)

    const { Chart, registerables } = await import('chart.js')
    Chart.register(...registerables)
  },
}
