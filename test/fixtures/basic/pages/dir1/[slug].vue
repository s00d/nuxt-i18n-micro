<template>
  <div>
    <p id="test_link">
      {{ $t('test_link') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '#imports'

const { $t } = useI18n()
</script>
