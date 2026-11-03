<script setup lang="ts">
const props = defineProps<{ mode: string }>()
const { $t, $getLocale } = useNuxtApp()
const hydrated = ref(false)
onMounted(() => (hydrated.value = true))
</script>

<template>
  <div :data-testid="`lazy-${props.mode}`" :data-hydrated="hydrated">
    {{ props.mode }}: {{ $t('title') }} / {{ $getLocale() }} / hydrated={{ hydrated }}
  </div>
</template>
