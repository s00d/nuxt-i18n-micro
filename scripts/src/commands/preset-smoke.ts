import { defineCommand } from 'citty'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { repoRoot } from '../utils/workspace'
import { buildSmokeApp, installSmokeApp, PRESET_TARGETS, type PresetName, runSmokeVerify, startPresetRuntime } from '../utils/preset-runtime'

const PRESETS = Object.keys(PRESET_TARGETS) as PresetName[]

/** `--build-only`: every Nitro preset that builds a Nuxt app, not only those a runner can start here. */
const BUILD_ONLY_PRESETS = [
  'alwaysdata',
  'aws_amplify',
  'aws_lambda',
  'azure_functions',
  'azure_swa',
  'bun',
  'cleavr',
  'cli',
  'cloudflare_durable',
  'cloudflare_module',
  'cloudflare_module_legacy',
  'cloudflare_pages',
  'cloudflare_pages_static',
  'cloudflare_worker',
  'deno_deploy',
  'deno_server',
  'deno_server_legacy',
  'digital_ocean',
  'edgio',
  'firebase',
  'firebase_app_hosting',
  'flight_control',
  'genezio',
  'github_pages',
  'gitlab_pages',
  'heroku',
  'iis_handler',
  'iis_node',
  'koyeb',
  'netlify',
  'netlify_builder',
  'netlify_edge',
  'netlify_legacy',
  'netlify_static',
  'node_cluster',
  'node_listener',
  'node_server',
  'platform_sh',
  'render_com',
  'static',
  'stormkit',
  'vercel',
  'vercel_edge',
  'vercel_static',
  'winterjs',
  'zeabur',
  'zeabur_static',
  'zerops',
  'zerops_static',
]

function parsePresets(raw: string): PresetName[] {
  if (raw === 'all') return [...PRESETS]
  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean) as PresetName[]
  for (const p of list) {
    if (!PRESETS.includes(p)) {
      throw new Error(`Unknown preset "${p}". Use: ${PRESETS.join(', ')}, or all`)
    }
  }
  return list
}

export const presetSmokeCommand = defineCommand({
  meta: {
    name: 'preset-smoke',
    description: [
      'Tier-1 preset runtime checks (Nitro-style / vendor CLI).',
      '',
      'Packs the module, builds test/deploy-smoke with a real Nitro preset, starts the',
      'canonical local runner for that preset, then runs smoke-verify against the URL.',
      '',
      '  vercel            — import .vercel/output/functions/__fallback.func (as Nitro CI)',
      '  cloudflare_pages  — wrangler pages dev dist (Nitro commands.preview)',
      '  netlify           — import .netlify/functions-internal/server/main.mjs (fetch handler)',
      '  cloudflare_module — wrangler dev on .output/server/index.mjs',
      '  vercel_edge       — import the Edge bundle (fetch handler, in Node)',
      '  netlify_edge      — the Edge bundle on Deno',
      '  aws_lambda        — the handler behind an API Gateway v2 event',
      '  aws_amplify       — compute/default/server.js, no static folder in reach',
      '  bun, deno_server  — that runtime on .output/server/index.mjs',
      '  node_custom_public  — node_server with nitro.output.publicDir beside public/',
      '  vercel_serve_static — vercel with nitro.serveStatic: true',
      '',
      '--build-only builds every Nitro preset and starts nothing.',
      '',
      'Examples:',
      '  pnpm -C scripts cli preset-smoke --preset vercel',
      '  pnpm -C scripts cli preset-smoke --preset all --browser',
      '  pnpm -C scripts cli preset-smoke --preset vercel --skip-pack --skip-install',
      '  pnpm -C scripts cli preset-smoke --build-only --skip-pack',
    ].join('\n'),
  },
  args: {
    preset: {
      type: 'string',
      default: 'all',
      description: `Comma-separated presets or "all" (${PRESETS.join(', ')})`,
    },
    app: {
      type: 'string',
      default: 'test/deploy-smoke',
      description: 'Smoke app directory',
    },
    browser: {
      type: 'boolean',
      default: false,
      description: 'Also run smoke-browser (Playwright)',
    },
    'skip-pack': {
      type: 'boolean',
      default: false,
      description: 'Skip smoke-pack (app already pointed at local tarballs)',
    },
    'skip-install': {
      type: 'boolean',
      default: false,
      description: 'Skip pnpm install in the smoke app',
    },
    'skip-build': {
      type: 'boolean',
      default: false,
      description: 'Skip nuxt build (reuse existing preset output)',
    },
    'build-only': {
      type: 'boolean',
      default: false,
      description: 'Only build: every Nitro preset, a failure is a failed build',
    },
    'public-assets': {
      type: 'string',
      default: '',
      description: 'Set to "false" to build with translationPayloads.publicAssets: false',
    },
  },
  async setup({ args }) {
    const presets = args['build-only'] ? [] : parsePresets(args.preset)
    const appDir = resolve(repoRoot, args.app)
    const buildEnv: Record<string, string> = {}
    if (args['public-assets'] === 'false') {
      buildEnv.SMOKE_PUBLIC_ASSETS = '0'
    }

    if (!args['skip-pack']) {
      console.log('\n==> smoke-pack\n')
      execFileSync('pnpm', ['-C', 'scripts', 'cli', 'smoke-pack', '--app', args.app], {
        cwd: repoRoot,
        stdio: 'inherit',
      })
    }

    if (!args['skip-install']) {
      console.log('\n==> install smoke app\n')
      installSmokeApp(appDir)
    }

    if (args['build-only']) {
      const failed: string[] = []
      for (const preset of BUILD_ONLY_PRESETS) {
        console.log(`\n==> build ${preset}\n`)
        try {
          buildSmokeApp(appDir, preset, buildEnv)
        } catch {
          failed.push(preset)
        }
      }
      if (failed.length > 0) throw new Error(`Presets that do not build: ${failed.join(', ')}`)
      console.log(`\npreset-smoke: ${BUILD_ONLY_PRESETS.length} presets build\n`)
      return
    }

    // One preset at a time: shared appDir output dirs and fixed wrangler port.
    for (const preset of presets) {
      console.log(`\n==> preset ${preset}\n`)
      const target = PRESET_TARGETS[preset] as { preset: string; env?: Record<string, string> }
      if (!args['skip-build']) {
        buildSmokeApp(appDir, target.preset, { ...buildEnv, ...target.env })
      }

      // oxlint-disable-next-line no-await-in-loop -- sequential presets (shared dirs/ports)
      const server = await startPresetRuntime(appDir, preset)
      try {
        console.log(`\n==> smoke-verify ${server.url} (${preset})\n`)
        // oxlint-disable-next-line no-await-in-loop
        await runSmokeVerify(server.url, { browser: args.browser })
      } finally {
        // oxlint-disable-next-line no-await-in-loop
        await server.close()
      }
    }

    console.log(`\npreset-smoke: ${presets.join(', ')} ok\n`)
  },
})
