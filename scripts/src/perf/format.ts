import { execSync } from 'node:child_process'

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

export function getProcessUsage(pid: number): { cpu: number; memory: number } | null {
  try {
    const result = execSync(`ps -p ${pid} -o %cpu,rss`, { encoding: 'utf-8', stdio: 'pipe' }).toString()
    const lines = result.trim().split('\n')

    if (lines.length < 2 || !lines[1] || lines[1].trim() === '') {
      return null
    }

    const parts = lines[1].trim().split(/\s+/).map(Number.parseFloat)
    const cpu = parts[0]
    const memory = parts[1]

    return {
      cpu: cpu || 0,
      memory: memory ? memory / 1024 : 0,
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 1) {
      return null
    }
    return null
  }
}
