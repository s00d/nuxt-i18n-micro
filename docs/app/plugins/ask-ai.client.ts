/**
 * Mintlify "Ask AI" assistant (https://widget.mintlify.com/v1/embed.js).
 *
 * A plugin, not a component: the widget mounts its own closed shadow root on `<body>`, so nothing
 * of it lives in Vue's tree. It loads once per page session after hydration (`onNuxtReady`), never
 * re-inits on client navigation, and is a fixed overlay, so it shifts no layout.
 */
interface MintlifyAssistantOptions {
  id?: string
  appearance?: { theme?: 'light' | 'dark'; accent?: string; logo?: string }
  labels?: { title?: string; trigger?: string; placeholder?: string; suggestions?: string }
  starterQuestions?: string[]
}

interface MintlifyAssistantApi {
  init: (opts: MintlifyAssistantOptions) => Promise<void>
  update: (opts: MintlifyAssistantOptions) => Promise<void>
}

declare global {
  interface Window {
    MintlifyAssistant?: MintlifyAssistantApi
  }
}

const EMBED_SRC = 'https://widget.mintlify.com/v1/embed.js'

function loadEmbed(): Promise<MintlifyAssistantApi | undefined> {
  if (window.MintlifyAssistant) return Promise.resolve(window.MintlifyAssistant)
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.type = 'module'
    script.src = EMBED_SRC
    script.onload = () => resolve(window.MintlifyAssistant)
    // Offline or blocked by an extension: the docs work without the assistant.
    script.onerror = () => resolve(undefined)
    document.head.appendChild(script)
  })
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const id = config.public.mintlifyAssistantId
  if (!id) return

  const colorMode = useColorMode()
  const theme = () => (colorMode.value === 'dark' ? 'dark' : 'light')
  const logo = new URL(`${config.app.baseURL.replace(/\/?$/, '/')}favicon.svg`, window.location.origin).href

  onNuxtReady(async () => {
    const assistant = await loadEmbed()
    if (!assistant) return
    try {
      await assistant.init({
        id: String(id),
        appearance: { theme: theme(), accent: '#32ba8c', logo },
        labels: {
          title: 'Ask AI',
          trigger: 'Ask AI',
          placeholder: 'Ask about Nuxt I18n Micro…',
          suggestions: 'Try asking',
        },
        starterQuestions: ['How do I install nuxt-i18n-micro?', 'Which routing strategy should I use?', 'How do page-level translations work?'],
      })
    } catch {
      // The widget refuses origins it is not configured for (e.g. localhost): no assistant then.
      return
    }
    watch(theme, (next) => void assistant.update({ appearance: { theme: next } }).catch(() => undefined))
  })
})
