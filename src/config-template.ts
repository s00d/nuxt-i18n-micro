/**
 * The full config as a JS expression for the strategy template: JSON, except `excludePatterns`,
 * whose RegExps have no JSON form (`{}`) and are emitted as regex literals. The key is left out of
 * the JSON: a minifier inlines the spread, and wrangler then reports a duplicate key.
 */
export function buildFullConfigSource(config: { excludePatterns?: (string | RegExp)[] }): string {
  const { excludePatterns = [], ...rest } = config
  const patterns = excludePatterns.map((pattern) => (pattern instanceof RegExp ? String(pattern) : JSON.stringify(pattern)))
  return `{ ...${JSON.stringify(rest)}, excludePatterns: [${patterns.join(', ')}] }`
}

/**
 * The private config template. `import.meta.dev` / `import.meta.prerender` are constants in the
 * server bundle, so the build machine's paths only reach the two builds that read them.
 */
export function buildPrivateConfigSource(config: { rootDir: string; rootDirs: string[]; payloadFsDir: string }): string {
  const { rootDir, rootDirs, payloadFsDir, ...rest } = config
  return `const __privateConfig = ${JSON.stringify(rest)}
if (import.meta.dev || import.meta.prerender) Object.assign(__privateConfig, ${JSON.stringify({ rootDir, rootDirs, payloadFsDir })})
export function getI18nPrivateConfig() { return __privateConfig }
`
}
