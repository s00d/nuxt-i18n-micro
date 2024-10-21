import type { PluginsInjections } from './src/runtime/plugins/01.plugin'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
declare module 'vue/types/vue' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Vue extends PluginsInjections { }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
declare module '@nuxt/types' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface NuxtAppOptions extends PluginsInjections { }
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Context extends PluginsInjections { }
}
