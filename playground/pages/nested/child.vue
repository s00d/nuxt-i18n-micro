<template>
  <div data-testid="nested-child-page">
    <R id="nested-child-title" :v="$t('page_title')" />
    <R id="nested-child-path-de" :v="$localePath('/nested/child', 'de')" />
  </div>
</template>
