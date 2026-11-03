<script setup lang="ts">
/**
 * Title already comes from UPageHeader / frontmatter (Nuxt UI docs pattern).
 * Rendering the markdown `#` again doubles the H1 — bad for layout and SEO.
 */
</script>

<template>
  <!-- Page H1 is UPageHeader; markdown `#` would duplicate it.
       `v-if="false"` leaves the same placeholder comment in SSR and client renders; a template with
       only a comment renders nothing on the server but a comment node on the client (hydration mismatch). -->
  <h1 v-if="false" />
</template>
