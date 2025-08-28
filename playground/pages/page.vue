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

    <i18n-group prefix="product.details">
      <template #default="{ t }">
        <h1>{{ t('title') }}</h1>
        <div class="price">
          {{ t('price', { value: 99.99 }) }}
        </div>
        <p>{{ t('description') }}</p>
        <ul>
          <li
            v-for="(feature, index) in ['durability', 'design', 'performance']"
            :key="index"
          >
            {{ t(`features.${feature}`) }}
          </li>
        </ul>
      </template>
    </i18n-group>

    <p>Current Locale: {{ $getLocale() }}</p>

    <p>text escaping: {{ $t('text_escaping') }}</p>

    <div>
      <b>$t with params: </b>
      {{ $t('welcome', { username: 'Alice', unreadCount: 5 }) }}
    </div>

    <div>
      <b>$tc 2 forms (zero|many): </b>
      {{ $tc('many_apples', 0) }} | {{ $tc('many_apples', 3) }}
    </div>

    <div>
      <b>$tc 3 forms (zero|one|{count}): </b>
      {{ $tc('apples', 0) }} | {{ $tc('apples', 1) }} | {{ $tc('apples', 3) }}
    </div>

    <div>
      <b>$tc plural with params :</b>
      <ul>
        <li>{{ $tc('user_apples', { count: 0, username: 'Alice' }) }}</li>
        <li>{{ $tc('user_apples', { count: 1, username: 'Alice' }) }}</li>
        <li>{{ $tc('user_apples', { count: 10, username: 'Alice' }) }}</li>
      </ul>
    </div>

    <div>
      i18n-t plural
      <i18n-t
        keypath="apples"
        :plural="appleCount"
        :custom-plural-rule="customPluralRule"
      />
    </div>

    <div>
      i18n-t plural with params
      <i18n-t
        keypath="user_apples"
        :plural="appleCount"
        :params="{ username: 'Alice' }"
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

    <div>
      Formatted Date: {{ $tdr('2023-12-31') }}
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
type Params = Record<string, string | number | boolean>

const { $getLocale, $switchLocale, $getLocales, $localeRoute, $t, $tc, $tn, $td, $tdr } = useNuxtApp()

// Количество яблок
const appleCount = ref(5)
const locale = computed(() => $getLocale())

// Кастомное правило множественных форм
const customPluralRule = (key: string, count: number, params: Params, _locale: string, t: Getter) => {
  const translation = t(key, params)
  if (!translation) {
    return null
  }
  const forms = translation.toString().split('|')
  if (count === 0 && forms.length > 2) {
    const form = forms[0]
    return form ? form.trim() : null // Case for "no apples"
  }
  if (count === 1 && forms.length > 1) {
    const form = forms[1]
    return form ? form.trim() : null // Case for "one apple"
  }
  if (forms.length > 2) {
    const form = forms[2]
    return form ? form.trim().replace('{count}', count.toString()) : null
  }
  const lastForm = forms[forms.length - 1]
  return lastForm ? lastForm.trim().replace('{count}', count.toString()) : null
}
</script>
