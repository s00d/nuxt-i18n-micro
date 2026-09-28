import { afterEach, describe, expect, it, vi } from 'vitest'
import { installPerfHostWorkarounds, withPerfHostWorkarounds } from '../src/perf/host-workarounds'

describe('perf host workarounds', () => {
  const originals = {
    exit: process.exit,
    kill: process.kill,
  }
  let timerProto: { unref: (this: NodeJS.Timeout) => NodeJS.Timeout }
  let nativeUnref: (this: NodeJS.Timeout) => NodeJS.Timeout
  let prepareStackTrace: typeof Error.prepareStackTrace | undefined

  function captureTimerProto() {
    const probe = setTimeout(() => {}, 0)
    timerProto = Object.getPrototypeOf(probe) as typeof timerProto
    nativeUnref = timerProto.unref
    clearTimeout(probe)
  }

  afterEach(() => {
    process.exit = originals.exit
    process.kill = originals.kill
    if (timerProto && nativeUnref) timerProto.unref = nativeUnref
    if (prepareStackTrace !== undefined) Error.prepareStackTrace = prepareStackTrace
    process.exitCode = undefined
  })

  function withFakeStack(stack: string, fn: () => void) {
    const previous = Error.prepareStackTrace
    Error.prepareStackTrace = () => stack
    try {
      fn()
    } finally {
      Error.prepareStackTrace = previous
    }
  }

  it('restores process.exit, process.kill, and Timer.unref after restore()', () => {
    captureTimerProto()
    const beforeExit = process.exit
    const beforeKill = process.kill
    const beforeUnref = timerProto.unref

    const restore = installPerfHostWorkarounds()
    expect(process.exit).not.toBe(beforeExit)
    expect(process.kill).not.toBe(beforeKill)
    expect(timerProto.unref).not.toBe(beforeUnref)

    restore()
    expect(process.exit).toBe(beforeExit)
    expect(process.kill).toBe(beforeKill)
    expect(timerProto.unref).toBe(beforeUnref)
  })

  it('withPerfHostWorkarounds restores globals when the body throws', async () => {
    captureTimerProto()
    const beforeExit = process.exit
    const beforeKill = process.kill
    const beforeUnref = timerProto.unref

    await expect(
      withPerfHostWorkarounds(async () => {
        throw new Error('boom')
      }),
    ).rejects.toThrow('boom')

    expect(process.exit).toBe(beforeExit)
    expect(process.kill).toBe(beforeKill)
    expect(timerProto.unref).toBe(beforeUnref)
  })

  it('withPerfHostWorkarounds restores globals on success', async () => {
    captureTimerProto()
    const beforeExit = process.exit
    const beforeKill = process.kill
    const beforeUnref = timerProto.unref

    const value = await withPerfHostWorkarounds(async () => {
      expect(process.exit).not.toBe(beforeExit)
      return 42
    })
    expect(value).toBe(42)
    expect(process.exit).toBe(beforeExit)
    expect(process.kill).toBe(beforeKill)
    expect(timerProto.unref).toBe(beforeUnref)
  })

  it('swallows process.exit from an artillery-like stack and sets exitCode', () => {
    const restore = installPerfHostWorkarounds()
    try {
      withFakeStack('Error\n    at Object.suggestedExitCode (artillery/lib/runner.js:1:1)', () => {
        process.exit(7)
      })
      expect(process.exitCode).toBe(7)
    } finally {
      restore()
    }
  })

  it('no-ops Timer.unref when the caller stack mentions untestutils', () => {
    captureTimerProto()
    const restore = installPerfHostWorkarounds()
    try {
      withFakeStack('Error\n    at stop (untestutils/dist/host.js:1:1)', () => {
        const t = setTimeout(() => {}, 50)
        expect(t.unref()).toBe(t)
        clearTimeout(t)
      })
    } finally {
      restore()
    }
  })

  it('rewrites negative pid kill to leader-only for untestutils stacks', () => {
    const killSpy = vi.fn(() => true) as unknown as typeof process.kill
    process.kill = killSpy
    const restore = installPerfHostWorkarounds()
    try {
      withFakeStack('Error\n    at teardown (@untestutils/core/host.js:10:1)', () => {
        process.kill(-12345, 'SIGTERM')
      })
      expect(killSpy).toHaveBeenCalledWith(12345, 'SIGTERM')
    } finally {
      restore()
    }
  })

  it('leaves negative pid kill as a process-group signal outside untestutils stacks', () => {
    const killSpy = vi.fn(() => true) as unknown as typeof process.kill
    process.kill = killSpy
    const restore = installPerfHostWorkarounds()
    try {
      withFakeStack('Error\n    at other (app/cleanup.js:1:1)', () => {
        process.kill(-99, 'SIGTERM')
      })
      expect(killSpy).toHaveBeenCalledWith(-99, 'SIGTERM')
    } finally {
      restore()
    }
  })
})
