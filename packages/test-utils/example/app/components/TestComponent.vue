<script setup lang="ts">
// @ts-nocheck
const { $t } = useI18n()

const props = defineProps({
  message: {
    type: String,
    default: null,
  },
})

// Test to see that $t works in script setup as well as the template
const message = props.message || $t('defaultMessage')
</script>

<template>
  <div>
    <p>Test from component: {{ $t('welcome') }}</p>
    <p data-testid="message">
      Test message from props: {{ message }}
    </p>
  </div>
</template>
