import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  // mkdist reports a failed declaration as a warning and writes an empty `.d.ts`: consumers then lose every plugin type
  failOnWarn: true,
  // @ts-expect-error
  rollupOptions: {
    // for example, if you wish to continue to generate `.cjs` output
    emitCJS: true,
  },
})
