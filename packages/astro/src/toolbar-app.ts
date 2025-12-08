import { defineToolbarApp } from 'astro/toolbar'
import type { ToolbarServerHelpers } from 'astro'
import type { I18nDevToolsBridge } from '@i18n-micro/devtools-ui'
import { createAstroBridge } from './bridge/astro-bridge'

interface AdaptedServer {
  send: (event: string, data?: unknown) => void
  on: (event: string, callback: (data: unknown) => void) => void
  off: (event: string, callback: (data: unknown) => void) => void
}

interface ElementWithBridge extends HTMLElement {
  bridge: I18nDevToolsBridge
}

interface ToolbarApp extends EventTarget {
  toggleState(options: { state: boolean }): void
  onToggled(callback: (options: { state: boolean }) => void): void
}

export default defineToolbarApp({
  async init(canvas: ShadowRoot, app: ToolbarApp, server: ToolbarServerHelpers) {
    if (typeof customElements === 'undefined') {
      return
    }

    // УБРАНО: app.toggleState({ state: false })
    // Astro сам запоминает состояние. Если мы форсируем false, мы ломаем UX.

    const { register } = await import('@i18n-micro/devtools-ui')
    register()

    const handlers = new Map<string, Set<(data: unknown) => void>>()

    const adaptedServer: AdaptedServer = {
      send: (event: string, data?: unknown) => {
        console.log('[i18n-adapted] Sending event:', event, 'with data:', data ? (typeof data === 'object' ? Object.keys(data as Record<string, unknown>).length + ' keys' : data) : 'no data')
        server.send(event, data)
      },
      on: (event: string, callback: (data: unknown) => void) => {
        if (!handlers.has(event)) {
          handlers.set(event, new Set())
        }
        handlers.get(event)?.add(callback)
        const wrappedCallback = (data: unknown) => {
          console.log('[i18n-adapted] Received event:', event, 'with data:', data ? (typeof data === 'object' ? Object.keys(data as Record<string, unknown>).length + ' keys' : data) : 'no data')
          callback(data)
        }
        server.on(event, wrappedCallback)
      },
      off: (_event: string, _callback: (data: unknown) => void) => {
        // Astro toolbar helper limitation
      },
    }
    const bridge = createAstroBridge(adaptedServer)

    const element = document.createElement('i18n-devtools-ui') as ElementWithBridge
    element.bridge = bridge

    // Устанавливаем размеры, но НЕ трогаем display!
    const canvasHost = canvas.host as HTMLElement
    if (canvasHost) {
      canvasHost.style.width = '100%'
      canvasHost.style.height = '100%'
      // УБРАНО: canvasHost.style.display = 'block'

      // Добавляем position: absolute, чтобы окно перекрывало контент, а не сдвигало его
      canvasHost.style.position = 'absolute'
      canvasHost.style.top = '0'
      canvasHost.style.left = '0'
      // Z-index обычно управляется Astro, но можно подстраховаться
    }

    // Стили для самого элемента
    element.style.width = '100%'
    element.style.height = '100%'
    // Здесь display: block нужен, так как custom elements по умолчанию display: inline
    element.style.display = 'block'

    canvas.appendChild(element)

    app.onToggled(({ state }) => {
      if (state) {
        // App opened
        console.log('[i18n] DevTools opened')
      }
    })
  },
})
