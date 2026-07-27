import { execFileSync, spawn } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { defineCommand } from 'citty'
import { dirSize, walkFiles } from '../utils/fs-walk'
import { repoRoot } from '../utils/workspace'

export interface RouteMeasurement {
  route: string
  html: number
  nuxtData: number
}

export interface PayloadMeasurement {
  app: string
  routes: RouteMeasurement[]
  maxNuxtData: number
  totalNuxtData: number
  /** Bytes of translation JSON served as separate, cacheable files. */
  payloadFiles: number
  /** Bytes of everything else in the client output. */
  clientAssets: number
  /** Size of the translation sources this app was built from. */
  sourceDictionary: number
}

export interface Budget {
  app: string
  routes: string[]
  limits: {
    maxNuxtData: number
    totalNuxtData: number
    clientAssets: number
  }
  /** Recorded for context; not enforced. */
  observed?: Record<string, number>
}

const BUDGET_FILE = 'scripts/payload-budget.json'

/** `__NUXT_DATA__` is the hydration payload; the dictionary leaking into it is the regression. */
const NUXT_DATA_RE = /<script[^>]+id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/

export function nuxtDataBytes(html: string): number {
  const match = NUXT_DATA_RE.exec(html)
  return match ? Buffer.byteLength(match[1]!, 'utf8') : 0
}

/** Translation payloads are served from their own route; everything else is app code. */
function splitClientOutput(publicDir: string): { payloadFiles: number; clientAssets: number } {
  let payloadFiles = 0
  let clientAssets = 0

  for (const file of walkFiles(publicDir, { skipDirs: new Set() })) {
    const size = Buffer.byteLength(readFileSync(join(publicDir, file)))
    if (file.startsWith('_locales/') || /(^|\/)locales\//.test(file)) payloadFiles += size
    else clientAssets += size
  }
  return { payloadFiles, clientAssets }
}

/** Refuse to measure whatever is already answering on the port — it is not this build. */
async function assertPortFree(base: string): Promise<void> {
  try {
    await fetch(base, { signal: AbortSignal.timeout(1500) })
  } catch {
    return
  }
  throw new Error(`something is already listening at ${base}; stop it or pass --port`)
}

async function waitForServer(base: string, attempts = 90): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    try {
      // Polling is sequential by definition: each attempt exists because the previous
      // one failed, so there is nothing to run in parallel.
      // oxlint-disable-next-line no-await-in-loop -- see above
      await fetch(base, { signal: AbortSignal.timeout(2000) })
      return
    } catch {
      // oxlint-disable-next-line no-await-in-loop -- see above
      await sleep(1000)
    }
  }
  throw new Error(`server did not answer at ${base}`)
}

async function measure(appDir: string, app: string, routes: string[], port: number): Promise<PayloadMeasurement> {
  const outputDir = join(appDir, '.output')
  const base = `http://127.0.0.1:${port}`

  const server = spawn('node', [join(outputDir, 'server/index.mjs')], {
    env: { ...process.env, PORT: String(port), NITRO_PORT: String(port), HOST: '127.0.0.1' },
    stdio: 'ignore',
  })

  try {
    await waitForServer(base, 60)

    const measured: RouteMeasurement[] = []
    for (const route of routes) {
      // Sequential on purpose: a burst of concurrent renders makes the server allocate
      // differently, and one route's payload should not depend on what else is in flight.
      // oxlint-disable-next-line no-await-in-loop -- see above
      const response = await fetch(`${base}${route}`, { signal: AbortSignal.timeout(60_000) })
      // oxlint-disable-next-line no-await-in-loop -- see above
      const html = await response.text()
      // A 404 or a 500 page is small, so measuring it would quietly report a healthy
      // budget for a build that does not work.
      if (!response.ok) throw new Error(`${route} responded ${response.status}; the build is not serving that route`)
      measured.push({ route, html: Buffer.byteLength(html, 'utf8'), nuxtData: nuxtDataBytes(html) })
    }

    const { payloadFiles, clientAssets } = splitClientOutput(join(outputDir, 'public'))
    const localesDir = join(appDir, 'locales')

    return {
      app,
      routes: measured,
      maxNuxtData: Math.max(0, ...measured.map((r) => r.nuxtData)),
      totalNuxtData: measured.reduce((sum, r) => sum + r.nuxtData, 0),
      payloadFiles,
      clientAssets,
      sourceDictionary: existsSync(localesDir) ? dirSize(localesDir) : 0,
    }
  } finally {
    server.kill('SIGTERM')
  }
}

const kb = (bytes: number): string => `${(bytes / 1024).toFixed(1)} KB`

export const payloadBudgetCommand = defineCommand({
  meta: {
    name: 'payload-budget',
    description: [
      'Build an app and fail when its hydration payload grows past an agreed budget.',
      '',
      'The module keeps the translation dictionary out of the HTML: only the keys a page',
      'actually rendered go into `__NUXT_DATA__`, and the full dictionary is fetched as a',
      'separate cacheable file. Nothing else notices when that breaks — a page with the',
      'whole dictionary inlined renders correctly and passes every test, it is just',
      'megabytes heavier. Hence a budget.',
      '',
      'The playground is the default target because its dictionary is deliberately huge,',
      'so an inlining regression is unmissable rather than marginal.',
      '',
      'Examples:',
      '  pnpm -C scripts cli payload-budget',
      '  pnpm -C scripts cli payload-budget --skip-build   # reuse the existing .output',
      '  pnpm -C scripts cli payload-budget --update       # record the current numbers',
    ].join('\n'),
  },
  args: {
    app: { type: 'string', description: 'App directory to build (default: from the budget file)' },
    port: { type: 'string', default: '3999', description: 'Port for the built server' },
    skipBuild: { type: 'boolean', default: false, description: 'Reuse an existing .output' },
    update: { type: 'boolean', default: false, description: 'Write the measured numbers as the new budget' },
    tolerance: { type: 'string', default: '10', description: 'Headroom in percent when writing a budget' },
    json: { type: 'boolean', default: false, description: 'Print machine-readable output' },
  },
  async setup({ args }) {
    const port = Number(args.port)
    const tolerance = Number(args.tolerance)
    if (!Number.isFinite(port) || port <= 0) {
      console.error(`--port must be a number, got "${args.port}"`)
      process.exit(1)
    }
    if (!Number.isFinite(tolerance) || tolerance < 0) {
      console.error(`--tolerance must be a non-negative number, got "${args.tolerance}"`)
      process.exit(1)
    }

    const budgetPath = join(repoRoot, BUDGET_FILE)
    const existing: Budget | null = existsSync(budgetPath) ? (JSON.parse(readFileSync(budgetPath, 'utf8')) as Budget) : null

    const app = args.app ?? existing?.app ?? 'playground'
    const routes = existing?.routes ?? ['/', '/de']
    const appDir = join(repoRoot, app)

    if (!existsSync(appDir)) {
      console.error(`No app at ${appDir}`)
      process.exit(1)
    }

    if (!args.skipBuild) {
      console.log(`Building ${app} …`)
      execFileSync('pnpm', ['exec', 'nuxt', 'build'], { cwd: appDir, stdio: 'inherit' })
    }

    await assertPortFree(`http://127.0.0.1:${port}`)
    const measurement = await measure(appDir, app, routes, port)

    if (args.update) {
      const headroom = 1 + tolerance / 100
      const budget: Budget = {
        app,
        routes,
        limits: {
          maxNuxtData: Math.ceil(measurement.maxNuxtData * headroom),
          totalNuxtData: Math.ceil(measurement.totalNuxtData * headroom),
          clientAssets: Math.ceil(measurement.clientAssets * headroom),
        },
        observed: {
          maxNuxtData: measurement.maxNuxtData,
          totalNuxtData: measurement.totalNuxtData,
          clientAssets: measurement.clientAssets,
          payloadFiles: measurement.payloadFiles,
          sourceDictionary: measurement.sourceDictionary,
        },
      }
      writeFileSync(budgetPath, `${JSON.stringify(budget, null, 2)}\n`)
      console.log(`Wrote ${BUDGET_FILE} with ${args.tolerance}% headroom.`)
      return
    }

    if (!existing) {
      console.error(`No budget at ${BUDGET_FILE}. Run with --update to record one.`)
      process.exit(1)
    }

    const overruns = (['maxNuxtData', 'totalNuxtData', 'clientAssets'] as const)
      .map((key) => ({ key, actual: measurement[key], limit: existing.limits[key] }))
      .filter((check) => check.actual > check.limit)

    if (args.json) {
      console.log(JSON.stringify({ measurement, limits: existing.limits, overruns }, null, 2))
    } else {
      console.log(`\n${app}: dictionary on disk ${kb(measurement.sourceDictionary)}, served as payload files ${kb(measurement.payloadFiles)}\n`)
      for (const route of measurement.routes) {
        console.log(`  ${route.route.padEnd(12)} html ${kb(route.html).padStart(10)}   __NUXT_DATA__ ${kb(route.nuxtData).padStart(10)}`)
      }
      console.log()
      for (const key of ['maxNuxtData', 'totalNuxtData', 'clientAssets'] as const) {
        const over = measurement[key] > existing.limits[key]
        console.log(`  ${over ? 'x' : 'ok'} ${key.padEnd(14)} ${kb(measurement[key]).padStart(10)} / ${kb(existing.limits[key]).padStart(10)}`)
      }
      if (overruns.length > 0) {
        console.log(
          `\nOver budget. If the growth is intended, run with --update; if not, the dictionary is probably being inlined into the HTML again.`,
        )
      } else {
        console.log('\nWithin budget.')
      }
    }

    if (overruns.length > 0) process.exit(1)
  },
})
