/**
 * `nuxi generate` regressions per strategy (prerender errors, static routes, payload files).
 * Filesystem assertions only — no servers, no ports. Each case has its own build dir,
 * so this file is safe to run alongside the per-strategy suites.
 * Implementation: test/helpers/strategy-generate.ts
 */
import { registerStrategyGenerateTests } from './helpers/strategy-generate'

registerStrategyGenerateTests()
