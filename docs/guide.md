---
outline: deep
---

# Getting Started

## Overview

Vue Swatches is a Vue component that allows the user to choose a color. By default it shows the colors in a popover after clicking a color box (the trigger).

Unlike classic color pickers, where all colors are available (167 77 216 colors), Vue Swatches only shows a bunch of predefined colors.

## Getting Started

### Installation

```bash
npm install vue3-swatches
```

### Usage

```vue
<script setup>
  import { ref } from 'vue'
  import { VSwatches } from 'vue3-swatches'
  import 'vue3-swatches/dist/style.css'

  const color = ref("#1FBC9C")
</script>

<template>
  <VSwatches v-model="color" />
</template>
```

### Nuxt

```ts
export default defineNuxtConfig({
  modules: ['vue3-swatches/nuxt']
})
```
