<template>
  <nav class="flex items-center gap-1" role="tablist" @keydown.left.prevent="move(-1)" @keydown.right.prevent="move(1)">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      :ref="(el) => (buttons[tab.value] = el as HTMLButtonElement)"
      role="tab"
      :aria-selected="modelValue === tab.value"
      :tabindex="modelValue === tab.value ? 0 : -1"
      :class="[
        'focus-ring relative inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors',
        modelValue === tab.value ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-elevated hover:text-highlighted',
      ]"
      @click="emit('update:modelValue', tab.value)"
    >
      <Icon v-if="tab.icon" :name="tab.icon" />
      {{ tab.label }}
    </button>
  </nav>
</template>

<script setup lang="ts">
import Icon, { type IconName } from './Icon.vue'

interface Tab {
  label: string
  value: string
  icon?: IconName
}

const props = defineProps<{ modelValue: string; tabs: Tab[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const buttons: Record<string, HTMLButtonElement> = {}

/** Arrow keys walk the tabs (WAI-ARIA tabs pattern). */
function move(step: number) {
  const index = props.tabs.findIndex((tab) => tab.value === props.modelValue)
  const next = props.tabs[(index + step + props.tabs.length) % props.tabs.length]
  if (!next) return
  emit('update:modelValue', next.value)
  buttons[next.value]?.focus()
}
</script>
