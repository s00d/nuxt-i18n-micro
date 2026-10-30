import DefaultTheme from 'vitepress/theme'
import 'vitepress-plugin-chartjs/style.css'
import 'vitepress-plugin-folder-tree/style.css'
import { redirectTarget } from '../redirects'
import './custom.css'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  async enhanceApp({ router, siteData }) {
    // Only load on client (SSR-safe)
    if (typeof window === 'undefined') return

    // Old URLs: a stub page redirects in production; this covers the dev server's 404
    // and links inside the SPA (news entries keep their original links).
    const base = siteData.value.base
    const initial = redirectTarget(window.location.href, base)
    if (initial) window.location.replace(initial)

    const previous = router.onBeforeRouteChange
    router.onBeforeRouteChange = async (to) => {
      if ((await previous?.(to)) === false) return false
      const target = redirectTarget(to, base)
      if (!target) return
      await router.go(target)
      return false
    }

    const { Chart, registerables } = await import('chart.js')
    Chart.register(...registerables)
  },
}
