<script setup lang="ts">
definePageMeta({ middleware: ['bench-named'] })
const named = useState('bench-mw-named')
</script>

<template>
  <BenchPage name="mw-named"><R id="mw-named" :v="named" /></BenchPage>
</template>
