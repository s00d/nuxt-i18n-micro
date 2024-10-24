<script setup lang="ts">
import { ModalsContainer } from 'vue-final-modal'
</script>

<template>
  <div>
    <NuxtLoadingIndicator
      color="#54c100"
      :throttle="100"
    />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- modal -->
    <ModalsContainer />
  </div>
</template>
