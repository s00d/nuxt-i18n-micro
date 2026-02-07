import type { I18nDevToolsBridge } from '../bridge/interface'
import type { TranslationContent } from '../types'
import type { JsonRpcEvent, JsonRpcRequest, JsonRpcResponse } from './types'

/**
 * Connects an iframe to an existing Bridge.
 * @param iframeWindow - reference to iframe window (contentWindow)
 * @param bridge - local bridge implementation (adapter to Nuxt/Astro RPC)
 * @returns cleanup function
 */
export function setupRpcHost(iframeWindow: Window, bridge: I18nDevToolsBridge): () => void {
  // Message handler from iframe
  const handler = async (event: MessageEvent) => {
    // Important: check source to only respond to our iframe
    if (event.source !== iframeWindow) return

    const data = event.data as JsonRpcRequest
    if (!data || data.jsonrpc !== '2.0' || !data.id) return

    const response: JsonRpcResponse = {
      jsonrpc: '2.0',
      id: data.id,
    }

    try {
      switch (data.method) {
        case 'getLocalesAndTranslations':
          response.result = await bridge.getLocalesAndTranslations()
          break
        case 'getConfigs':
          response.result = await bridge.getConfigs()
          break
        case 'saveTranslation': {
          const params = data.params as { file: string; content: TranslationContent }
          await bridge.saveTranslation(params.file, params.content)
          response.result = true
          break
        }
        default:
          throw new Error(`Method ${data.method} not found`)
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e)
      response.error = { code: -32603, message: errorMessage }
    }

    iframeWindow.postMessage(response, '*')
  }

  window.addEventListener('message', handler)

  // Proxy updates from server to iframe
  const unsubscribe = bridge.onLocalesUpdate((data) => {
    const event: JsonRpcEvent = {
      jsonrpc: '2.0',
      method: 'localesUpdate',
      params: data,
    }
    iframeWindow.postMessage(event, '*')
  })

  // Return cleanup function
  return () => {
    window.removeEventListener('message', handler)
    unsubscribe()
  }
}
