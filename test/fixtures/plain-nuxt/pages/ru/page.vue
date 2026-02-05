<template>
  <div>
    <h2 id="ok">
      ok
    </h2>
    <p>{{ getValue(data, 'key1.key1.key1.key1.key1') }}</p>
    <p>Current Locale: ru</p>

    <div>
      {{ interpolate(data.welcome, { username: 'Alice', unreadCount: 5 }) }}
    </div>

    <div>
      <NuxtLink to="/ru">
        Go to Index
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import pageData from '../../data/page/ru.json'

const data = pageData

function getValue(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj) ?? path
}

function interpolate(template, params) {
  if (template == null || typeof template !== 'string') return ''
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`))
}
</script>
