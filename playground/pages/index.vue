<script setup lang="ts">
import benchPages from '~/bench/pages.json'

const { $t } = useNuxtApp()
</script>

<template>
  <BenchPage name="index">
    <R id="index-title" :v="$t('title')" />
    <R id="index-page-key" :v="$t('page_title')" />
    <ul data-testid="catalogue">
      <li v-for="path in benchPages" :key="path">
        <i18n-link :to="path">{{ path }}</i18n-link>
      </li>
    </ul>
  </BenchPage>
</template>
