<template>
  <div class="flex h-full min-h-24 items-center justify-center gap-2.5 p-6 text-sm text-muted" role="status">
    <span class="size-4 animate-spin rounded-full border-2 border-line border-t-primary" />
    {{ message }}
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ message?: string }>(), { message: 'Loading…' })
</script>
