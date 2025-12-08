<template>
  <div
    id="app"
    ref="appContainer"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
import { register } from '@i18n-micro/devtools-ui'
import type { I18nDevToolsBridge } from '@i18n-micro/devtools-ui'
import { createNuxtBridge } from './bridge/nuxt-bridge'

interface I18nDevToolsElement extends HTMLElement {
  bridge: I18nDevToolsBridge
}

// Register the custom element
register()

const appContainer = ref<HTMLElement | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let devToolsClient: any = null

const mountDevTools = async () => {
  if (!devToolsClient) return

  // Wait for DOM to be ready
  await nextTick()

  // Get the app container
  const container = appContainer.value || document.getElementById('app')
  if (!container) {
    console.error('App container not found')
    return
  }

  // Create Nuxt bridge
  const bridge = createNuxtBridge(devToolsClient)
  console.log('[i18n-devtools] Bridge created:', bridge)

  // Create and mount the custom element
  const element = document.createElement('i18n-devtools-ui') as I18nDevToolsElement
  // Set bridge as property (not attribute, as it's an object)
  element.bridge = bridge
  console.log('[i18n-devtools] Custom element created and bridge set:', { element, bridge: element.bridge })

  // Clear container and append element
  container.innerHTML = ''
  container.appendChild(element)
  console.log('[i18n-devtools] Custom element mounted')
}

onDevtoolsClientConnected(async (client) => {
  devToolsClient = client
  await mountDevTools()
})

// Mount on component mount as well (in case client is already connected)
onMounted(async () => {
  if (devToolsClient) {
    await mountDevTools()
  }
})
</script>
