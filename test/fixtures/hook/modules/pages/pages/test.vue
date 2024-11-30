<template>
  <div>
    <p>
      Go to
      <NuxtLink
        class="underline"
        to="/"
      >
        Homepage
      </NuxtLink>
    </p>
    <p
      id="text"
      v-text="$t('test.title')"
    />

    <p id="hook">
      {{ $t('hook') }}
    </p>
  </div>
</template>
