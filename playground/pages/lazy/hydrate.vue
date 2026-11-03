<template>
  <BenchPage name="lazy-hydrate">
    <LazyBenchLazy hydrate-never mode="never" />
    <LazyBenchLazy hydrate-on-idle mode="idle" />
    <LazyBenchLazy hydrate-on-visible mode="visible" />
    <LazyBenchLazy :hydrate-after="50" mode="after" />
    <LazyBenchLazy hydrate-on-interaction mode="interaction" />
  </BenchPage>
</template>
