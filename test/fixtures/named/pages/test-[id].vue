<script setup></script>

<template>
  <div>
    <h1>Normal Subpage with route param baked into file name</h1>
    <p>{{ useRoute().params.id }}</p>
    <NuxtLink to="/">
      Home
    </NuxtLink>
  </div>
</template>
