import { redirectTarget } from '../../redirects'

export default defineNuxtRouteMiddleware((to) => {
  const base = useRuntimeConfig().app.baseURL || '/'
  const target = redirectTarget(to.fullPath, base)
  if (!target) return
  return navigateTo(target, { redirectCode: 301, external: target.includes('://') })
})
