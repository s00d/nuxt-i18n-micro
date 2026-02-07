import { defineCustomElement } from 'vue'
import App from './App.ce.vue'
import './styles/main.css'

// Define the custom element
// Props are defined in the component itself via defineProps
const I18nDevToolsElement = defineCustomElement(App)

// Export the element class and registration function
export { I18nDevToolsElement }

/**
 * Register the i18n-devtools-ui custom element
 * This should be called once before using the element
 */
export function register() {
  if (!customElements.get('i18n-devtools-ui')) {
    customElements.define('i18n-devtools-ui', I18nDevToolsElement)
  }
}

export type { BridgeAdapter, CreateBridgeOptions } from './bridge/create-bridge'

// Export bridge creation function
export { createBridge } from './bridge/create-bridge'
// Export types for consumers
export type { I18nDevToolsBridge } from './bridge/interface'

// Export RPC utilities
export { createRpcClient } from './rpc/client'
export { setupRpcHost } from './rpc/host'
export type { JsonRpcEvent, JsonRpcRequest, JsonRpcResponse } from './rpc/types'

// Export types from types module
export type {
  JSONValue,
  LocaleData,
  TranslationContent,
  TreeNode,
} from './types'
