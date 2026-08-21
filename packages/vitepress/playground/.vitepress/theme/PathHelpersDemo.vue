<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { useI18n } from '@i18n-micro/vitepress'

const { localePath, switchLocale, getLocale, getLocales } = useI18n()
const { page } = useData()

const current = computed(() => getLocale())
const codes = computed(() => getLocales().map((l) => l.code))
const nextLocale = computed(() => {
  const list = codes.value
  const i = list.indexOf(current.value)
  return list[(i + 1) % list.length] ?? 'en'
})

function href(path: string, locale: string) {
  return withBase(localePath(path, locale))
}
</script>

<template>
  <div class="path-helpers-demo">
    <p>
      <code>useI18n().localePath</code> — locale <strong>{{ current }}</strong>, page
      <code>{{ page.relativePath }}</code>
    </p>
    <ul>
      <li v-for="code in codes" :key="code">
        <a :href="href('/', code)">{{ code }} home</a>
        ·
        <a :href="href('/guide/demo', code)">{{ code }} demo</a>
      </li>
    </ul>
    <p>
      <button type="button" @click="switchLocale(nextLocale)">switchLocale → {{ nextLocale }}</button>
      <span class="muted">locales: {{ codes.join(', ') }}</span>
    </p>
  </div>
</template>

<style scoped>
.path-helpers-demo {
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 0.9rem;
}
.path-helpers-demo ul {
  margin: 0.5rem 0;
  padding-left: 1.25rem;
}
.path-helpers-demo .muted {
  margin-left: 0.5rem;
  opacity: 0.7;
}
.path-helpers-demo button {
  cursor: pointer;
}
</style>
