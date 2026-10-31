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
 * The private config template. The build machine's paths reach only the two servers that read
 * them: dev, known here, and the prerenderer, where `import.meta.prerender` is a constant.
 */
export function buildPrivateConfigSource(config: { rootDir: string; rootDirs: string[]; payloadFsDir: string }, dev: boolean): string {
  const { rootDir, rootDirs, payloadFsDir, ...rest } = config
  const read = `export function getI18nPrivateConfig() { return __privateConfig }\n`
  if (dev) return `const __privateConfig = ${JSON.stringify(config)}\n${read}`
  return `const __privateConfig = ${JSON.stringify(rest)}
if (import.meta.prerender) Object.assign(__privateConfig, ${JSON.stringify({ rootDir, rootDirs, payloadFsDir })})
${read}`
}
