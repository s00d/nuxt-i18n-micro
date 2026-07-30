import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  failOnWarn: false,
  // @ts-expect-error
  rollupOptions: {
    // for example, if you wish to continue to generate `.cjs` output
    emitCJS: true,
  },
})
