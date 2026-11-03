/**
 * Mintlify "Ask AI" assistant widget (https://www.mintlify.com/docs/assistant/widget).
 *
 * A plugin, not a component: the widget mounts its own closed shadow root on `<body>`, so nothing
 * of it lives in Vue's tree. The hosted loader is added once after hydration (`onNuxtReady`), the
 * widget is initialised once and never again on client navigation, and it is a fixed overlay, so it
 * shifts no layout. The colour mode follows the site through `update()`.
 */
type WidgetTheme = 'light' | 'dark' | 'system'

interface MintlifyAssistantConfig {
  id: string
  defaultOpen?: boolean
  appearance?: {
    variant?: 'widget' | 'modal' | 'panel'
    theme?: WidgetTheme
    accent?: string
    radius?: string
    font?: string
    side?: 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end'
    align?: 'start' | 'center' | 'end'
    logo?: string | { light: string; dark: string }
    zIndex?: number
  }
  labels?: { title?: string; trigger?: string; placeholder?: string; disclaimer?: string | false; suggestions?: string }
  starterQuestions?: string[]
  hooks?: {
    event?: (event: { type: string; source?: string }) => void
    error?: (error: { code: string; retryable: boolean; status?: number }) => void
  }
}

interface MintlifyAssistantApi {
  init: (config: MintlifyAssistantConfig) => Promise<void>
  update: (config: Partial<Omit<MintlifyAssistantConfig, 'id'>>) => Promise<void>
  open: (options?: { source?: string; focus?: boolean }) => Promise<void>
  close: () => Promise<void>
  ask: (question: string, options?: { source?: string; open?: boolean; focus?: boolean }) => Promise<void>
  reset: () => Promise<void>
  destroy: () => Promise<void>
}

declare global {
  interface Window {
    MintlifyAssistant?: MintlifyAssistantApi
  }
}

/** The hosted loader from the dashboard's embed code. It always serves the current widget build. */
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
  const theme = (): WidgetTheme => (colorMode.value === 'dark' ? 'dark' : 'light')
  const logo = new URL(`${config.app.baseURL.replace(/\/?$/, '/')}favicon.svg`, window.location.origin).href

  onNuxtReady(async () => {
    const assistant = await loadEmbed()
    if (!assistant) return
    await assistant
      .init({
        id: String(id),
        appearance: {
          theme: theme(),
          accent: '#32ba8c',
          radius: '10px',
          // the site's own font, already loaded; the widget otherwise bundles Inter
          font: '"Public Sans", ui-sans-serif, system-ui, sans-serif',
          side: 'bottom',
          align: 'end',
          logo,
          // above the docs header and the search modal's backdrop
          zIndex: 60,
        },
        labels: {
          title: 'Ask AI',
          trigger: 'Ask AI',
          placeholder: 'Ask about Nuxt I18n Micro…',
          suggestions: 'Try asking',
        },
        starterQuestions: ['How do I install nuxt-i18n-micro?', 'Which routing strategy should I use?', 'How do I upgrade from v3?'],
        hooks: {
          // e.g. an origin the widget is not allowed on (localhost): the docs simply have no assistant
          error: (error) => console.warn(`[ask-ai] ${error.code}${error.status ? ` (${error.status})` : ''}`),
        },
      })
      .then(() => watch(theme, (next) => void assistant.update({ appearance: { theme: next } }).catch(() => undefined)))
      .catch(() => undefined)
  })
})
