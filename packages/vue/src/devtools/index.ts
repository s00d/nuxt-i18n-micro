import { addCustomTab, onDevToolsClientConnected } from '@vue/devtools-api'
import { createApp, h, Teleport, ref } from 'vue'
// Импортируем компонент здесь, в контексте основного приложения!
// Это работает, потому что это не внутри строки SFC
import { I18nDevToolsElement } from '@i18n-micro/devtools-ui'
import type { VueI18n } from '../composer'
import type { Locale } from '@i18n-micro/types'
import { createVueBridge } from './bridge/vue-bridge'

export interface VueDevToolsOptions {
  i18n: VueI18n
  locales?: Locale[]
  defaultLocale?: string
  translationDir?: string
}

export function setupVueDevTools(options: VueDevToolsOptions) {
  const { i18n, locales, defaultLocale, translationDir } = options

  // 1. Создаем мост
  const bridge = createVueBridge({
    i18n,
    locales,
    defaultLocale,
    translationDir,
  })

  // 2. Регистрируем Custom Element в основном окне
  // Это критично: браузер должен знать о теге здесь
  if (typeof window !== 'undefined' && !customElements.get('i18n-devtools-ui')) {
    customElements.define('i18n-devtools-ui', I18nDevToolsElement)
  }

  // 3. Создаем механизм Teleport'а
  // targetContainer - это DOM-элемент ВНУТРИ вкладки DevTools
  const targetContainer = ref<HTMLElement | null>(null)

  // Функция, которую вызовет SFC из DevTools, чтобы передать свой контейнер
  const connectHandler = (el: HTMLElement) => {
    targetContainer.value = el
  }

  // Экспортируем функцию глобально, чтобы SFC мог её найти через window.parent
  if (typeof window !== 'undefined') {
    // @ts-expect-error - global property
    window.__I18N_DEVTOOLS_CONNECT__ = connectHandler
  }

  // 4. Запускаем "теневое" Vue приложение для рендеринга UI
  if (typeof document !== 'undefined') {
    const host = document.createElement('div')
    host.id = 'i18n-devtools-host'
    host.style.display = 'none' // Скрываем хост
    document.body.appendChild(host)

    const uiApp = createApp({
      setup() {
        return () => {
          // Если контейнера нет, ничего не рендерим
          if (!targetContainer.value) return null

          // Магия: Teleport переносит DOM-узлы из основного окна в контейнер DevTools (даже если это iframe)
          return h(Teleport, { to: targetContainer.value }, [
            h('i18n-devtools-ui', {
              'class': 'h-full w-full block',
              // ВАЖНО: Точка в начале означает DOM Property.
              // Это передаст объект bridge "как есть", а не как строку.
              '.bridge': bridge,
            }),
          ])
        }
      },
    })
    uiApp.mount(host)
  }

  // 5. Регистрируем вкладку
  onDevToolsClientConnected(() => {
    addCustomTab({
      name: 'i18n-micro',
      title: 'i18n Micro',
      icon: 'language',
      category: 'modules',
      view: {
        type: 'sfc',
        sfc: `
<template>
  <!-- Это контейнер, в который мы будем телепортировать UI -->
  <div ref="container" class="i18n-container">
    <div class="waiting">Waiting for connection...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const container = ref(null)

onMounted(() => {
  // Ищем функцию подключения в родительском окне (так как мы скорее всего в iframe)
  // или в текущем (если overlay)
  const connect = window.parent.__I18N_DEVTOOLS_CONNECT__ || window.__I18N_DEVTOOLS_CONNECT__

  if (connect && container.value) {
    // Очищаем "Waiting..."
    container.value.innerHTML = ''
    // Передаем наш DOM элемент в основное приложение
    connect(container.value)
  } else {
    // Polling на случай, если скрипт в родителе еще не инициализировался
    const interval = setInterval(() => {
      const fn = window.parent.__I18N_DEVTOOLS_CONNECT__ || window.__I18N_DEVTOOLS_CONNECT__
      if (fn && container.value) {
        container.value.innerHTML = ''
        fn(container.value)
        clearInterval(interval)
      }
    }, 500)

    setTimeout(() => clearInterval(interval), 10000)
  }
})
</script>

<style>
.i18n-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: white;
  display: flex;
  flex-direction: column;
}

.waiting {
  padding: 20px;
  color: #888;
  text-align: center;
}
</style>
        `,
      },
    })
  })
}
