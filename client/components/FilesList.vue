<template>
  <div>
    <div
      v-for="file in files"
      :key="file"
    >
      <NButton
        block
        w-full
        truncate
        px2
        py1
        text-start
        text-sm
        font-mono
        type="button"
        :color="file === selectedFile ? 'primary' : ''"
        @click="$emit('fileSelected', file)"
      >
        {{ file }}
      </NButton>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  files: string[]
  selectedFile: string
}>()

defineEmits(['fileSelected'])
</script>
