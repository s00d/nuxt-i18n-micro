<template>
  <div>
    <header class="header">
      <h1 class="layout-title">
        {{ $t('layout.title') }}
      </h1>
      <nav class="nav">
        <span class="nav-home">{{ $t('layout.nav.home') }}</span>
        <span class="nav-about">{{ $t('layout.nav.about') }}</span>
      </nav>
      <div class="locale-switcher">
        <button
          v-for="locale in $getLocales()"
          :key="locale.code"
          :class="['locale-btn', { active: $getLocale() === locale.code }]"
          :data-locale="locale.code"
          @click="$switchLocale(locale.code)"
        >
          {{ locale.code.toUpperCase() }}
        </button>
      </div>
      <div class="current-locale">
        Current: <span class="locale-value">{{ $getLocale() }}</span>
      </div>
    </header>
    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
const { $t, $getLocale, $switchLocale } = useI18n()
</script>

<style>
.header {
  padding: 20px;
  background: #f0f0f0;
}
.locale-switcher {
  margin-top: 10px;
}
.locale-btn {
  margin-right: 10px;
  padding: 5px 10px;
  cursor: pointer;
}
.locale-btn.active {
  background: #007bff;
  color: white;
}
</style>
