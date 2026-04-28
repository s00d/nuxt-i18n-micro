<template>
  <h1>Product {{ $route.params.id }}</h1>
</template>

<script setup>
import { useRoute } from "#imports";

const $route = useRoute();
</script>
