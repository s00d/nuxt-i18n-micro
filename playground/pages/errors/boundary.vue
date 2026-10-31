<script setup lang="ts">
const broken = ref(false)
const Bomb = () => {
  throw new Error('bench bomb')
}
</script>

<template>
  <BenchPage name="errors-boundary">
    <button data-testid="break" @click="broken = true">break</button>
    <NuxtErrorBoundary>
      <component :is="Bomb" v-if="broken" />
      <template #error="{ error, clearError }">
        <R id="boundary-error" :v="String(error)" />
        <R id="boundary-title" :v="$t('title')" />
        <button data-testid="boundary-clear" @click="((broken = false), clearError())">clear</button>
      </template>
    </NuxtErrorBoundary>
  </BenchPage>
</template>
