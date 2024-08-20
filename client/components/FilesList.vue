<template>
  <div>
    <div v-for="file in files" :key="file">
      <button
        block
        w-full
        truncate
        px2
        py1
        text-start
        text-sm
        font-mono
        :class="file === selectedFile ? 'text-primary n-bg-active' : 'text-secondary hover:n-bg-hover'"
        @click="$emit('fileSelected', file)"
      >
        {{ file }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

defineProps<{
  files: string[]
  selectedFile: string
}>()

defineEmits(['fileSelected'])
</script>
