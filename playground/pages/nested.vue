<template>
  <BenchPage name="nested">
    <R id="nested-parent" :v="$t('page_title')" />
    <i18n-link data-testid="nested-child" to="/nested/child">child</i18n-link>
    <NuxtPage />
  </BenchPage>
</template>
