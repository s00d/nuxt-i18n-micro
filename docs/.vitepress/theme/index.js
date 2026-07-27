import DefaultTheme from 'vitepress/theme'
import MethodsTable from './components/MethodsTable.vue'
import OptionsTable from './components/OptionsTable.vue'
import PropsTable from './components/PropsTable.vue'
import SymbolDoc from './components/SymbolDoc.vue'
import 'vitepress-plugin-chartjs/style.css'
import 'vitepress-plugin-folder-tree/style.css'
import './custom.css'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  async enhanceApp({ app }) {
    // Registered globally so a page needs one tag, not a script block, to show a
    // reference table that comes from the source.
    app.component('PropsTable', PropsTable)
    app.component('SymbolDoc', SymbolDoc)
    app.component('MethodsTable', MethodsTable)
    app.component('OptionsTable', OptionsTable)

    // Only load on client (SSR-safe)
    if (typeof window !== 'undefined') {
      const { Chart, registerables } = await import('chart.js')
      Chart.register(...registerables)
    }
  },
}
