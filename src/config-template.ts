/**
 * The full config as a JS expression for the strategy template: JSON, except `excludePatterns`,
 * whose RegExps have no JSON form (`{}`) and are emitted as regex literals.
 */
export function buildFullConfigSource(config: { excludePatterns?: (string | RegExp)[] }): string {
  const patterns = (config.excludePatterns ?? []).map((pattern) => (pattern instanceof RegExp ? String(pattern) : JSON.stringify(pattern)))
  return `{ ...${JSON.stringify(config)}, excludePatterns: [${patterns.join(', ')}] }`
}
