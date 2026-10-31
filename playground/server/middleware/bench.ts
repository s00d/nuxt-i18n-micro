export default defineEventHandler((event) => {
  if (event.path.startsWith('/_') || event.path.startsWith('/__')) return
  setResponseHeader(event, 'x-bench-locale', useLocaleServerMiddleware(event).current)
})
