// Every dictionary the browser fetched, for /data-loading and for scripts (window.__benchChunks).
export default defineNuxtPlugin(() => {
  const chunks = useState<string[]>('bench-chunks', () => [])
  const { apiBaseUrl } = useNuxtApp().$getI18nConfig()
  const seen: string[] = ((window as unknown as { __benchChunks: string[] }).__benchChunks = [])
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.name.includes(`/${apiBaseUrl}/`)) continue
      const url = new URL(entry.name)
      seen.push(url.pathname + url.search)
    }
    chunks.value = [...seen]
  }).observe({ type: 'resource', buffered: true })
})
