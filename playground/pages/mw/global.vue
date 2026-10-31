<script setup lang="ts">
const log = useState<string[]>('bench-mw-global', () => [])
</script>

<template>
  <BenchPage name="mw-global"
    ><ClientOnly><R id="mw-global" :v="log" /></ClientOnly
  ></BenchPage>
</template>
