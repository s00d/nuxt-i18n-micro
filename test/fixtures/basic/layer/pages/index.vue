<template>
  <div>
    <div id="locale">
      {{ $t('key0') }}
    </div>
    <div id="replace">
      {{ $t('key1') }}
    </div>

    <div id="layer">
      {{ $t('layer') }}
    </div>
    <div id="basic_layer">
      {{ $t('basic_layer') }}
    </div>

    <div id="basic">
      {{ $t('basic') }}
    </div>
    <div id="page_layer">
      {{ $t('page_layer') }}
    </div>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $t } = useNuxtApp()
</script>
