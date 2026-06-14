<template>
  <div>
    <p id="hello">{{ $t('hello') }}</p>
    <p id="index-title">{{ $t('indexTitle') }}</p>
    <p id="shared-root">{{ $t('sharedRoot') }}</p>
    <NuxtLink id="go-about" to="/en/about">About</NuxtLink>
  </div>
</template>
