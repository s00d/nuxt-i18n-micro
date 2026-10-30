import { execFileSync } from 'node:child_process'
import { statSync } from 'node:fs'
import { totalmem, freemem, cpus, homedir, loadavg, release, tmpdir, type as osType } from 'node:os'
import { basename, join, relative, sep } from 'node:path'
import pkg from '../../package.json'
import { readJsonIfExists, walkFiles } from '../fs'
import { log } from '../log'
import { type ProjectConfig, loadProjectConfig } from '../nuxt'
import { formatBytes } from '../stats-report'

export interface InfoArgs {
  cwd?: string
  json?: boolean
  debug?: boolean
}

function git(rootDir: string, args: string[]): string | undefined {
  try {
    return execFileSync('git', args, { cwd: rootDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return undefined
  }
}

function translationStats(config: ProjectConfig) {
  const codes = new Set(config.locales.map((locale) => locale.code))
  const files = walkFiles(config.translationDir, (path) => path.endsWith('.json') && codes.has(basename(path, '.json')))
  const sized = files.map((path) => ({ path, stat: statSync(path) }))
  const filesByLocale: Record<string, { count: number; size: string }> = {}

  for (const code of codes) {
    const own = sized.filter(({ path }) => basename(path, '.json') === code)
    filesByLocale[code] = { count: own.length, size: formatBytes(own.reduce((sum, { stat }) => sum + stat.size, 0)) }
  }

  const largest = sized.reduce<(typeof sized)[number] | undefined>(
    (best, item) => (!best || item.stat.size > best.stat.size ? item : best),
    undefined,
  )
  return {
    totalFiles: sized.length,
    totalSize: formatBytes(sized.reduce((sum, { stat }) => sum + stat.size, 0)),
    filesByLocale,
    largestFile: largest ? { name: relative(config.translationDir, largest.path).split(sep).join('/'), size: formatBytes(largest.stat.size) } : null,
    lastModified: new Date(Math.max(0, ...sized.map(({ stat }) => stat.mtimeMs))).toISOString(),
  }
}

function buildSnapshot(config: ProjectConfig, debug: boolean) {
  const manifest = readJsonIfExists(join(config.rootDir, 'package.json'))
  const branch = git(config.rootDir, ['rev-parse', '--abbrev-ref', 'HEAD'])
  const total = totalmem()
  const used = total - freemem()

  return {
    cli: { name: pkg.name, version: pkg.version },
    project: {
      cwd: config.rootDir,
      translationDir: config.translationDir,
      translationDirs: config.translationDirs,
      defaultLocale: config.defaultLocale,
      locales: config.locales,
      totalLocales: config.locales.length,
      translationStats: translationStats(config),
      package: { name: manifest.name, version: manifest.version },
      git: branch ? { branch, commit: git(config.rootDir, ['rev-parse', '--short', 'HEAD']) } : undefined,
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpus: cpus().length,
      memory: { total: formatBytes(total), used: formatBytes(used), usagePercent: Math.round((used / total) * 100) },
      shell: process.env.SHELL,
    },
    debug: debug
      ? {
          pid: process.pid,
          execPath: process.execPath,
          os: { type: osType(), release: release(), homedir: homedir(), tmpdir: tmpdir(), loadavg: loadavg() },
        }
      : undefined,
  }
}

export default async function run(args: InfoArgs): Promise<void> {
  const config = await loadProjectConfig(args.cwd ?? '.')
  const info = buildSnapshot(config, Boolean(args.debug))
  if (args.json) {
    log.json(info)
    return
  }

  const { project, system } = info
  const { translationStats: stats } = project
  log.section('CLI')
  log.rows([['Version', `${info.cli.name} ${info.cli.version}`]])
  log.section('Project')
  log.rows([
    ['Root', project.cwd],
    ['Translation directory', project.translationDir],
    ['Default locale', project.defaultLocale],
    ['Locales', project.locales.map((locale) => locale.code).join(', ')],
    ['Files', stats.totalFiles],
    ['Size', stats.totalSize],
    ['Largest file', stats.largestFile ? `${stats.largestFile.name} (${stats.largestFile.size})` : 'none'],
    ['Last modified', stats.lastModified],
    ['Git', project.git ? `${project.git.branch} ${project.git.commit}` : 'none'],
  ])
  log.list(
    'Files by locale',
    Object.entries(stats.filesByLocale).map(([code, { count, size }]) => `${code}: ${count} files, ${size}`),
  )
  log.section('System')
  log.rows([
    ['Node', system.nodeVersion],
    ['Platform', `${system.platform} ${system.arch}`],
    ['CPUs', system.cpus],
    ['Memory', `${system.memory.used} / ${system.memory.total}`],
  ])
  if (info.debug) log.info(`\n${JSON.stringify(info.debug, null, 2)}`)
}
