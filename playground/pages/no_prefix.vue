<template>
  <div class="container">
    <h1>No Prefix Strategy Test</h1>
    <p>Current locale: <span id="content">{{ $getLocale() }}</span></p>
    <p>Select locale: <i18n-switcher /></p>
    <p>Contact page link: <a :href="contactRoute">Contact</a></p>
    <p>Contact route debug: {{ contactRoute }}</p>
    <p>Contact route obj:</p> <pre>{{ contactRouteObj }}</pre>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $getLocale, $localeRoute } = useNuxtApp()

const locale = computed(() => $getLocale())
const contactRoute = computed(() => $localeRoute({ name: 'contact' }).path)
const contactRouteObj = computed(() => $localeRoute({ name: 'contact' }, locale.value))
</script>

<style>
body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
  color: #333;
  margin: 0;
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

p {
  margin-bottom: 10px;
  line-height: 1.6;
}

button {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}

.language-switcher {
  color: black;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
