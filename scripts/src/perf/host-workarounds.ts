/**
 * Host workarounds so Artillery docs regen can finish under untestutils:
 * 1) Artillery in-process runner calls process.exit() — swallow that.
 * 2) untestutils stop() waits on an unref'd interval → empty loop / exit 13.
 * 3) untestutils host teardown uses process.kill(-pid); on this suite that can
 *    take down the parent — kill leader only for those stacks.
 *
 * Returns a restore function that puts the three globals back (safe to call twice).
 */
export function installPerfHostWorkarounds(): () => void {
  const previousExit = process.exit
  process.exit = ((code?: number) => {
    const stack = new Error().stack ?? ''
    if (stack.includes('artillery') || stack.includes('suggestedExitCode')) {
      if (typeof code === 'number' && code !== 0) process.exitCode = code
      return undefined as never
    }
    return previousExit.call(process, code) as never
  }) as typeof process.exit

  const probe = setTimeout(() => {}, 0)
  const timerProto = Object.getPrototypeOf(probe) as {
    unref: (this: NodeJS.Timeout) => NodeJS.Timeout
  }
  clearTimeout(probe)
  const previousUnref = timerProto.unref
  timerProto.unref = function patchedUnref(this: NodeJS.Timeout) {
    const stack = new Error().stack ?? ''
    if (stack.includes('untestutils') || stack.includes('@untestutils')) {
      return this
    }
    return previousUnref.call(this)
  }

  const previousKill = process.kill
  process.kill = ((pid: number, signal?: NodeJS.Signals | number) => {
    if (typeof pid === 'number' && pid < 0) {
      const stack = new Error().stack ?? ''
      if (stack.includes('untestutils') || stack.includes('@untestutils')) {
        return previousKill.call(process, -pid, signal)
      }
    }
    return previousKill.call(process, pid, signal)
  }) as typeof process.kill

  let restored = false
  return () => {
    if (restored) return
    restored = true
    timerProto.unref = previousUnref
    process.kill = previousKill
    process.exit = previousExit
  }
}

/**
 * Run `fn` with host workarounds installed; always restore globals afterward
 * (including when `fn` throws).
 */
export async function withPerfHostWorkarounds<T>(fn: () => Promise<T> | T): Promise<T> {
  const restore = installPerfHostWorkarounds()
  try {
    return await fn()
  } finally {
    restore()
  }
}
