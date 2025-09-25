<template>
  <div>
    <h1>Catch-all Page</h1>
    <p>This page should only be reached for non-static files.</p>
    <p>Current path: {{ $route.fullPath }}</p>
    <p>If you see this page when accessing /sitemap-en.xml or /robots.txt, the exclusion is not working.</p>
  </div>
</template>

<script setup>
const route = useRoute()

// This should not be reached for static files
console.log('Catch-all page reached for:', route.fullPath)
</script>
