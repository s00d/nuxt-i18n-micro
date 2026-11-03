<template>
  <div>
    <h1 id="client-text">Client only page - SSR disabled</h1>
    <p>Some other content that's only rendered on the client</p>
    <p id="client-locale">{{ $getLocale() }}</p>
    <p id="client-t">{{ $t('lang') }}</p>
  </div>
</template>

<script setup lang="ts">
console.log('Client-only page is running on the browser')
</script>
