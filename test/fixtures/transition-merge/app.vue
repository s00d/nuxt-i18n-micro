<template>
  <NuxtPage />
</template>

<style>
/* 1.5 s simultaneous cross-fade so both pages coexist in DOM */
.page-enter-active,
.page-leave-active {
  transition: opacity 1.5s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
