import { AsyncLocalStorage } from 'node:async_hooks'
import type { ReactiveI18nStore } from '@i18n-micro/core'
import { I18n as RuntimeI18n, type I18nOptions as RuntimeI18nOptions } from '@i18n-micro/runtime'
import { loadTranslations } from './loader'

export interface I18nOptions extends RuntimeI18nOptions {
  translationDir?: string
  disablePageLocales?: boolean
}

export class I18n extends RuntimeI18n {
  public translationDir?: string
  private disablePageLocales: boolean
  /** The request's fork; shared with forks, so `run` works from any of them. */
  private readonly scope: AsyncLocalStorage<I18n>
  private readonly forked: boolean

  constructor(options: I18nOptions) {
    const { translationDir, disablePageLocales, ...runtimeOptions } = options
    super(runtimeOptions)

    const parent = options.parent as I18n | undefined
    this.translationDir = translationDir ?? parent?.translationDir
    this.disablePageLocales = disablePageLocales ?? parent?.disablePageLocales ?? false
    this.scope = parent?.scope ?? new AsyncLocalStorage()
    this.forked = parent !== undefined
  }

  /** Inside `run`, the shared instance answers with the request's locale and route. A fork always answers with its own. */
  protected override get store(): ReactiveI18nStore {
    // `?.`: the parent constructor reads this before `scope` is set
    return this.forked ? this.ownStore : (this.scope?.getStore()?.ownStore ?? this.ownStore)
  }

  /**
   * Runs `fn` with a fork for `locale` as the current request: until `fn` and everything it awaits
   * finish, this instance reads and sets that fork's locale and route. `fn` also gets the fork.
   * ponytail: dictionary writes go to the instance they are called on; write to the fork for request-only keys.
   */
  public run<T>(locale: string, fn: (i18n: this) => T): T {
    const fork = this.fork(locale)
    return this.scope.run(fork, fn, fork)
  }

  public async loadTranslations(dir?: string): Promise<void> {
    const targetDir = dir || this.translationDir
    if (!targetDir) {
      console.warn('[i18n-node] No translation directory specified')
      return
    }

    const { root, routes } = await loadTranslations(targetDir, this.disablePageLocales)

    // root keys resolve from the root chunk; route chunks hold only their own keys
    this.loadMessages(root, routes)
  }

  /** Re-reads the directory. The old dictionaries answer until the new ones are in, so no request sees an empty instance. */
  public async reload(): Promise<void> {
    const targetDir = this.translationDir
    if (!targetDir) {
      console.warn('[i18n-node] No translation directory specified')
      return
    }

    const { root, routes } = await loadTranslations(targetDir, this.disablePageLocales)
    this.clearCache()
    this.loadMessages(root, routes)
  }
}

export function createI18n(options: I18nOptions): I18n {
  return new I18n(options)
}
