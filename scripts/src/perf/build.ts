import { spawn } from 'node:child_process'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { isTranslationFile } from '../../../test/helpers/is-translation-file'
import { formatBytes, getProcessUsage } from './format'
import type { BundleSize, PerformanceResult } from './types'

export function measureBundleSize(directory: string): BundleSize {
  const outputDir = join(directory, '.output')
  const clientDir = join(outputDir, 'public')
  const serverDir = join(outputDir, 'server')

  function getDirSizeWithSeparation(dir: string): { total: number; code: number; translations: number } {
    if (!existsSync(dir)) return { total: 0, code: 0, translations: 0 }

    let code = 0
    let translations = 0

    function walkDir(currentDir: string) {
      const files = readdirSync(currentDir, { withFileTypes: true })
      for (const file of files) {
        const filePath = join(currentDir, file.name)
        if (file.isDirectory()) {
          walkDir(filePath)
        } else {
          const fileSize = statSync(filePath).size
          if (isTranslationFile(filePath)) {
            translations += fileSize
          } else {
            code += fileSize
          }
        }
      }
    }

    walkDir(dir)
    return { total: code + translations, code, translations }
  }

  const clientStats = getDirSizeWithSeparation(clientDir)
  const serverStats = getDirSizeWithSeparation(serverDir)

  return {
    client: clientStats.total,
    server: serverStats.total,
    total: clientStats.total + serverStats.total,
    clientCode: clientStats.code,
    clientTranslations: clientStats.translations,
    serverCode: serverStats.code,
    serverTranslations: serverStats.translations,
    codeTotal: clientStats.code + serverStats.code,
    translationsTotal: clientStats.translations + serverStats.translations,
  }
}

export async function measureBuildPerformance(directory: string): Promise<PerformanceResult> {
  console.log(`Starting build performance test for ${directory}...`)

  const startTime = performance.now()
  let maxCpuUsage = 0
  let minCpuUsage = Infinity
  let totalCpuUsage = 0
  let maxMemoryUsed = 0
  let minMemoryUsed = Infinity
  let totalMemoryUsage = 0
  let cpuUsageSamples = 0

  const cleanEnv: Record<string, string> = {
    NODE_ENV: 'production',
    NODE_OPTIONS: '--max-old-space-size=16000',
    PATH: process.env.PATH || '',
    HOME: process.env.HOME || '',
    USER: process.env.USER || '',
    SHELL: process.env.SHELL || '',
    ...(process.env.PNPM_HOME && { PNPM_HOME: process.env.PNPM_HOME }),
    ...(process.env.PNPM_ROOT && { PNPM_ROOT: process.env.PNPM_ROOT }),
  }

  const childProcess = spawn('nuxi', ['build'], {
    cwd: directory,
    env: cleanEnv,
    stdio: 'pipe',
  })

  const pid = childProcess.pid ?? 0
  let lastStatusLog = 0

  childProcess.stdout.on('data', (data: Buffer) => {
    const text = data.toString().trim()
    // Keep high-signal Nuxt/Nitro lines; drop vite chunk spam
    if (/Building|built|ERROR|WARN|preset|complete|Nitro|Client|Server/i.test(text)) {
      console.log(`  [build] ${text.split('\n').pop()}`)
    }
  })

  childProcess.stderr.on('data', (data: Buffer) => {
    const text = data.toString().trim()
    if (text) console.error(`  [build stderr] ${text.slice(0, 240)}`)
  })

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

      const now = Date.now()
      if (now - lastStatusLog >= 5000) {
        lastStatusLog = now
        console.log(`  → build RSS ${memory.toFixed(0)} MB · CPU ${cpu.toFixed(0)}%`)
      }
    } catch {
      // Ignore
    }
  }, 1000)

  try {
    await new Promise<void>((resolve, reject) => {
      childProcess.on('close', (code) => {
        if (code === 0) resolve()
        else reject(new Error(`Build process exited with code ${code}`))
      })
      childProcess.on('error', reject)
    })

    const endTime = performance.now()
    const buildTime = (endTime - startTime) / 1000

    clearInterval(monitorInterval)

    const avgCpuUsage = cpuUsageSamples > 0 ? totalCpuUsage / cpuUsageSamples : 0
    const avgMemoryUsed = cpuUsageSamples > 0 ? totalMemoryUsage / cpuUsageSamples : 0
    const bundleSize = measureBundleSize(directory)

    console.log(`Build completed in: ${buildTime.toFixed(2)} seconds`)
    console.log(
      `Bundle size: ${formatBytes(bundleSize.total)} (client: ${formatBytes(bundleSize.client)}, server: ${formatBytes(bundleSize.server)})`,
    )

    return {
      buildTime,
      maxCpuUsage,
      minCpuUsage: Number.isFinite(minCpuUsage) ? minCpuUsage : 0,
      avgCpuUsage,
      maxMemoryUsed,
      minMemoryUsed: Number.isFinite(minMemoryUsed) ? minMemoryUsed : 0,
      avgMemoryUsed,
      bundleSize,
    }
  } catch (error) {
    clearInterval(monitorInterval)
    console.error('Build failed with error:', error)
    throw error
  }
}
