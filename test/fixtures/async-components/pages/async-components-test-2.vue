<template>
  <div class="async-components-test-2">
    <h1>{{ $t('async-components-test-2::title') }}</h1>
    <p>{{ $t('async-components-test-2::description') }}</p>

    <!-- Навигация -->
    <div class="navigation">
      <i18n-link
        to="/async-components-test"
        class="nav-link"
      >
        {{ $t('async-components-test-2::navigation.backToTest1') }}
      </i18n-link>
      <i18n-link
        to="/"
        class="nav-link"
      >
        {{ $t('async-components-test-2::navigation.backToHome') }}
      </i18n-link>
    </div>

    <!-- Тест 6: Отложенный асинхронный компонент -->
    <div
      id="test6"
      class="test-section"
    >
      <h2>{{ $t('async-components-test-2::test6.title') }}</h2>
      <p>{{ $t('async-components-test-2::test6.description') }}</p>
      <DelayedAsyncComponent />
    </div>

    <!-- Тест 7: Условный асинхронный компонент -->
    <div
      id="test7"
      class="test-section"
    >
      <h2>{{ $t('async-components-test-2::test7.title') }}</h2>
      <p>{{ $t('async-components-test-2::test7.description') }}</p>
      <div class="controls">
        <button
          id="toggle-conditional-btn"
          class="toggle-button"
          @click="toggleConditionalComponent"
        >
          {{ showConditional ? $t('async-components-test-2::test7.hideComponent') : $t('async-components-test-2::test7.showComponent') }}
        </button>
      </div>
      <div
        v-if="showConditional"
        id="conditional-component-container"
      >
        <ConditionalAsyncComponent />
      </div>
    </div>

    <!-- Тест 8: Множественные асинхронные компоненты -->
    <div
      id="test8"
      class="test-section"
    >
      <h2>{{ $t('async-components-test-2::test8.title') }}</h2>
      <p>{{ $t('async-components-test-2::test8.description') }}</p>
      <div class="multiple-components">
        <MultipleAsyncComponent1 />
        <MultipleAsyncComponent2 />
        <MultipleAsyncComponent3 />
      </div>
    </div>

    <!-- Результаты тестов -->
    <div
      id="test-results"
      class="test-results"
    >
      <h2>{{ $t('async-components-test-2::results.title') }}</h2>
      <div class="result-item">
        <span>{{ $t('async-components-test-2::results.currentLocale') }}:</span>
        <strong id="current-locale">{{ $getLocale() }}</strong>
      </div>
      <div class="result-item">
        <span>{{ $t('async-components-test-2::results.routeName') }}:</span>
        <strong id="route-name">{{ $getRouteName() }}</strong>
      </div>
      <div class="result-item">
        <span>{{ $t('async-components-test-2::results.translationsLoaded') }}:</span>
        <strong id="translations-loaded">{{ translationsLoaded ? $t('async-components-test-2::results.yes') : $t('async-components-test-2::results.no') }}</strong>
      </div>
    </div>

    <!-- Переключатель языка -->
    <div
      id="language-switcher"
      class="language-switcher"
    >
      <h3>{{ $t('async-components-test-2::switchLanguage') }}</h3>
      <div class="switcher-buttons">
        <button
          v-for="locale in availableLocales"
          :id="`locale-${locale.code}`"
          :key="locale.code"
          :class="{ active: $getLocale() === locale.code }"
          class="locale-button"
          @click="switchToLocale(locale.code)"
        >
          {{ locale.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from 'vue'
import { useNuxtApp } from '#imports'

definePageMeta({ ssr: false })

const DelayedAsyncComponent = defineAsyncComponent(() => import('../components/test/DelayedAsyncComponent.vue'))
const ConditionalAsyncComponent = defineAsyncComponent(() => import('../components/test/ConditionalAsyncComponent.vue'))
const MultipleAsyncComponent1 = defineAsyncComponent(() => import('../components/test/MultipleAsyncComponent1.vue'))
const MultipleAsyncComponent2 = defineAsyncComponent(() => import('../components/test/MultipleAsyncComponent2.vue'))
const MultipleAsyncComponent3 = defineAsyncComponent(() => import('../components/test/MultipleAsyncComponent3.vue'))

const { $defineI18nRoute, $getLocale, $getRouteName, $switchLocale, $t } = useNuxtApp()

$defineI18nRoute({
  locales: {
    en: {
      'async-components-test-2::title': 'Async Components Test 2',
      'async-components-test-2::description': 'Additional tests for async components with i18n translations',
      'async-components-test-2::navigation.backToTest1': 'Back to Test 1',
      'async-components-test-2::navigation.backToHome': 'Back to Home',
      'async-components-test-2::test6.title': 'Test 6: Delayed Async Component',
      'async-components-test-2::test6.description': 'Async component with artificial delay to test loading states',
      'async-components-test-2::test7.title': 'Test 7: Conditional Async Component',
      'async-components-test-2::test7.description': 'Async component that loads conditionally',
      'async-components-test-2::test7.showComponent': 'Show Component',
      'async-components-test-2::test7.hideComponent': 'Hide Component',
      'async-components-test-2::test8.title': 'Test 8: Multiple Async Components',
      'async-components-test-2::test8.description': 'Multiple async components loading simultaneously',
      'async-components-test-2::results.title': 'Test Results',
      'async-components-test-2::results.currentLocale': 'Current Locale',
      'async-components-test-2::results.routeName': 'Route Name',
      'async-components-test-2::results.translationsLoaded': 'Translations Loaded',
      'async-components-test-2::results.yes': 'Yes',
      'async-components-test-2::results.no': 'No',
      'async-components-test-2::switchLanguage': 'Switch Language',
    },
    ru: {
      'async-components-test-2::title': 'Тест Асинхронных Компонентов 2',
      'async-components-test-2::description': 'Дополнительные тесты асинхронных компонентов с переводами i18n',
      'async-components-test-2::navigation.backToTest1': 'Назад к Тесту 1',
      'async-components-test-2::navigation.backToHome': 'Назад на Главную',
      'async-components-test-2::test6.title': 'Тест 6: Отложенный Асинхронный Компонент',
      'async-components-test-2::test6.description': 'Асинхронный компонент с искусственной задержкой для тестирования состояний загрузки',
      'async-components-test-2::test7.title': 'Тест 7: Условный Асинхронный Компонент',
      'async-components-test-2::test7.description': 'Асинхронный компонент, который загружается условно',
      'async-components-test-2::test7.showComponent': 'Показать Компонент',
      'async-components-test-2::test7.hideComponent': 'Скрыть Компонент',
      'async-components-test-2::test8.title': 'Тест 8: Множественные Асинхронные Компоненты',
      'async-components-test-2::test8.description': 'Множественные асинхронные компоненты, загружающиеся одновременно',
      'async-components-test-2::results.title': 'Результаты Тестов',
      'async-components-test-2::results.currentLocale': 'Текущая Локаль',
      'async-components-test-2::results.routeName': 'Имя Маршрута',
      'async-components-test-2::results.translationsLoaded': 'Переводы Загружены',
      'async-components-test-2::results.yes': 'Да',
      'async-components-test-2::results.no': 'Нет',
      'async-components-test-2::switchLanguage': 'Переключить Язык',
    },
    de: {
      'async-components-test-2::title': 'Async-Komponenten Test 2',
      'async-components-test-2::description': 'Zusätzliche Tests für Async-Komponenten mit i18n-Übersetzungen',
      'async-components-test-2::navigation.backToTest1': 'Zurück zu Test 1',
      'async-components-test-2::navigation.backToHome': 'Zurück zur Startseite',
      'async-components-test-2::test6.title': 'Test 6: Verzögerte Async-Komponente',
      'async-components-test-2::test6.description': 'Async-Komponente mit künstlicher Verzögerung zum Testen von Ladezuständen',
      'async-components-test-2::test7.title': 'Test 7: Bedingte Async-Komponente',
      'async-components-test-2::test7.description': 'Async-Komponente, die bedingt geladen wird',
      'async-components-test-2::test7.showComponent': 'Komponente Anzeigen',
      'async-components-test-2::test7.hideComponent': 'Komponente Verstecken',
      'async-components-test-2::test8.title': 'Test 8: Mehrere Async-Komponenten',
      'async-components-test-2::test8.description': 'Mehrere Async-Komponenten, die gleichzeitig geladen werden',
      'async-components-test-2::results.title': 'Testergebnisse',
      'async-components-test-2::results.currentLocale': 'Aktuelle Lokale',
      'async-components-test-2::results.routeName': 'Routenname',
      'async-components-test-2::results.translationsLoaded': 'Übersetzungen Geladen',
      'async-components-test-2::results.yes': 'Ja',
      'async-components-test-2::results.no': 'Nein',
      'async-components-test-2::switchLanguage': 'Sprache Wechseln',
    },
  },
})

// Состояние компонентов
const showConditional = ref(false)
const translationsLoaded = ref(false)

// Доступные локали
const availableLocales = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'de', name: 'Deutsch' },
]

// Функции
const toggleConditionalComponent = () => {
  showConditional.value = !showConditional.value
}

const switchToLocale = async (locale: string) => {
  try {
    await $switchLocale(locale)
    translationsLoaded.value = true
  } catch (error) {
    console.error('Error switching locale:', error)
  }
}

onMounted(() => {
  translationsLoaded.value = true
})
</script>

<style scoped>
.async-components-test-2 {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.navigation {
  margin: 30px 0;
  padding: 20px;
  background: #ecf0f1;
  border-radius: 8px;
  text-align: center;
}

.nav-link {
  display: inline-block;
  margin: 0 10px;
  padding: 10px 20px;
  background: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background 0.3s;
}

.nav-link:hover {
  background: #2980b9;
}

.test-section {
  margin: 30px 0;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
}

.test-section h2 {
  color: #333;
  margin-bottom: 10px;
}

.controls {
  margin: 15px 0;
}

.toggle-button {
  padding: 8px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-button:hover {
  background: #c0392b;
}

.multiple-components {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.test-results {
  margin: 30px 0;
  padding: 20px;
  background: #e8f5e8;
  border-radius: 8px;
}

.result-item {
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
}

.language-switcher {
  margin: 30px 0;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.switcher-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.locale-button {
  padding: 8px 16px;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.locale-button:hover {
  background: #7f8c8d;
}

.locale-button.active {
  background: #27ae60;
}

.locale-button.active:hover {
  background: #229954;
}
</style>
