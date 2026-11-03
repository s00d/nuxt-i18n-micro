<template>
  <BenchPage name="comp-i18n-group">
    <i18n-group v-slot="{ prefix, t }" prefix="group" group-class="bench-group">
      <R id="ig-prefix" :v="prefix" />
      <R id="ig-a" :v="t('a')" />
      <R id="ig-params" :v="t('b', { x: 'X' })" />
      <R id="ig-missing" :v="t('nope')" />
    </i18n-group>
  </BenchPage>
</template>
