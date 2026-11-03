<script setup lang="ts">
defineProps<{ variant: string }>()
const hydrated = ref(false)
onMounted(() => (hydrated.value = true))
</script>

<template>
  <span :data-testid="`island-client-${variant}`" :data-hydrated="hydrated">{{ $t('title') }} / {{ $getLocale() }}</span>
</template>
