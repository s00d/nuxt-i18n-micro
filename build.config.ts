import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  rollupOptions: {
    // for example, if you wish to continue to generate `.cjs` output
    emitCJS: true,
  },
})
