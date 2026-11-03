<template>
  <div data-testid="layout-alt">
    <BenchState layout="alt" />
    <p data-testid="layout-alt-text">{{ $t('layout.alt') }}</p>
    <slot />
  </div>
</template>
