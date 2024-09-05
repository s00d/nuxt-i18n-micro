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
  </div>
</template>
