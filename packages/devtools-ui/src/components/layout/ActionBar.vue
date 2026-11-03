<template>
  <div class="flex items-center gap-1">
    <Button variant="ghost" icon="download" title="Export" @click="emit('export')">Export</Button>
    <Button variant="ghost" icon="upload" title="Import" @click="emit('import')">Import</Button>
    <Button variant="ghost" icon="chart" title="Statistics" @click="emit('show-stats')">Stats</Button>
    <Button v-if="showTranslateButton" variant="ghost" icon="sparkles" title="Translate missing keys" @click="emit('translate-missing')"
      >Translate missing</Button
    >
    <span class="mx-1 h-5 w-px bg-line" />
    <Button variant="primary" icon="save" title="Save (Ctrl/⌘ + S)" @click="emit('save')">Save</Button>
  </div>
</template>

<script setup lang="ts">
import Button from '../ui/Button.vue'

defineProps<{ showTranslateButton?: boolean }>()

const emit = defineEmits<{
  export: []
  import: []
  'show-stats': []
  'translate-missing': []
  save: []
}>()
</script>
