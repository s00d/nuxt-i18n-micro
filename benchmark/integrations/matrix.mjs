#!/usr/bin/env node
// Every framework playground and mode, as `playground/bench/matrix.mjs` lists the root bench.
//
//   node benchmark/integrations/matrix.mjs list [--json]
//   node benchmark/integrations/matrix.mjs build <variant>
//   node benchmark/integrations/matrix.mjs start <variant> [port]     stays in front; a build mode needs `build` first
//
// A variant is { pkg, mode, env, paths }. `paths` are what a walk requests; `{locale}` expands per locale.
// BENCH_ROOT runs the same playgrounds from another tree, BENCH_CACHE moves Vite's dep cache there.
import { spawn, spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = process.env.BENCH_ROOT ?? join(dirname(fileURLToPath(import.meta.url)), '../..')
const dir = (pkg) => join(root, 'packages', pkg, 'playground')
const ssrServer = join(root, 'benchmark/integrations/ssr-server.mjs')
const instance = ['/writes', '/forks', '/exports', '/big', '/memory', '/cases?locale={locale}']
const pagePaths = ['', '/components', '/dictionaries', '/routing', '/big']
const spaPaths = pagePaths.map((path) => `/{locale}${path}`)
const bench = { BENCH: '1' }
const v = (name, pkg, mode, env = {}, paths = spaPaths, walk = {}) => [name, { pkg, mode, env: { ...bench, ...env }, paths, ...walk }]
const astroPaths = ['', '/components', '/routing', '/islands', '/big'].map((path) => `/{locale}${path}`)
const astro = (name, mode, env = {}) => v(`astro-${name}`, 'astro', mode, { BENCH_OUT: `./dist/astro-${name}`, ...env }, astroPaths)
const vitepressPaths = ['/{locale}', '/{locale}/guide/demo', '/{locale}/guide/no-seo', '/{locale}/guide/bench']
const vitepressWalk = { locales: ['en', 'de', 'fr'], ready: '.VPContent', home: ['/guide/bench'] }
const spa = (pkg) => [
  v(`${pkg}-dev`, pkg, 'vite-dev'),
  v(`${pkg}-build`, pkg, 'vite-build'),
  v(`${pkg}-no-router-dev`, pkg, 'vite-dev', { VITE_ROUTER: '0' }, ['/']),
  v(`${pkg}-no-router-build`, pkg, 'vite-build', { VITE_ROUTER: '0' }, ['/']),
  v(`${pkg}-ssr-dev`, pkg, 'ssr-dev', { BENCH_SSR: '1' }),
  v(`${pkg}-ssr`, pkg, 'ssr-build', { BENCH_SSR: '1', NODE_ENV: 'production' }),
]

export const variants = Object.fromEntries([
  v('runtime', 'runtime', 'script', {}, [...instance, '/fetch']),
  v('node', 'node', 'script', {}, [...instance, '/files', '/run', '/run-set', '/run-cases?locale={locale}']),
  ...['vue', 'react', 'preact', 'solid'].flatMap(spa),
  astro('dev', 'astro-dev'),
  astro('ssr', 'astro-ssr'),
  astro('static', 'astro-static', { BENCH_OUTPUT: 'static' }),
  astro('strategy', 'astro-ssr', { BENCH_STRATEGY: 'prefix-all' }),
  v('vitepress-dev', 'vitepress', 'vitepress-dev', {}, vitepressPaths, vitepressWalk),
  v('vitepress-build', 'vitepress', 'vitepress-build', {}, vitepressPaths, vitepressWalk),
])

const vite = (variant) => join(dir(variant.pkg), 'node_modules/.bin/vite')
const astroBin = (variant) => join(dir(variant.pkg), 'node_modules/.bin/astro')
const vitepress = (variant) => join(dir(variant.pkg), 'node_modules/.bin/vitepress')
const out = (name) => ['--outDir', `dist/${name}`]
const serverArgs = (port) => ['--port', port, '--strictPort', '--host', '127.0.0.1']
const run = {
  script: () => [process.execPath, ['--expose-gc', '--import', 'tsx', 'src/server.ts']],
  'vite-dev': (variant, name, port) => [vite(variant), serverArgs(port)],
  'vite-build': (variant, name, port) => [vite(variant), ['preview', ...out(name), ...serverArgs(port)]],
  'ssr-dev': () => [process.execPath, [ssrServer]],
  'ssr-build': () => [process.execPath, [ssrServer]],
  'astro-dev': (variant, name, port) => [astroBin(variant), ['dev', '--port', port, '--host', '127.0.0.1']],
  'astro-ssr': (variant) => [process.execPath, [join(dir(variant.pkg), variant.env.BENCH_OUT, 'server/entry.mjs')]],
  'astro-static': (variant, name, port) => [astroBin(variant), ['preview', '--port', port, '--host', '127.0.0.1']],
  'vitepress-dev': (variant, name, port) => [vitepress(variant), ['dev', '.', '--port', port, '--host', '127.0.0.1', '--strictPort']],
  'vitepress-build': (variant, name, port) => [vitepress(variant), ['preview', '.', '--port', port]],
}
const build = {
  'astro-ssr': (variant) => [[astroBin(variant), ['build']]],
  'astro-static': (variant) => [[astroBin(variant), ['build']]],
  'vitepress-build': (variant) => [[vitepress(variant), ['build', '.']]],
  'vite-build': (variant, name) => [[vite(variant), ['build', ...out(name)]]],
  'ssr-build': (variant) => [
    [vite(variant), ['build', '--outDir', 'dist/client']],
    [vite(variant), ['build', '--ssr', 'src/entry-server', '--outDir', 'dist/server']],
  ],
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [command, name, port = '5900'] = process.argv.slice(2)
  const variant = variants[name]
  if (command === 'list') console.log(process.argv.includes('--json') ? JSON.stringify(variants) : Object.keys(variants).join('\n'))
  else if (!variant) throw new Error(`no variant ${name}`)
  else if (command === 'build') {
    for (const [file, args] of build[variant.mode]?.(variant, name) ?? []) {
      const { status } = spawnSync(file, args, { cwd: dir(variant.pkg), env: { ...process.env, ...variant.env }, stdio: 'inherit' })
      if (status !== 0) process.exit(status ?? 1)
    }
  } else if (command === 'start') {
    const [file, args] = run[variant.mode](variant, name, port)
    spawn(file, args, { cwd: dir(variant.pkg), env: { ...process.env, ...variant.env, PORT: port, HOST: '127.0.0.1' }, stdio: 'inherit' })
  }
}
