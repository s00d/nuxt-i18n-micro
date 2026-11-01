<script setup lang="ts">
// Everything the module knows, in this build and on this request: what the server rendered next to what the client
// holds now, the head as the document has it, every dictionary fetch and navigation since the page opened.
import { translationStorage } from '../../src/runtime/utils/storage'

const route = useRoute()
const router = useRouter()
const { $t, $has, $getLocale, $getLocaleName, $defaultLocale, $getRouteName, $getLocales, $getI18nConfig, $localePath, $switchLocalePath } = useNuxtApp()

const keysOf = (locale: string, page: string) => {
  const chunk = translationStorage.getFromCache(locale, page)
  return chunk ? Object.keys(chunk.data).length : null
}

const snapshot = () => {
  const locale = $getLocale()
  const page = $getRouteName()
  const switched = Object.fromEntries($getLocales().map(({ code }) => [`switch ${code}`, $switchLocalePath(code)]))
  return {
    locale,
    'locale name': $getLocaleName() ?? null,
    'default locale': $defaultLocale() ?? null,
    'route name': String(route.name),
    'i18n route name': page,
    path: route.fullPath,
    'page keys in cache': keysOf(locale, page),
    'root keys in cache': keysOf(locale, '__root'),
    'localePath /about': $localePath('/about'),
    ...switched,
  } as Record<string, unknown>
}

const { data: server } = await useFetch('/api/bench/debug', {
  key: 'bench-debug',
  headers: useRequestHeaders(['host', 'accept-language', 'cookie', 'x-forwarded-host', 'x-forwarded-proto']),
})

// the page render's own context: `server` above is the context of the API request, which has no locale of its own
const pageContext = useState('bench-debug-context', () => {
  const { locale, translations, loadsRemote } = (useRequestEvent()?.context.i18n ?? {}) as Record<string, any>
  return { locale, preloadedKeys: Object.keys(translations ?? {}).length, loadsRemote: Boolean(loadsRemote) }
})

const rendered = useState('bench-debug-rendered', snapshot)
const hydrated = ref(false)
const now = shallowRef(rendered.value)
const refresh = () => (now.value = snapshot())

const rows = computed(() =>
  Object.keys({ ...rendered.value, ...now.value }).map((name) => {
    const [before, after] = [rendered.value[name], now.value[name]]
    return { name, before, after, same: JSON.stringify(before) === JSON.stringify(after) }
  }),
)

const config = computed(() => {
  const { locales, ...rest } = $getI18nConfig() as unknown as Record<string, unknown>
  return { ...rest, locales: (locales as { code: string }[] | undefined)?.map(({ code }) => code) }
})

interface HeadReading {
  lang: string
  dir: string
  canonical: string | null
  alternates: string[]
  preloads: string[]
  ogLocale: string | null
}
const head = shallowRef<HeadReading | null>(null)
const readHead = () => {
  const attr = (selector: string, name: string) => document.querySelector(selector)?.getAttribute(name) ?? null
  const all = (selector: string) => [...document.querySelectorAll<HTMLLinkElement>(selector)]
  head.value = {
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    canonical: attr('link[rel="canonical"]', 'href'),
    alternates: all('link[rel="alternate"]').map((link) => `${link.hreflang} ${link.getAttribute('href')}`),
    preloads: all('link[rel="preload"][as="fetch"]').map((link) => link.getAttribute('href') ?? ''),
    ogLocale: attr('meta[property="og:locale"]', 'content'),
  }
}

// a state, not a ref: /debug and /de/debug are two records, so a switch mounts this page anew
const log = useState<string[]>('bench-debug-log', () => [])
const write = (line: string) => log.value.unshift(`${Math.round(performance.now())} ms  ${line}`)
const fetches = ref<{ name: string; ms: number; bytes: number; from: string }[]>([])
const addFetch = (entry: PerformanceResourceTiming) => {
  if (!entry.name.includes('/_locales/')) return
  const url = new URL(entry.name)
  fetches.value.push({ name: url.pathname, ms: Math.round(entry.duration), bytes: entry.encodedBodySize, from: entry.transferSize ? 'network' : 'cache' })
}

const probeKey = ref('title')
const probe = computed(() => ({ has: $has(probeKey.value), text: $t(probeKey.value) }))

const update = () => {
  refresh()
  readHead()
}

let stopWatching = () => {}
onMounted(() => {
  hydrated.value = true
  update()
  const before = router.beforeEach((to, from) => write(`before ${from.fullPath} -> ${to.fullPath}`))
  const after = router.afterEach((to, _from, failure) => {
    write(`after ${to.fullPath}${failure ? ` failed: ${failure.message}` : ''} locale ${$getLocale()}`)
    nextTick(update)
  })
  const observer = new PerformanceObserver((list) => list.getEntries().forEach((entry) => addFetch(entry as PerformanceResourceTiming)))
  observer.observe({ type: 'resource', buffered: true })
  stopWatching = () => {
    before()
    after()
    observer.disconnect()
  }
})
onBeforeUnmount(() => stopWatching())
</script>

<template>
  <BenchPage name="debug">
    <R id="debug-hydrated" :v="hydrated" />
    <R id="debug-variant" :v="server?.variant" />
    <R id="debug-different" :v="rows.filter((row) => !row.same).map((row) => row.name)" />
    <button data-testid="debug-refresh" @click="update">read again</button>

    <h2>Server render, client now</h2>
    <table data-testid="debug-state">
      <thead>
        <tr>
          <th>reading</th>
          <th>server render</th>
          <th>client now</th>
          <th>same</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.name" :data-testid="`debug-row-${row.name}`">
          <td>{{ row.name }}</td>
          <td>{{ row.before }}</td>
          <td>{{ row.after }}</td>
          <td>{{ row.same ? 'yes' : 'NO' }}</td>
        </tr>
      </tbody>
    </table>

    <h2>The page render on the server</h2>
    <pre data-testid="debug-context">{{ pageContext }}</pre>

    <h2>An API request from it</h2>
    <pre data-testid="debug-server">{{ server }}</pre>

    <h2>Head in the document</h2>
    <pre data-testid="debug-head">{{ head }}</pre>

    <h2>Dictionary fetches</h2>
    <table data-testid="debug-fetches">
      <tbody>
        <tr v-for="(entry, index) in fetches" :key="index">
          <td>{{ entry.name }}</td>
          <td>{{ entry.ms }} ms</td>
          <td>{{ entry.bytes }} B</td>
          <td>{{ entry.from }}</td>
        </tr>
      </tbody>
    </table>

    <h2>Navigations</h2>
    <pre data-testid="debug-log">{{ log.join('\n') }}</pre>

    <h2>A key</h2>
    <input v-model="probeKey" data-testid="debug-key" />
    <pre data-testid="debug-probe">{{ probe }}</pre>

    <h2>Resolved config</h2>
    <pre data-testid="debug-config">{{ config }}</pre>
  </BenchPage>
</template>
