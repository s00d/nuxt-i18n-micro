<template>
  <div class="async-components-test">
    <h1>{{ $t('async-components-test::title') }}</h1>
    <p>{{ $t('async-components-test::description') }}</p>

    <!-- Навигация -->
    <div class="navigation">
      <i18n-link
        to="/async-components-test-2"
        class="nav-link"
      >
        {{ $t('async-components-test::navigation.goToTest2') }}
      </i18n-link>
      <i18n-link
        to="/"
        class="nav-link"
      >
        {{ $t('async-components-test::navigation.backToHome') }}
      </i18n-link>
    </div>

    <!-- Тест 1: Простой асинхронный компонент -->
    <div
      id="test1"
      class="test-section"
    >
      <h2>{{ $t('async-components-test::test1.title') }}</h2>
      <p>{{ $t('async-components-test::test1.description') }}</p>
      <SimpleAsyncComponent />
    </div>

    <!-- Тест 2: Асинхронный компонент с переводами -->
    <div
      id="test2"
      class="test-section"
    >
      <h2>{{ $t('async-components-test::test2.title') }}</h2>
      <p>{{ $t('async-components-test::test2.description') }}</p>
      <AsyncComponentWithTranslations />
    </div>

    <!-- Тест 3: Асинхронный компонент с defineI18nRoute -->
    <div
      id="test3"
      class="test-section"
    >
      <h2>{{ $t('async-components-test::test3.title') }}</h2>
      <p>{{ $t('async-components-test::test3.description') }}</p>
      <AsyncComponentWithI18nRoute />
    </div>

    <!-- Тест 4: Динамический асинхронный компонент -->
    <div
      id="test4"
      class="test-section"
    >
      <h2>{{ $t('async-components-test::test4.title') }}</h2>
      <p>{{ $t('async-components-test::test4.description') }}</p>
      <div class="controls">
        <button
          id="load-dynamic-btn"
          :disabled="isLoading"
          @click="loadDynamicComponent"
        >
          {{ $t('async-components-test::test4.loadButton') }}
        </button>
      </div>
      <div
        v-if="showDynamicComponent && DynamicComponent"
        id="dynamic-component-container"
      >
        <component :is="DynamicComponent" />
      </div>
    </div>

    <!-- Тест 5: Асинхронный компонент с ошибкой -->
    <div
      id="test5"
      class="test-section"
    >
      <h2>{{ $t('async-components-test::test5.title') }}</h2>
      <p>{{ $t('async-components-test::test5.description') }}</p>
      <AsyncComponentWithError />
    </div>

    <!-- Результаты тестов -->
    <div
      id="test-results"
      class="test-results"
    >
      <h2>{{ $t('async-components-test::results.title') }}</h2>
      <div class="result-item">
        <span>{{ $t('async-components-test::results.currentLocale') }}:</span>
        <strong id="current-locale">{{ $getLocale() }}</strong>
      </div>
      <div class="result-item">
        <span>{{ $t('async-components-test::results.routeName') }}:</span>
        <strong id="route-name">{{ $getRouteName() }}</strong>
      </div>
      <div class="result-item">
        <span>{{ $t('async-components-test::results.translationsLoaded') }}:</span>
        <strong id="translations-loaded">{{ translationsLoaded ? $t('async-components-test::results.yes') : $t('async-components-test::results.no') }}</strong>
      </div>
    </div>

    <!-- Переключатель языка -->
    <div
      id="language-switcher"
      class="language-switcher"
    >
      <h3>{{ $t('async-components-test::switchLanguage') }}</h3>
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
import { ref, defineAsyncComponent, nextTick, onMounted } from 'vue'
import { useNuxtApp } from '#imports'

// Отключаем SSR для этой страницы, чтобы избежать проблем с гидратацией асинхронных компонентов
definePageMeta({
  ssr: false,
})

// Импортируем асинхронные компоненты
const SimpleAsyncComponent = defineAsyncComponent(() =>
  import('../components/test/SimpleAsyncComponent.vue'),
)

const AsyncComponentWithTranslations = defineAsyncComponent(() =>
  import('../components/test/AsyncComponentWithTranslations.vue'),
)

const AsyncComponentWithI18nRoute = defineAsyncComponent(() =>
  import('../components/test/AsyncComponentWithI18nRoute.vue'),
)

const AsyncComponentWithError = defineAsyncComponent(() =>
  import('../components/test/AsyncComponentWithError.vue'),
)

const { $defineI18nRoute, $getLocale, $getRouteName, $switchLocale, $t } = useNuxtApp()

// Определяем переводы для этой страницы
$defineI18nRoute({
  locales: {
    en: {
      'async-components-test::title': 'Async Components Test',
      'async-components-test::description': 'Testing async components with i18n translations',
      'async-components-test::navigation.goToTest2': 'Go to Test 2',
      'async-components-test::navigation.backToHome': 'Back to Home',
      'async-components-test::test1.title': 'Test 1: Simple Async Component',
      'async-components-test::test1.description': 'Basic async component without translations',
      'async-components-test::test2.title': 'Test 2: Async Component with Translations',
      'async-components-test::test2.description': 'Async component that should load its own translations',
      'async-components-test::test3.title': 'Test 3: Async Component with defineI18nRoute',
      'async-components-test::test3.description': 'Async component using defineI18nRoute function',
      'async-components-test::test4.title': 'Test 4: Dynamic Async Component',
      'async-components-test::test4.description': 'Dynamically loaded async component',
      'async-components-test::test4.loadButton': 'Load Dynamic Component',
      'async-components-test::test5.title': 'Test 5: Async Component with Error',
      'async-components-test::test5.description': 'Async component that throws an error',
      'async-components-test::test5.error': 'Error loading component',
      'async-components-test::results.title': 'Test Results',
      'async-components-test::results.currentLocale': 'Current Locale',
      'async-components-test::results.routeName': 'Route Name',
      'async-components-test::results.translationsLoaded': 'Translations Loaded',
      'async-components-test::results.yes': 'Yes',
      'async-components-test::results.no': 'No',
      'async-components-test::loading': 'Loading...',
      'async-components-test::switchLanguage': 'Switch Language',
    },
    ru: {
      'async-components-test::title': 'Тест Асинхронных Компонентов',
      'async-components-test::description': 'Тестирование асинхронных компонентов с переводами i18n',
      'async-components-test::navigation.goToTest2': 'Перейти к Тесту 2',
      'async-components-test::navigation.backToHome': 'Назад на Главную',
      'async-components-test::test1.title': 'Тест 1: Простой Асинхронный Компонент',
      'async-components-test::test1.description': 'Базовый асинхронный компонент без переводов',
      'async-components-test::test2.title': 'Тест 2: Асинхронный Компонент с Переводами',
      'async-components-test::test2.description': 'Асинхронный компонент, который должен загружать свои переводы',
      'async-components-test::test3.title': 'Тест 3: Асинхронный Компонент с defineI18nRoute',
      'async-components-test::test3.description': 'Асинхронный компонент, использующий функцию defineI18nRoute',
      'async-components-test::test4.title': 'Тест 4: Динамический Асинхронный Компонент',
      'async-components-test::test4.description': 'Динамически загружаемый асинхронный компонент',
      'async-components-test::test4.loadButton': 'Загрузить Динамический Компонент',
      'async-components-test::test5.title': 'Тест 5: Асинхронный Компонент с Ошибкой',
      'async-components-test::test5.description': 'Асинхронный компонент, который выбрасывает ошибку',
      'async-components-test::test5.error': 'Ошибка загрузки компонента',
      'async-components-test::results.title': 'Результаты Тестов',
      'async-components-test::results.currentLocale': 'Текущая Локаль',
      'async-components-test::results.routeName': 'Имя Маршрута',
      'async-components-test::results.translationsLoaded': 'Переводы Загружены',
      'async-components-test::results.yes': 'Да',
      'async-components-test::results.no': 'Нет',
      'async-components-test::loading': 'Загрузка...',
      'async-components-test::switchLanguage': 'Переключить Язык',
    },
    de: {
      'async-components-test::title': 'Async-Komponenten Test',
      'async-components-test::description': 'Testen von Async-Komponenten mit i18n-Übersetzungen',
      'async-components-test::navigation.goToTest2': 'Zu Test 2 Gehen',
      'async-components-test::navigation.backToHome': 'Zurück zur Startseite',
      'async-components-test::test1.title': 'Test 1: Einfache Async-Komponente',
      'async-components-test::test1.description': 'Grundlegende Async-Komponente ohne Übersetzungen',
      'async-components-test::test2.title': 'Test 2: Async-Komponente mit Übersetzungen',
      'async-components-test::test2.description': 'Async-Komponente, die ihre eigenen Übersetzungen laden sollte',
      'async-components-test::test3.title': 'Test 3: Async-Komponente mit defineI18nRoute',
      'async-components-test::test3.description': 'Async-Komponente mit defineI18nRoute-Funktion',
      'async-components-test::test4.title': 'Test 4: Dynamische Async-Komponente',
      'async-components-test::test4.description': 'Dynamisch geladene Async-Komponente',
      'async-components-test::test4.loadButton': 'Dynamische Komponente Laden',
      'async-components-test::test5.title': 'Test 5: Async-Komponente mit Fehler',
      'async-components-test::test5.description': 'Async-Komponente, die einen Fehler wirft',
      'async-components-test::test5.error': 'Fehler beim Laden der Komponente',
      'async-components-test::results.title': 'Testergebnisse',
      'async-components-test::results.currentLocale': 'Aktuelle Lokale',
      'async-components-test::results.routeName': 'Routenname',
      'async-components-test::results.translationsLoaded': 'Übersetzungen Geladen',
      'async-components-test::results.yes': 'Ja',
      'async-components-test::results.no': 'Nein',
      'async-components-test::loading': 'Laden...',
      'async-components-test::switchLanguage': 'Sprache Wechseln',
    },
  },
})

// Состояние компонентов
const showDynamicComponent = ref(false)
const DynamicComponent = ref<any>(null)
const isLoading = ref(false)
const translationsLoaded = ref(false)

// Доступные локали
const availableLocales = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'de', name: 'Deutsch' },
]

// Функции
const loadDynamicComponent = async () => {
  isLoading.value = true
  try {
    const AsyncDynamicComponent = defineAsyncComponent(() =>
      import('../components/test/AsyncDynamicComponent.vue'),
    )
    DynamicComponent.value = AsyncDynamicComponent
    showDynamicComponent.value = true
    await nextTick()
  }
  catch (error) {
    console.error('Error loading dynamic component:', error)
  }
  finally {
    isLoading.value = false
  }
}

const switchToLocale = async (locale: string) => {
  try {
    await $switchLocale(locale)
    translationsLoaded.value = true
  }
  catch (error) {
    console.error('Error switching locale:', error)
  }
}

onMounted(() => {
  translationsLoaded.value = true
})
</script>

<style scoped>
.async-components-test {
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

.controls button {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.controls button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
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
