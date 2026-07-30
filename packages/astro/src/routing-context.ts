import { AsyncLocalStorage } from 'node:async_hooks'
import type { I18nRoutingStrategy } from './router/types'

/** Integration-time default strategy (immutable after setup). */
let installedRoutingStrategy: I18nRoutingStrategy | null = null

/** Per-request strategy override for concurrent SSR. */
const requestRoutingStrategy = new AsyncLocalStorage<I18nRoutingStrategy | null>()

export function getGlobalRoutingStrategy(): I18nRoutingStrategy | null {
  const store = requestRoutingStrategy.getStore()
  // Distinguish an explicit per-request override (including `null`, i.e. routing
  // disabled for this request) from "no request context" (`undefined`).
  return store !== undefined ? store : installedRoutingStrategy
}

export function setGlobalRoutingStrategy(strategy: I18nRoutingStrategy | null): void {
  installedRoutingStrategy = strategy
}

export function runWithRoutingStrategy<T>(strategy: I18nRoutingStrategy | null, fn: () => T): T {
  return requestRoutingStrategy.run(strategy, fn)
}
