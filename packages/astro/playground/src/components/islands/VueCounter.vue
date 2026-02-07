<script setup lang="ts">
import type { I18nClientProps } from '@i18n-micro/astro'
import { translate } from '@i18n-micro/astro/client'
import { provideI18n } from '@i18n-micro/astro/client/vue'
import { defaultPlural, FormatService } from '@i18n-micro/core'
import type { Params, TranslationKey } from '@i18n-micro/types'
import { computed, ref } from 'vue'

const props = defineProps<{
  i18n: I18nClientProps
}>()

// Инициализируем провайдер и получаем состояние напрямую
const state = provideI18n(props.i18n)
const formatter = new FormatService()

// Используем состояние напрямую вместо inject
const t = (key: TranslationKey, params?: Params, defaultValue?: string | null, routeName?: string) => {
  return translate(state.value, key as string, params, defaultValue, routeName)
}

const tc = (key: TranslationKey, count: number | Params, defaultValue?: string) => {
  const { count: countValue, ...params } = typeof count === 'number' ? { count } : count

  if (countValue === undefined) {
    return defaultValue ?? (key as string)
  }

  const getter = (k: TranslationKey, p?: Params, dv?: string) => {
    return t(k, p, dv)
  }

  const result = defaultPlural(key, Number.parseInt(countValue.toString(), 10), params, state.value.locale, getter)

  return result ?? defaultValue ?? (key as string)
}

const tn = (value: number, options?: Intl.NumberFormatOptions): string => {
  return formatter.formatNumber(value, state.value.locale, options)
}

const locale = computed(() => state.value.locale)

const count = ref(0)
const increment = () => count.value++
</script>

<template>
  <div class="island-card vue-card">
    <h3>{{ t('islands.vue.title') }}</h3>
    <p>{{ t('islands.vue.description') }}</p>
    <div class="counter">
      <button @click="increment">
        +
      </button>
      <span>{{ count }}</span>
      <p>
        {{ tc('islands.apples', count) }}
      </p>
      <p>
        {{ t('islands.number', { number: tn(count) }) }}
      </p>
    </div>
    <p class="locale-info">
      Locale: {{ locale }}
    </p>
  </div>
</template>

<style scoped>
.island-card {
  padding: 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin: 1rem 0;
}

.vue-card {
  border-color: #42b883;
  background: #f0fdf4;
}

.counter {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
}

button {
  padding: 0.5rem 1rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background: #369870;
}

.locale-info {
  font-size: 0.875rem;
  color: #666;
  margin-top: 1rem;
}
</style>
