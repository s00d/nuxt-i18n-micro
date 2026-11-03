import { addPlugin, createResolver, defineNuxtModule, extendPages } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'hello',
  },
  setup() {
    const { resolve } = createResolver(import.meta.url)

    addPlugin({
      src: resolve('./plugins/extend_locales'),
    })

    extendPages((pages) => {
      pages.push({
        name: 'Test',
        path: '/test',
        file: resolve('./pages/test.vue'),
      })
    })
  },
})
