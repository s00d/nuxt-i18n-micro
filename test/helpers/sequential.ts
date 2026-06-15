/** Run async callbacks one after another (for shared Playwright page, etc.). */
export async function runSequential<T>(items: readonly T[], fn: (item: T) => Promise<void>): Promise<void> {
  await items.reduce<Promise<void>>(async (prev, item) => {
    await prev
    await fn(item)
  }, Promise.resolve())
}

/** Poll until `check` returns true or the deadline is reached. */
export async function pollUntil(
  check: () => Promise<boolean>,
  options: { intervalMs?: number; timeoutMs?: number; message?: string } = {},
): Promise<void> {
  const intervalMs = options.intervalMs ?? 250
  const deadline = Date.now() + (options.timeoutMs ?? 20_000)

  async function attempt(): Promise<void> {
    if (await check()) return
    if (Date.now() >= deadline) {
      throw new Error(options.message ?? 'Timed out while polling')
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
    return attempt()
  }

  await attempt()
}
