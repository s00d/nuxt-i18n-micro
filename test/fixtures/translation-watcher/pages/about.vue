<template>
  <div>
    <p id="hello">{{ $t('hello') }}</p>
    <p id="about-title">{{ $t('aboutTitle') }}</p>
    <p id="shared-root">{{ $t('sharedRoot') }}</p>
    <p id="from-common">{{ $t('fromCommon') }}</p>
    <NuxtLink id="go-home" to="/en">Home</NuxtLink>
  </div>
</template>
