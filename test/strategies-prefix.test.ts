/**
 * i18n strategy `prefix`: static generate + SSR build against test/fixtures/strategy.
 * One file per strategy so Vitest can run the four strategies in parallel.
 * Shared implementation: test/helpers/strategy-suite.ts
 */
import { describe } from 'vitest'
import { registerStrategySuite } from './helpers/strategy-suite'

describe('[prefix] strategy', () => {
  registerStrategySuite('prefix')
})
