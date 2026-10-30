// Stands in for `#imports` / `#app`, so the real Nuxt `.vue` components and `useLocaleHead` run
// outside a Nuxt build. The translation side is the real `NuxtI18n`; only the app shell is fake.
import { defineComponent, h, reactive, ref } from 'vue'

export const app: Record<string, unknown> = {}

export const route = reactive({
  path: '/en/page',
  fullPath: '/en/page',
  name: 'page',
  params: {} as Record<string, unknown>,
  query: {} as Record<string, unknown>,
  hash: '',
  matched: [{}] as unknown[],
})

export const useNuxtApp = () => app
export const useRoute = () => route
export const useState = () => ref(null)

/** A router under `app.baseURL`: tests set the base, as the real one takes it from the config. */
export const routerBase = { value: '' }
export const useRouter = () => ({ resolve: (path: string) => ({ href: `${routerBase.value}${path}` }) })

/** What a plain `<NuxtLink>` puts in the DOM: an anchor to `to`. */
export const NuxtLink = defineComponent({
  name: 'NuxtLink',
  props: { to: { type: [String, Object], default: undefined } },
  setup: (props, { slots }) => {
    return () => h('a', { href: props.to as string }, slots.default?.())
  },
})
