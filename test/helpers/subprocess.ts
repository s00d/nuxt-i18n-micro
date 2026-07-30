import { type ChildProcess, exec as execCb, spawn } from 'node:child_process'
import { promisify } from 'node:util'

const exec = promisify(execCb)

const VITEST_ENV_KEYS = ['VITEST', 'VITE_TEST_BUILD', 'TEST', 'JEST'] as const

/** Env for spawned Nuxt/serve processes — strip Vitest markers, force production. */
export function productionEnv(extra: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, ...extra, NODE_ENV: 'production' }
  for (const key of VITEST_ENV_KEYS) delete env[key]
  return env
}

function shellQuote(arg: string): string {
  if (/^[A-Za-z0-9_./:=+-]+$/.test(arg)) return arg
  return `'${arg.replace(/'/g, `'\\''`)}'`
}

/**
 * Run a one-shot command inside a Vitest worker.
 * Uses exec (buffered) so nuxi/npm cannot deadlock on a full stdout pipe.
 */
export async function runCommand(
  command: string,
  args: readonly string[],
  options: { cwd: string; env?: NodeJS.ProcessEnv; timeoutMs?: number },
): Promise<void> {
  const cmd = [command, ...args].map(shellQuote).join(' ')

  try {
    await exec(cmd, {
      cwd: options.cwd,
      env: productionEnv(options.env),
      maxBuffer: 20 * 1024 * 1024,
      timeout: options.timeoutMs ?? 300_000,
    })
  } catch (err: unknown) {
    const e = err as { code?: number | string; killed?: boolean; signal?: string; stdout?: string; stderr?: string; message?: string }
    const tail = ((e.stdout || '') + (e.stderr || '')).trim().slice(-2000)
    const reason = e.killed ? `timed out or killed (${e.signal || 'signal'})` : `exited with code ${e.code ?? 'unknown'}`
    throw new Error(`${cmd} ${reason}${tail ? `\n${tail}` : ''}`)
  }
}

/**
 * Spawn a long-lived server (serve, node .output/server/...).
 * Stdio is ignored so request logs cannot fill pipes and block the server.
 */
export function spawnServer(command: string, args: readonly string[], options: { cwd: string; env?: NodeJS.ProcessEnv }): ChildProcess {
  return spawn(command, args, {
    cwd: options.cwd,
    env: productionEnv(options.env),
    stdio: 'ignore',
    // Own process group on Unix so stopChild can kill npx → serve trees.
    detached: process.platform !== 'win32',
  })
}

/** Gracefully stop a spawned child and its process group (SIGTERM → SIGKILL). */
export async function stopChild(child: ChildProcess | null | undefined, graceMs = 3000): Promise<void> {
  if (!child || child.killed || child.exitCode !== null) return

  const pid = child.pid
  if (!pid) return

  const signalGroup = (signal: NodeJS.Signals) => {
    if (process.platform !== 'win32') {
      try {
        process.kill(-pid, signal)
        return
      } catch {
        /* fall through */
      }
    }
    try {
      child.kill(signal)
    } catch {
      /* already gone */
    }
  }

  await new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      signalGroup('SIGKILL')
    }, graceMs)

    child.once('exit', () => {
      clearTimeout(timer)
      resolve()
    })

    signalGroup('SIGTERM')
  })
}
