<template>
  <h1>{{ $t('navigation_component.title') }}</h1>
  <ul class="space-y-0 rounded-xl p-4">
    <li
      v-for="(link, index) in navLinks"
      :key="index"
    >
      <NuxtLink :to="$localeRoute({ name: link.to })">
        <span>
          {{ link.label }}
        </span>
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
const { $localeRoute, $t } = useI18n()

const navLinks = computed(() => [
  {
    to: 'index',
    label: $t('navigation_component.home'),
  },
  {
    to: 'contact',
    label: $t('navigation.contact'),
  },
])
</script>

<style scoped>
</style>
