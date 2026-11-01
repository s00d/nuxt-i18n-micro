import { spawn, spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from '@playwright/test'
import { defineCommand } from 'citty'
import { repoRoot } from '../utils/workspace'
import { CONSUMER_INSTALL, packWorkspace, writeConsumerProject } from './smoke-pack'

/**
 * The oldest versions the manifests claim. Each is a real install of the packed packages, so a
 * range that only holds on paper fails here.
 *
 * Nuxt is the latest 3.18 patch: `nuxt generate` on a fresh 3.18.0 fails with
 * `[unstorage] Invalid key: "/"`, and plain Nuxt 3.18.0 fails the same way, so that one is upstream.
 * This target uses `nuxt build`, which the floor passes.
 */
export const FLOORS = {
  nuxt: { nuxt: '~3.18.0', '@nuxt/kit': '~3.18.0', vue: '3.5.18', 'vue-router': '4.5.1' },
  vitepress: { vitepress: '1.0.0' },
  vue: { vue: '3.3.13', 'vue-router': '4.5.1' },
}

type Target = keyof typeof FLOORS
type Tarballs = Record<string, string>

function step(cwd: string, command: string, args: string[], timeoutMs: number, env: NodeJS.ProcessEnv = {}): void {
  const result = spawnSync(command, args, {
    cwd,
    stdio: ['ignore', 'inherit', 'inherit'],
    timeout: timeoutMs,
    env: { ...process.env, CI: '1', ...env },
  })
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed: ${result.error?.message ?? `exit ${result.status}`}`)
}

const install = (app: string) => step(app, 'pnpm', CONSUMER_INSTALL, 280_000)

const writeManifest = (app: string, dependencies: Record<string, string>, ours: Tarballs) =>
  writeConsumerProject(app, dependencies, { ...ours, ...dependencies })

async function waitFor(url: string): Promise<void> {
  for (let tries = 0; tries < 60; tries++) {
    const up = await fetch(url, { redirect: 'manual' }).catch(() => null)
    if (up) return
    await new Promise((done) => setTimeout(done, 500))
  }
  throw new Error(`${url} never answered`)
}

async function nuxtFloor(app: string, ours: Tarballs): Promise<void> {
  cpSync(join(repoRoot, 'test/deploy-smoke'), app, { recursive: true, filter: (from) => !/node_modules|\.nuxt|\.output/.test(from) })
  // Nuxt 3 reads the project root, not `app/`
  cpSync(join(app, 'app'), app, { recursive: true })
  rmSync(join(app, 'app'), { recursive: true, force: true })
  writeManifest(app, { ...FLOORS.nuxt, 'nuxt-i18n-micro': ours['nuxt-i18n-micro']! }, ours)
  install(app)
  step(app, join(app, 'node_modules/.bin/nuxt'), ['build'], 280_000)

  const port = '3517'
  const url = `http://127.0.0.1:${port}`
  const server = spawn('node', ['.output/server/index.mjs'], {
    cwd: app,
    stdio: 'inherit',
    env: { ...process.env, PORT: port, NITRO_HOST: '127.0.0.1' },
  })
  try {
    await waitFor(url)
    step(repoRoot, 'pnpm', ['-C', 'scripts', 'cli', 'smoke-verify', '--url', url], 110_000)
    step(repoRoot, 'pnpm', ['-C', 'scripts', 'cli', 'smoke-browser', '--url', url], 110_000)
  } finally {
    server.kill()
  }
}

async function vitepressFloor(app: string, ours: Tarballs): Promise<void> {
  writeManifest(app, { ...FLOORS.vitepress, '@i18n-micro/vitepress': ours['@i18n-micro/vitepress']! }, ours)
  const playground = join(repoRoot, 'packages/vitepress/playground')
  for (const part of ['index.md', 'de', 'fr', 'locales', 'guide/demo.md', 'guide/no-seo.md'])
    cpSync(join(playground, part), join(app, part), { recursive: true })
  mkdirSync(join(app, '.vitepress/theme'), { recursive: true })
  const config = readFileSync(join(playground, '.vitepress/config.mts'), 'utf8')
  writeFileSync(
    join(app, '.vitepress/config.mts'),
    config.replace(/^import \{ datetimeFormats, numberFormats \} from .*$/m, 'const datetimeFormats = {}, numberFormats = {}'),
  )
  writeFileSync(
    join(app, '.vitepress/theme/index.ts'),
    `import DefaultTheme from 'vitepress/theme'
import { defineI18nTheme } from '@i18n-micro/vitepress/theme'
export default defineI18nTheme(DefaultTheme, { enhanceApp({ app }) { for (const name of ['PathHelpersDemo', 'BenchPage']) app.component(name, { render: () => null }) } })
`,
  )
  install(app)
  step(app, join(app, 'node_modules/.bin/vitepress'), ['build', '.'], 200_000)

  const port = '3518'
  const url = `http://127.0.0.1:${port}`
  const server = spawn(join(app, 'node_modules/.bin/vitepress'), ['preview', '.', '--port', port], { cwd: app, stdio: 'ignore' })
  const browser = await chromium.launch()
  try {
    await waitFor(url)
    const page = await browser.newPage()
    const problems: string[] = []
    page.on('pageerror', (error) => problems.push(error.message))
    for (const [path, want] of [
      ['/guide/demo', 'en'],
      ['/de/guide/demo', 'de'],
      ['/fr/guide/demo', 'fr'],
    ] as const) {
      await page.goto(`${url}${path}`)
      await page.waitForFunction((code) => document.querySelector('main')?.textContent?.includes(`: ${code}`), want, { timeout: 10_000 })
    }
    // a client navigation goes through the route hook, not through the first render
    await page.goto(`${url}/de/guide/demo`)
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => document.querySelector<HTMLAnchorElement>('a[href="/fr/guide/demo"]')?.click())
    await page.waitForFunction(() => location.pathname === '/fr/guide/demo' && document.querySelector('main')?.textContent?.includes(': fr'), null, {
      timeout: 10_000,
    })
    if (problems.length) throw new Error(`page errors: ${problems.join(' | ')}`)
  } finally {
    await browser.close()
    server.kill()
  }
}

async function vueFloor(app: string, ours: Tarballs): Promise<void> {
  writeManifest(app, { ...FLOORS.vue, '@i18n-micro/vue': ours['@i18n-micro/vue']! }, ours)
  writeFileSync(
    join(app, 'check.mjs'),
    `import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createI18n, useI18n, I18nT } from '@i18n-micro/vue'
import '@i18n-micro/vue/router'
const i18n = createI18n({ locale: 'de', fallbackLocale: 'en', defaultLocale: 'en', locales: [{ code: 'en' }, { code: 'de' }], messages: { en: { g: 'Hi {name}' }, de: { g: 'Hallo {name}' } }, missingWarn: false })
const app = createSSRApp({ setup() { const { t } = useI18n(); return () => h('p', [t('g', { name: 'Ada' }), h(I18nT, { keypath: 'g', params: { name: 'B' } })]) } })
app.use(i18n)
const html = await renderToString(app)
if (!html.includes('Hallo Ada') || !html.includes('Hallo B')) throw new Error(html)
console.log(html)
`,
  )
  install(app)
  step(app, 'node', ['check.mjs'], 30_000)
}

const TARGETS: Record<Target, (app: string, ours: Tarballs) => Promise<void>> = { nuxt: nuxtFloor, vitepress: vitepressFloor, vue: vueFloor }

export const oldestVersionsCommand = defineCommand({
  meta: {
    name: 'oldest-versions',
    description: [
      'Install the packed packages on the oldest versions their peer ranges name, then run them.',
      '',
      'Needs `dist` built everywhere (`pnpm run prepack`), the network, and Chromium',
      '(`pnpm exec playwright install chromium`). Runs weekly in `.github/workflows/oldest-versions.yml`.',
      '',
      'Examples:',
      '  pnpm run check:oldest',
      '  pnpm run check:oldest --target vitepress --dir /tmp/oldest',
    ].join('\n'),
  },
  args: {
    target: { type: 'string', default: 'all', description: `One of ${Object.keys(TARGETS).join(', ')}, or all` },
    dir: { type: 'string', description: 'Working directory (default: a new temp folder)' },
  },
  async setup({ args }) {
    const root = args.dir ?? mkdtempSync(join(tmpdir(), 'i18n-oldest-'))
    const targets = args.target === 'all' ? (Object.keys(TARGETS) as Target[]) : [args.target as Target]
    const unknown = targets.find((target) => !TARGETS[target])
    if (unknown) throw new Error(`Unknown target ${unknown}`)

    const tarballs = packWorkspace(join(root, 'tarballs'), { ignoreScripts: true })
    const ours = Object.fromEntries(tarballs.map(({ name, tarball }) => [name, `file:${tarball}`]))
    for (const target of targets) {
      const app = join(root, target)
      if (existsSync(app)) rmSync(app, { recursive: true, force: true })
      await TARGETS[target](app, ours)
      console.log(`ok ${target}: ${JSON.stringify(FLOORS[target])}`)
    }
    if (!args.dir) rmSync(root, { recursive: true, force: true })
  },
})
