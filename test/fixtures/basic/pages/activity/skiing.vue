<template>
  <div>
    <h1 id="title">
      Skiing Subpage
    </h1>
    <p id="text">
      {{ $t('generic.welcome') }}
    </p>
    ⛷️⛷️⛷️
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '#imports'

const { $t } = useI18n()
</script>
