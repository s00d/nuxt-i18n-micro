import { type ChildProcess, spawn } from 'node:child_process'

const VITEST_ENV_KEYS = ['VITEST', 'VITE_TEST_BUILD', 'TEST', 'JEST'] as const

/** Env for spawned Nuxt/serve processes — strip Vitest markers, force production. */
export function productionEnv(extra: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, ...extra, NODE_ENV: 'production' }
  for (const key of VITEST_ENV_KEYS) delete env[key]
  return env
}

/**
 * Run a one-shot command inside a Vitest fork worker.
 * Stdio is piped (not inherited) so child output does not interfere with tinypool IPC.
 */
export function runCommand(command: string, args: readonly string[], options: { cwd: string; env?: NodeJS.ProcessEnv }): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: productionEnv(options.env),
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stderr = ''
    child.stderr?.on('data', (chunk: Buffer | string) => {
      stderr += chunk.toString()
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      const tail = stderr.trim().slice(-2000)
      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}${tail ? `\n${tail}` : ''}`))
    })
  })
}

/**
 * Spawn a long-lived server (serve, node .output/server/...).
 * Must stay attached to the worker — no detached/unref.
 */
export function spawnServer(command: string, args: readonly string[], options: { cwd: string; env?: NodeJS.ProcessEnv }): ChildProcess {
  return spawn(command, args, {
    cwd: options.cwd,
    env: productionEnv(options.env),
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

/** Gracefully stop a spawned child (SIGTERM → SIGKILL). */
export async function stopChild(child: ChildProcess | null | undefined, graceMs = 3000): Promise<void> {
  if (!child || child.killed || child.exitCode !== null) return

  await new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      try {
        child.kill('SIGKILL')
      } catch {
        /* already gone */
      }
    }, graceMs)

    child.once('exit', () => {
      clearTimeout(timer)
      resolve()
    })

    try {
      child.kill('SIGTERM')
    } catch {
      clearTimeout(timer)
      resolve()
    }
  })
}
