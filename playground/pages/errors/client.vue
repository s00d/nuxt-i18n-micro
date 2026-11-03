<template>
  <BenchPage name="errors-client">
    <button data-testid="show-error" @click="showError({ statusCode: 418, statusMessage: 'Bench 418' })">showError</button>
  </BenchPage>
</template>
