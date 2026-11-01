import { spawnSync } from 'node:child_process'
import { closeSync, mkdirSync, mkdtempSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { defineCommand } from 'citty'
import { CONSUMER_INSTALL, packWorkspace, writeConsumerProject } from './smoke-pack'

/** What a user has installed. Peers at versions the package READMEs state their types for. */
const CONSUMER_DEPENDENCIES: Record<string, string> = {
  '@arethetypeswrong/cli': '0.18.5',
  '@nuxt/kit': '4.6.3',
  '@nuxt/schema': '4.6.3',
  '@solidjs/router': '0.15.3',
  '@types/node': '22.15.21',
  '@types/react': '19.1.4',
  '@types/react-dom': '19.1.5',
  astro: '5.8.0',
  nuxt: '4.6.3',
  preact: '10.29.8',
  'preact-render-to-string': '6.5.13',
  react: '19.1.0',
  'react-dom': '19.1.0',
  'react-router-dom': '7.6.0',
  'solid-js': '1.9.7',
  svelte: '5.33.0',
  typescript: '5.9.3',
  vite: '6.3.5',
  vitepress: '1.6.3',
  vue: '3.5.44',
  'vue-router': '4.6.4',
  'wouter-preact': '3.7.1',
}

/** A named import through a re-export is what `skipLibCheck: true` cannot hide. */
const NAMED_IMPORTS = `import { interpolate, BaseI18n, TranslationHelper } from '@i18n-micro/core'
import { RouteGenerator } from '@i18n-micro/route-strategy'
import { createPathStrategy } from '@i18n-micro/path-strategy'
import { createI18n } from '@i18n-micro/node'
export const used = [interpolate, BaseI18n, TranslationHelper, RouteGenerator, createPathStrategy, createI18n]
`

/**
 * What a CommonJS consumer gets from peers that ship ES modules only (astro, solid-js, vite, vitepress,
 * vue-router, @nuxt/schema). No declaration of ours can change that. An import of our own still fails.
 */
const ESM_ONLY_PEER = /TS1479: .*import\("(?!\.|@i18n-micro\/)|TS1542:|TS2305: Module '"vite"'/

const BASE_OPTIONS = { target: 'ES2022', strict: true, noEmit: true, skipLibCheck: false, types: ['node'], lib: ['ES2022', 'DOM'] }
const NODE16 = { ...BASE_OPTIONS, module: 'Node16', moduleResolution: 'Node16' }

interface Manifest {
  name: string
  exports?: Record<string, unknown>
}

/** Every entry a user can import. Wildcards, the manifest and `.astro` sources have no declarations to read. */
export function entrySpecifiers({ name, exports = {} }: Manifest, { requirable = false } = {}): string[] {
  return Object.entries(exports)
    .filter(([key, value]) => !key.includes('*') && key !== './package.json' && !JSON.stringify(value).includes('.astro'))
    .filter(([, value]) => !requirable || JSON.stringify(value).includes('"require"'))
    .map(([key]) => (key === '.' ? name : `${name}/${key.slice(2)}`))
}

/**
 * The compiler errors that are ours: inside a published package of this repository, or in the
 * consumer's own file. Other packages' declarations do not all compile with `skipLibCheck: false`,
 * and Nuxt pulls in plenty of them.
 */
export function ownErrors(output: string, { commonjs = false } = {}): string[] {
  return output
    .split('\n')
    .filter((line) => / error TS\d+:/.test(line) && !(commonjs && ESM_ONLY_PEER.test(line)))
    .filter((line) => {
      const file = line.split('(')[0]!
      const inPackage = /node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?((?:@[^/]+\/)?[^/]+)\//.exec(file)?.[1]
      return inPackage ? inPackage.startsWith('@i18n-micro/') || inPackage === 'nuxt-i18n-micro' : true
    })
}

interface AttwReport {
  analysis?: { problems?: { kind: string; resolutionKind?: string; entrypoint?: string; fileName?: string; moduleSpecifier?: string }[] }
}

/**
 * Only a declaration that cannot reach its own neighbour fails. The other kinds are design here:
 * ESM-only entries, types-only entries, `.astro` sources.
 */
export function attwFailures(report: AttwReport): string[] {
  return (report.analysis?.problems ?? [])
    .filter((problem) => problem.kind === 'InternalResolutionError' && problem.resolutionKind !== 'node10')
    .map((problem) => `${problem.resolutionKind}: ${problem.fileName} -> ${problem.moduleSpecifier}`)
}

function run(cwd: string, command: string, args: string[], timeoutMs: number): { ok: boolean; output: string } {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 1 << 28,
    env: { ...process.env, CI: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const timedOut = result.error ? [`${command} did not finish: ${result.error.message}`] : []
  return { ok: result.status === 0, output: [result.stdout, result.stderr, ...timedOut].join('\n') }
}

export const consumerTypesCommand = defineCommand({
  meta: {
    name: 'consumer-types',
    description: [
      'Read the packed tarballs as a user does: Are The Types Wrong, then `tsc` with `skipLibCheck: false`.',
      '',
      "The repository's own builds set `skipLibCheck: true`, which hides broken published declarations.",
      'Needs `dist` built everywhere, the root included (`nuxt-module-build build`, or `pnpm run prepack`).',
      'A consumer project outside the workspace installs the tarballs, so this needs the network.',
      '',
      'Examples:',
      '  pnpm run check:consumer',
      '  pnpm run check:consumer --dir /tmp/consumer --keep',
    ].join('\n'),
  },
  args: {
    dir: { type: 'string', description: 'Directory for the tarballs and the consumer project (default: a new temp folder)' },
    keep: { type: 'boolean', default: false, description: 'Leave the consumer project in place' },
  },
  setup({ args }) {
    const root = args.dir ?? mkdtempSync(join(tmpdir(), 'i18n-consumer-'))
    const app = join(root, 'app')

    const packed = packWorkspace(join(root, 'tarballs'), { ignoreScripts: true })
    const ours = Object.fromEntries(packed.map(({ name, tarball }) => [name, `file:${tarball}`]))
    writeConsumerProject(app, { ...ours, ...CONSUMER_DEPENDENCIES }, ours)

    const failures: string[] = []
    const install = run(app, 'pnpm', CONSUMER_INSTALL, 280_000)
    if (!install.ok) throw new Error(`install failed:\n${install.output}`)

    const bin = (tool: string) => join(app, 'node_modules/.bin', tool)
    for (const { tarball } of packed) {
      // to a file: attw exits with its report still in the pipe buffer
      const report = `${tarball}.attw.json`
      const out = openSync(report, 'w')
      spawnSync(bin('attw'), [tarball, '--format', 'json', '--no-emoji'], { cwd: app, timeout: 60_000, stdio: ['ignore', out, 'inherit'] })
      closeSync(out)
      const problems = attwFailures(JSON.parse(readFileSync(report, 'utf8')) as AttwReport)
      console.log(`attw ${basename(tarball)}: ${problems.length} internal resolution error(s)`)
      failures.push(...problems.map((problem) => `attw ${basename(tarball)} ${problem}`))
    }

    const manifests = packed.map(({ name }) => JSON.parse(readFileSync(join(app, 'node_modules', name, 'package.json'), 'utf8')) as Manifest)
    const imports = (options?: { requirable: boolean }) =>
      manifests
        .flatMap((manifest) => entrySpecifiers(manifest, options))
        .map((specifier) => `import ${JSON.stringify(specifier)}\n`)
        .join('')
    const projects = [
      {
        name: 'bundler',
        file: 'a.ts',
        type: 'module',
        compilerOptions: { ...BASE_OPTIONS, module: 'ESNext', moduleResolution: 'bundler' },
        source: imports(),
      },
      { name: 'node16-esm', file: 'a.mts', type: 'module', compilerOptions: NODE16, source: imports() },
      { name: 'node16-cjs', file: 'a.cts', type: 'commonjs', compilerOptions: NODE16, source: imports({ requirable: true }) },
      {
        name: 'nodenext-skip-lib',
        file: 'a.ts',
        type: 'module',
        compilerOptions: { ...BASE_OPTIONS, skipLibCheck: true, module: 'NodeNext', moduleResolution: 'NodeNext' },
        source: NAMED_IMPORTS,
      },
    ]

    for (const project of projects) {
      const dir = join(app, project.name)
      mkdirSync(dir, { recursive: true })
      writeFileSync(join(dir, 'package.json'), JSON.stringify({ type: project.type }))
      writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify({ compilerOptions: project.compilerOptions, files: [project.file] }))
      writeFileSync(join(dir, project.file), project.source)
      const tsc = run(dir, bin('tsc'), ['-p', '.'], 170_000)
      writeFileSync(join(root, `tsc-${project.name}.log`), tsc.output)
      const errors = ownErrors(tsc.output, { commonjs: project.type === 'commonjs' })
      console.log(`tsc ${project.name}: ${errors.length} error(s) in our packages, full log ${join(root, `tsc-${project.name}.log`)}`)
      if (/did not finish/.test(tsc.output)) failures.push(`tsc ${project.name} timed out`)
      failures.push(...errors.map((error) => `tsc ${project.name} ${error}`))
    }

    if (!args.keep && !args.dir) rmSync(root, { recursive: true, force: true })
    if (failures.length === 0) return
    console.error(`\n${failures.length} failure(s):\n${failures.join('\n')}`)
    process.exit(1)
  },
})
