<template>
  <div>
    <p>{{ $t('key1.key1.key1.key1.key1') }}</p>
    <i18n-t
      keypath="key1.key1.key1.key1.key1"
      tag="h1"
    >
      <template #default="{ translation }">
        <strong>{{ translation.replace('page', 'page replace') }}</strong> <i>!!!</i>
      </template>
    </i18n-t>

    <i18n-t keypath="feedback.text">
      <template #link>
        <nuxt-link :to="{ name: 'index' }">
          <i18n-t keypath="feedback.link" />
        </nuxt-link>
      </template>
    </i18n-t>

    <p>Current Locale: {{ $getLocale() }}</p>

    <p>text escaping: {{ $t('text_escaping') }}</p>

    <div>
      {{ $t('welcome', { username: 'Alice', unreadCount: 5 }) }}
    </div>
    <div>
      {{ $tc('apples', 10) }}
    </div>

    <div>
      $tc plural
      {{ $tc('apples', 10) }}
    </div>

    <div>
      i18n-t plural
      <i18n-t
        keypath="apples"
        :plural="appleCount"
        :custom-plural-rule="customPluralRule"
      />
    </div>

    <!-- Formatted number and date examples -->
    <div>
      Formatted Number: {{ $tn(1234567.89) }}
    </div>
    <div>
      Formatted Date: {{ $td('2023-12-31') }}
    </div>

    <!-- Ссылки для переключения локалей -->
    <div>
      <button
        v-for="val in $getLocales()"
        :key="val.code"
        :disabled="val.code === locale"
        @click="() => $switchLocale(val.code)"
      >
        Switch to {{ val.code }}
      </button>
    </div>

    <div>
      <NuxtLink :to="$localeRoute({ name: 'index' })">
        Go to Index
      </NuxtLink>
      |
      <NuxtLink :to="$localeRoute({ name: 'subpage' })">
        Go to subpage
      </NuxtLink>
      |
      <NuxtLink :to="$localeRoute({ name: 'subpage' }, 'en')">
        Go to subpage en
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#imports'

type Getter = (key: string, params?: Record<string, string | number | boolean>, defaultValue?: string) => unknown

const { $getLocale, $switchLocale, $getLocales, $localeRoute, $t, $tc, $tn, $td } = useNuxtApp()

// Количество яблок
const appleCount = ref(5)
const locale = computed(() => $getLocale())

// Кастомное правило множественных форм
const customPluralRule = (key: string, count: number, _locale: string, t: Getter) => {
  const translation = t(key)
  if (!translation) {
    return null
  }
  const forms = translation.toString().split('|')
  if (count === 0 && forms.length > 2) {
    return forms[0].trim() // Case for "no apples"
  }
  if (count === 1 && forms.length > 1) {
    return forms[1].trim() // Case for "one apple"
  }
  return (forms.length > 2 ? forms[2].trim() : forms[forms.length - 1].trim()).replace('{count}', count.toString())
}
</script>
