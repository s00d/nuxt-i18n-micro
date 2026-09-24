<template>
  <div>
    <p id="hello">{{ $t('hello') }}</p>
    <p id="index-title">{{ $t('indexTitle') }}</p>
    <p id="shared-root">{{ $t('sharedRoot') }}</p>
    <p id="from-common">{{ $t('fromCommon') }}</p>
    <p id="only-common">{{ $t('onlyCommon', {}, 'missing') }}</p>
    <p id="deep-x">{{ $t('deep.a.x') }}</p>
    <p id="deep-y">{{ $t('deep.a.y') }}</p>
    <p id="deep-z">{{ $t('deep.a.z') }}</p>
    <p id="leak">{{ $t('leak', {}, 'missing') }}</p>
    <NuxtLink id="go-about" to="/en/about">About</NuxtLink>
  </div>
</template>
