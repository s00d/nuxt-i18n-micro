<template>
  <div>
    <h1>{{ $t("index::title") }}</h1>
    <p>{{ $t("index::description") }}</p>

    <!-- Навигация к тестовым страницам -->
    <div class="navigation">
      <i18n-link to="/async-components-test" class="nav-link">
        {{ $t("index::navigation.test1") }}
      </i18n-link>
      <i18n-link to="/async-components-test-2" class="nav-link">
        {{ $t("index::navigation.test2") }}
      </i18n-link>
    </div>

    <!-- Информация о текущей локали -->
    <div class="locale-info">
      <p>
        <strong>{{ $t("index::localeInfo.currentLocale") }}:</strong> {{ $getLocale() }}
      </p>
      <p>
        <strong>{{ $t("index::localeInfo.routeName") }}:</strong> {{ $getRouteName() }}
      </p>
    </div>

    <!-- Переключатель языков -->
    <div class="language-switcher">
      <h3>{{ $t("index::switchLanguage") }}</h3>
      <div class="switcher-buttons">
        <button
          v-for="locale in availableLocales"
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
import { useNuxtApp } from "#imports";

const { $defineI18nRoute, $getLocale, $getRouteName, $switchLocale, $t } = useNuxtApp();

// Определяем переводы для главной страницы
$defineI18nRoute({
  locales: {
    en: {
      "index::title": "Async Components Test Suite",
      "index::description": "Testing async components with i18n translations",
      "index::navigation.test1": "🧪 Async Components Test 1",
      "index::navigation.test2": "🧪 Async Components Test 2",
      "index::localeInfo.currentLocale": "Current Locale",
      "index::localeInfo.routeName": "Route Name",
      "index::switchLanguage": "Switch Language",
    },
    ru: {
      "index::title": "Набор Тестов Асинхронных Компонентов",
      "index::description": "Тестирование асинхронных компонентов с переводами i18n",
      "index::navigation.test1": "🧪 Тест Асинхронных Компонентов 1",
      "index::navigation.test2": "🧪 Тест Асинхронных Компонентов 2",
      "index::localeInfo.currentLocale": "Текущая Локаль",
      "index::localeInfo.routeName": "Имя Маршрута",
      "index::switchLanguage": "Переключить Язык",
    },
    de: {
      "index::title": "Async-Komponenten Test-Suite",
      "index::description": "Testen von Async-Komponenten mit i18n-Übersetzungen",
      "index::navigation.test1": "🧪 Async-Komponenten Test 1",
      "index::navigation.test2": "🧪 Async-Komponenten Test 2",
      "index::localeInfo.currentLocale": "Aktuelle Lokale",
      "index::localeInfo.routeName": "Routenname",
      "index::switchLanguage": "Sprache Wechseln",
    },
  },
});

// Доступные локали
const availableLocales = [
  { code: "en", name: "English" },
  { code: "ru", name: "Русский" },
  { code: "de", name: "Deutsch" },
];

// Функция переключения языка
const switchToLocale = async (locale: string) => {
  try {
    await $switchLocale(locale);
  } catch (error) {
    console.error("Error switching locale:", error);
  }
};
</script>

<style scoped>
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

.locale-info {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
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
