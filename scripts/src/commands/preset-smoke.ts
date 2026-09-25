import { defineCommand } from 'citty'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { repoRoot } from '../utils/workspace'
import { buildSmokeApp, installSmokeApp, type PresetName, runSmokeVerify, startPresetRuntime } from '../utils/preset-runtime'

const PRESETS: PresetName[] = ['vercel', 'cloudflare_pages', 'netlify']

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
      '',
      'Examples:',
      '  pnpm -C scripts cli preset-smoke --preset vercel',
      '  pnpm -C scripts cli preset-smoke --preset all --browser',
      '  pnpm -C scripts cli preset-smoke --preset vercel --skip-pack --skip-install',
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
    'public-assets': {
      type: 'string',
      default: '',
      description: 'Set to "false" to build with translationPayloads.publicAssets: false',
    },
  },
  async setup({ args }) {
    const presets = parsePresets(args.preset)
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

    // One preset at a time: shared appDir output dirs and fixed wrangler port.
    for (const preset of presets) {
      console.log(`\n==> preset ${preset}\n`)
      if (!args['skip-build']) {
        buildSmokeApp(appDir, preset, buildEnv)
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
