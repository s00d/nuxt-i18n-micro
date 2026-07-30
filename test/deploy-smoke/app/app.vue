<template>
  <div>
    <nav>
      <NuxtLink id="nav-home" :to="$localeRoute({ name: 'index' })">{{ $t('nav.home') }}</NuxtLink>
      <NuxtLink id="nav-about" :to="$localeRoute({ name: 'about' })">{{ $t('nav.about') }}</NuxtLink>
    </nav>
    <NuxtPage />
  </div>
</template>
