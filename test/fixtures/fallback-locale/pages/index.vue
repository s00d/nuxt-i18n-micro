<script setup>

</script>

<template>
  <div>
    <h1>Index</h1>

    <div
      class="welcome"
      v-text="$t('generic.welcome')"
    />
    <div
      class="title"
      v-text="$t('generic.title')"
    />
    <p class="arr">
      {{ $t('arr') }}
    </p>
    <p class="arr_obj">
      {{ $t('arr_obj') }}
    </p>
  </div>
</template>
