<template>
  <div class="action-bar">
    <div class="action-bar__left">
      <Button
        class="action-btn action-btn--export"
        title="Export"
        variant="ghost"
        @click="emit('export')"
      >
        <span class="action-btn__icon">📤</span>
      </Button>

      <Button
        class="action-btn action-btn--import"
        title="Import"
        variant="ghost"
        @click="emit('import')"
      >
        <span class="action-btn__icon">📥</span>
      </Button>

      <Button
        class="action-btn action-btn--stats"
        title="Stats"
        variant="ghost"
        @click="emit('show-stats')"
      >
        <span class="action-btn__icon">📊</span>
      </Button>

      <Button
        v-if="showTranslateButton"
        class="action-btn action-btn--translate"
        title="Translate"
        variant="ghost"
        @click="emit('translate-missing')"
      >
        <span class="action-btn__icon">🌐</span>
      </Button>
    </div>

    <Button
      class="action-btn action-btn--save"
      title="Save"
      variant="primary"
      @click="emit('save')"
    >
      <span class="action-btn__icon">💾</span>
    </Button>
  </div>
</template>

<script setup lang="ts">
import Button from '../ui/Button.vue'

interface Props {
  showTranslateButton?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  export: []
  import: []
  'show-stats': []
  'translate-missing': []
  save: []
}>()
</script>

<style scoped>
@reference "tailwindcss";

.action-bar {
  @apply flex items-center justify-between p-3 bg-white border-b border-slate-200;
}

.action-bar__left {
  @apply flex items-center gap-2 flex-wrap;
}

/* Action Buttons */
.action-btn {
  @apply flex items-center gap-1.5;
}

.action-btn__icon {
  @apply text-sm;
}
</style>
