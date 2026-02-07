import type { I18nDevToolsBridge, LocaleData, TranslationContent } from '../bridge/interface'
import type { JsonRpcEvent, JsonRpcRequest, JsonRpcResponse } from './types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

/**
 * Creates an RPC client that communicates with parent window via postMessage
 * Used inside the iframe to send requests to the host application
 */
interface PendingRequest {
  resolve: (v: unknown) => void
  reject: (e: Error) => void
}

export function createRpcClient(): I18nDevToolsBridge {
  const pending = new Map<string, PendingRequest>()
  const listeners = new Set<(data: LocaleData) => void>()

  // Listen for responses from parent
  window.addEventListener('message', (event) => {
    const data = event.data as JsonRpcResponse | JsonRpcEvent
    if (!data || data.jsonrpc !== '2.0') return

    // This is a response to a request
    if ('id' in data && data.id && pending.has(data.id)) {
      const pendingItem = pending.get(data.id)
      if (pendingItem) {
        const { resolve, reject } = pendingItem
        pending.delete(data.id)
        if (data.error) {
          reject(new Error(data.error.message))
        } else {
          resolve(data.result)
        }
      }
    }
    // This is an event (update)
    else if ('method' in data && data.method === 'localesUpdate') {
      listeners.forEach((cb) => {
        cb(data.params as LocaleData)
      })
    }
  })

  const request = (method: string, params?: unknown): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      const id = generateId()
      pending.set(id, { resolve, reject })
      const payload: JsonRpcRequest = { jsonrpc: '2.0', id, method, params }
      // Send to parent
      window.parent.postMessage(payload, '*')
    })
  }

  return {
    getLocalesAndTranslations: () => request('getLocalesAndTranslations') as Promise<LocaleData>,
    getConfigs: () => request('getConfigs') as Promise<Record<string, unknown>>,
    saveTranslation: (file: string, content: TranslationContent) => request('saveTranslation', { file, content }) as Promise<void>,
    onLocalesUpdate: (cb: (data: LocaleData) => void) => {
      listeners.add(cb)
      return () => {
        listeners.delete(cb)
      }
    },
  }
}
