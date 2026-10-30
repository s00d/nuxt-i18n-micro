import { createHooks } from 'hookable'
import { describe, expect, test, vi } from 'vitest'
import plugin from '../../src/runtime/plugins/05.hooks'

type Guard = (to: unknown, from: unknown) => unknown

const router = vi.hoisted(() => ({ currentRoute: { value: { path: '/' } }, guards: [] as Guard[], beforeEach: (guard: Guard) => router.guards.push(guard) }))

// every Nuxt path is one stub in unit tests, so one mock answers them all
vi.mock('#imports', () => ({ defineNuxtPlugin: (definition: unknown) => definition, useRouter: () => router }))

async function setup() {
  router.guards.length = 0
  const hooks = createHooks<Record<string, (...args: never[]) => unknown>>()
  const routeName = vi.fn(() => 'index')
  const merge = vi.fn(async () => {})
  const nuxtApp = {
    hooks,
    callHook: hooks.callHook,
    $getI18nConfig: () => ({ strategy: 'prefix' }),
    $getLocale: () => 'en',
    $i18nStrategy: { getPluginRouteName: routeName },
    _i18nMergeTranslation: merge,
  }
  await (plugin as unknown as { setup: (app: typeof nuxtApp) => Promise<void> }).setup(nuxtApp)
  return { hooks, routeName, merge, guard: router.guards[0]! }
}

describe('05.hooks', () => {
  test('nobody subscribed: i18n:register does no work and the guard stays synchronous', async () => {
    const { routeName, guard } = await setup()
    expect(guard({ path: '/a' }, { path: '/' })).toBeUndefined()
    expect(routeName).not.toHaveBeenCalled()
  })

  test('a subscriber that came after setup is called on the next navigation', async () => {
    const { hooks, merge, guard } = await setup()
    hooks.hook('i18n:register', ((register: (translations: unknown) => void, locale: string) => register({ from: locale })) as never)
    await guard({ path: '/a' }, { path: '/' })
    expect(merge).toHaveBeenCalledWith('en', 'index', { from: 'en' })

    // an unchanged path registers nothing
    merge.mockClear()
    await guard({ path: '/a' }, { path: '/a' })
    expect(merge).not.toHaveBeenCalled()
  })

  test('a subscriber from before setup is called while the plugin starts', async () => {
    router.guards.length = 0
    const hooks = createHooks<Record<string, (...args: never[]) => unknown>>()
    const merge = vi.fn(async () => {})
    hooks.hook('i18n:register', ((register: (translations: unknown) => void) => register({ a: 1 })) as never)
    await (plugin as unknown as { setup: (app: unknown) => Promise<void> }).setup({
      hooks,
      callHook: hooks.callHook,
      $getI18nConfig: () => ({ strategy: 'prefix' }),
      $getLocale: () => 'en',
      $i18nStrategy: { getPluginRouteName: () => 'index' },
      _i18nMergeTranslation: merge,
    })
    expect(merge).toHaveBeenCalledWith('en', 'index', { a: 1 })
  })
})
