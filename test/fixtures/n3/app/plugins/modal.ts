import { createVfm } from 'vue-final-modal'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin({
  name: 'modal',
  parallel: true,
  setup(nuxtApp) {
    const vfm = createVfm()
    nuxtApp.vueApp.use(vfm)
  },
})
