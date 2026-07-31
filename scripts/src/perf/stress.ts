import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import http from 'node:http'
import { join } from 'node:path'
import { repoRoot } from '../utils/workspace'
import { getProcessUsage } from './format'
import { ARTILLERY_SECONDS, AUTOCANNON_SECONDS, type PerfProgress } from './progress'
import type { ArtilleryResult, AutocannonResult, PerformanceResult } from './types'

const tempOutputDir = join(repoRoot, 'test/.perf-output')
const STRESS_PORT = 10000

function ensureTempDir(): void {
  if (!existsSync(tempOutputDir)) mkdirSync(tempOutputDir, { recursive: true })
}

async function waitForServer(port: number, timeout = 30000): Promise<void> {
  const startTime = Date.now()
  return new Promise((resolve, reject) => {
    const check = () => {
      if (Date.now() - startTime > timeout) {
        return reject(new Error(`Server on port ${port} did not start within ${timeout}ms`))
      }

      const req = http.get(`http://localhost:${port}`, (res) => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
          console.log(`Server on port ${port} is ready.`)
          res.destroy()
          resolve()
        } else {
          res.destroy()
          setTimeout(check, 500)
        }
      })

      req.on('error', () => {
        req.destroy()
        setTimeout(check, 500)
      })
    }
    check()
  })
}

export async function runAutocannonTest(port: number, progress?: PerfProgress, duration = AUTOCANNON_SECONDS, connections = 10): Promise<AutocannonResult> {
  ensureTempDir()
  progress?.note(`Autocannon: ${connections} connections × ${duration}s → http://localhost:${port}`)
  const stopBeat = progress?.heartbeat('autocannon', duration)

  return new Promise((resolve, reject) => {
    const outputFile = join(tempOutputDir, `autocannon-output-${port}.json`)
    const child = spawn('npx', ['autocannon', '-c', String(connections), '-d', String(duration), '-j', `http://localhost:${port}`], {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })

    child.on('error', (error) => {
      stopBeat?.()
      reject(error)
    })
    child.on('close', (code) => {
      stopBeat?.()
      if (code !== 0 && !stdout) {
        console.error(`Autocannon failed (exit ${code}): ${stderr}`)
        return reject(new Error(`autocannon exited ${code}`))
      }
      try {
        const result = JSON.parse(stdout) as AutocannonResult
        writeFileSync(outputFile, JSON.stringify(result, null, 2))
        progress?.note(`Autocannon done: ${result.requests.average.toFixed(1)} RPS, ${result.latency.average.toFixed(1)} ms avg`)
        resolve(result)
      } catch (e) {
        console.error('Failed to parse autocannon output:', stdout.slice(0, 500))
        reject(e)
      }
    })
  })
}

export async function runArtilleryTest(configPath: string, outputName: string, progress?: PerfProgress): Promise<ArtilleryResult> {
  ensureTempDir()
  const outputFile = join(tempOutputDir, `artillery-output-${outputName}.json`)
  progress?.note(`Artillery: ${ARTILLERY_SECONDS}s total (6s warm-up @6 VU/s + 60s main @60 VU/s) → ${configPath}`)
  const stopBeat = progress?.heartbeat('artillery', ARTILLERY_SECONDS)

  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['artillery', 'run', configPath, '--output', outputFile], {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    // Keep artillery quieter in the main log; heartbeat covers progress.
    child.stdout.on('data', (chunk: Buffer) => {
      const line = chunk.toString().trim()
      if (line.includes('Phase started') || line.includes('Summary report') || line.includes('All VUs finished')) {
        console.log(`  [artillery] ${line.split('\n')[0]}`)
      }
    })
    child.stderr.on('data', (chunk: Buffer) => {
      const line = chunk.toString().trim()
      if (line) console.error(`  [artillery stderr] ${line.slice(0, 200)}`)
    })

    child.on('error', (error) => {
      stopBeat?.()
      reject(error)
    })
    child.on('close', (code) => {
      stopBeat?.()
      if (code !== 0) {
        return reject(new Error(`Artillery exited with code ${code}`))
      }
      try {
        const result = JSON.parse(readFileSync(outputFile, 'utf8')) as ArtilleryResult
        const rps = result.aggregate.rates['http.request_rate'] || 0
        progress?.note(`Artillery done: ${rps.toFixed(1)} RPS`)
        resolve(result)
      } catch (err) {
        reject(err)
      }
    })
  })
}

/** Start built server → Autocannon → Artillery → return metrics (no report writing). */
export async function stressTestServer(
  directory: string,
  name: string,
  artilleryConfigPath: string,
  progress?: PerfProgress,
): Promise<PerformanceResult> {
  progress?.note(`Starting Nitro server for ${name} on :${STRESS_PORT}`)

  const controller = new AbortController()
  const { signal } = controller
  const port = STRESS_PORT

  const childProcess = spawn('node', ['.output/server/index.mjs'], {
    cwd: directory,
    signal,
    env: {
      ...process.env,
      PORT: port.toString(),
      NODE_ENV: 'production',
      NITRO_PRESET: 'node-server',
    },
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const pid = childProcess.pid ?? 0

  childProcess.stdout?.on('data', (data: Buffer) => console.log(`[Server ${name}]: ${data.toString().trim()}`))
  childProcess.stderr?.on('data', (data: Buffer) => console.error(`[Server ${name} stderr]: ${data.toString().trim()}`))

  childProcess.on('error', (error: NodeJS.ErrnoException) => {
    if (error.name === 'AbortError' || error.code === 'ABORT_ERR') return
  })

  let maxCpuUsage = 0
  let minCpuUsage = Infinity
  let totalCpuUsage = 0
  let maxMemoryUsed = 0
  let minMemoryUsed = Infinity
  let totalMemoryUsage = 0
  let cpuUsageSamples = 0

  const monitorInterval = setInterval(() => {
    try {
      const usage = getProcessUsage(pid)
      if (!usage) return

      const { cpu, memory } = usage

      maxCpuUsage = Math.max(maxCpuUsage, cpu)
      minCpuUsage = Math.min(minCpuUsage, cpu)
      totalCpuUsage += cpu
      maxMemoryUsed = Math.max(maxMemoryUsed, memory)
      minMemoryUsed = Math.min(minMemoryUsed, memory)
      totalMemoryUsage += memory
      cpuUsageSamples++
    } catch {
      // Ignore
    }
  }, 1000)

  try {
    await waitForServer(port)

    progress?.start(`autocannon · ${name}`, AUTOCANNON_SECONDS)
    const autocannonResults = await runAutocannonTest(port, progress)

    progress?.start(`artillery · ${name}`, ARTILLERY_SECONDS)
    const artilleryResults = await runArtilleryTest(artilleryConfigPath, name, progress)

    const summary = artilleryResults.aggregate
    const stressTestTime = (summary.lastMetricAt - summary.firstMetricAt) / 1000
    const avgResponseTime = summary.summaries['http.response_time']?.mean || 0
    const responseTimeMin = summary.summaries['http.response_time']?.min || 0
    const responseTimeMax = summary.summaries['http.response_time']?.max || 0
    const responseTimeP50 = summary.summaries['http.response_time']?.p50 || 0
    const responseTimeP95 = summary.summaries['http.response_time']?.p95 || 0
    const responseTimeP99 = summary.summaries['http.response_time']?.p99 || 0
    const requestsPerSecond = summary.rates['http.request_rate'] || 0
    const errorRate =
      summary.counters['http.codes.500'] && summary.counters['http.requests']
        ? ((summary.counters['http.codes.500'] as number) / (summary.counters['http.requests'] as number)) * 100
        : 0

    const avgCpuUsage = cpuUsageSamples > 0 ? totalCpuUsage / cpuUsageSamples : 0
    const avgMemoryUsed = cpuUsageSamples > 0 ? totalMemoryUsage / cpuUsageSamples : 0

    progress?.note(
      `${name} stress: artillery ${requestsPerSecond.toFixed(0)} RPS / ${avgResponseTime.toFixed(0)} ms · autocannon ${autocannonResults.requests.average.toFixed(0)} RPS / ${autocannonResults.latency.average.toFixed(0)} ms`,
    )

    return {
      buildTime: stressTestTime,
      maxCpuUsage,
      minCpuUsage: Number.isFinite(minCpuUsage) ? minCpuUsage : 0,
      avgCpuUsage,
      maxMemoryUsed,
      minMemoryUsed: Number.isFinite(minMemoryUsed) ? minMemoryUsed : 0,
      avgMemoryUsed,
      stressTestTime,
      responseTimeAvg: avgResponseTime,
      responseTimeMin,
      responseTimeMax,
      responseTimeP50,
      responseTimeP95,
      responseTimeP99,
      requestsPerSecond,
      errorRate,
      autocannon: autocannonResults,
      artillery: artilleryResults,
    }
  } catch (error) {
    clearInterval(monitorInterval)
    console.error(`Stress test failed for ${name}:`, error)
    throw error
  } finally {
    clearInterval(monitorInterval)
    progress?.note(`Stopping server for ${name}`)
    try {
      controller.abort()
      if (childProcess.pid) {
        try {
          process.kill(childProcess.pid, 'SIGTERM')
        } catch {
          // Ignore
        }
      }
    } catch {
      // Ignore
    }
  }
}

export function artilleryConfigPath(): string {
  return join(repoRoot, 'benchmark/artillery-config.yml')
}
