// Root typecheck sees this fixture without its own .nuxt: the async-components pages call definePageMeta.
declare global {
  function definePageMeta(meta: { ssr?: boolean }): void
}

export {}
