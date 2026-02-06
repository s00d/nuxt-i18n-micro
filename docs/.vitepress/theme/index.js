import DefaultTheme from 'vitepress/theme'
import './custom.css'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  async enhanceApp({ app }) {
    // Only load on client (SSR-safe)
    if (typeof window !== 'undefined') {
      const { Chart, registerables } = await import('chart.js')
      Chart.register(...registerables)
    }
  },
}
