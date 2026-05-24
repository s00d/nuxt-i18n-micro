export function shouldLocalizeRouteRulePath(originalPath: string): boolean {
  const routeRulePath = originalPath.trim()
  if (!routeRulePath) return true

  const path = routeRulePath.startsWith('/') ? routeRulePath : `/${routeRulePath}`
  if (path === '/api' || path.startsWith('/api/')) return false

  const firstSegment = path.replace(/^\/+/, '').split('/')[0] ?? ''
  return !firstSegment.startsWith('_')
}
