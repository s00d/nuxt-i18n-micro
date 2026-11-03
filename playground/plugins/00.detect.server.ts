// BENCH_DETECT=1: custom locale detection, before the i18n plugin.
export default defineNuxtPlugin({
  name: 'bench-detect',
  enforce: 'pre',
  order: -10,
  setup() {
    if (!useRuntimeConfig().public.benchDetect) return
    const wanted = useRequestHeaders(['x-bench-locale'])['x-bench-locale']
    const { setLocale, isValidLocale } = useI18nLocale()
    if (wanted && isValidLocale(wanted)) setLocale(wanted)
  },
})
