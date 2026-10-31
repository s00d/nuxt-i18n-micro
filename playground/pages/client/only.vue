<template>
  <BenchPage name="client-only">
    <ClientOnly>
      <R id="client-only-text" :v="$t('title')" />
      <template #fallback
        ><span data-testid="client-only-fallback">{{ $t('title') }}</span></template
      >
    </ClientOnly>
    <BenchClient />
  </BenchPage>
</template>
