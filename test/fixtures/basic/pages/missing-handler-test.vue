<template>
  <div>
    <div id="missing-key">
      {{ $t('non-existent-key') }}
    </div>
    <div id="handler-status">
      {{ handlerStatus }}
    </div>
    <button
      id="set-handler"
      @click="setHandler"
    >
      Set Handler
    </button>
    <button
      id="remove-handler"
      @click="removeHandler"
    >
      Remove Handler
    </button>
    <div id="console-warnings">
      {{ consoleWarnings.length }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#imports'

const { $t, $setMissingHandler } = useNuxtApp()

const handlerStatus = ref('No handler')
const consoleWarnings = ref([])

// Intercept console.warn
if (import.meta.client) {
  const originalWarn = console.warn
  console.warn = (...args) => {
    consoleWarnings.value.push(args.join(' '))
    originalWarn.apply(console, args)
  }
}

const setHandler = () => {
  $setMissingHandler((locale, key, routeName) => {
    handlerStatus.value = `Handler called: ${locale}, ${key}, ${routeName}`
  })
}

const removeHandler = () => {
  $setMissingHandler(null)
  handlerStatus.value = 'Handler removed'
}

// Trigger missing translation on mount
onMounted(() => {
  $t('another-missing-key')
})
</script>
