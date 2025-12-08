<template>
  <div
    class="p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100"
    :class="stacked ? 'block' : 'flex items-center justify-between'"
  >
    <template v-if="!stacked">
      <span class="text-sm font-medium text-gray-600 truncate">
        {{ label }}
      </span>
      <span :class="['font-semibold min-w-[60px] text-right', $attrs.class]">
        {{ formattedValue }}
        <span
          v-if="trend"
          class="ml-2 text-xs"
          :class="trendClass"
        >
          {{ trend }}%
        </span>
      </span>
    </template>

    <template v-else>
      <div class="flex flex-col">
        <span class="text-sm font-medium text-gray-600">
          {{ label }}
        </span>
        <span :class="['font-semibold mt-1', $attrs.class]">
          {{ formattedValue }}
          <span
            v-if="trend"
            class="ml-2 text-xs"
            :class="trendClass"
          >
            {{ trend }}%
          </span>
        </span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  label: String,
  value: [String, Number],
  trend: Number,
  stacked: {
    type: Boolean,
    default: false,
  },
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})

const trendClass = computed(() => {
  if (!props.trend) return ''
  return props.trend > 0 ? 'text-green-500' : 'text-red-500'
})
</script>
