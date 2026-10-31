#!/usr/bin/env node
// Every framework playground and mode, as `playground/bench/matrix.mjs` lists the root bench.
//
//   node benchmark/integrations/matrix.mjs list [--json]
//   node benchmark/integrations/matrix.mjs build <variant>
//   node benchmark/integrations/matrix.mjs start <variant> [port]     stays in front; a build mode needs `build` first
//
// A variant is { pkg, mode, env, paths }. `paths` are what a walk requests; `{locale}` expands per locale.
import { spawn, spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = process.env.BENCH_ROOT ?? join(dirname(fileURLToPath(import.meta.url)), '../..')
const dir = (pkg) => join(root, 'packages', pkg, 'playground')
const instance = ['/writes', '/forks', '/exports', '/big', '/memory', '/cases?locale={locale}']
const spaPaths = ['/{locale}', '/{locale}/plurals', '/{locale}/formats', '/{locale}/components', '/{locale}/dictionaries', '/{locale}/big']
const v = (name, pkg, mode, env = {}, paths = spaPaths) => [name, { pkg, mode, env, paths }]
const spa = (pkg) => [
  v(`${pkg}-dev`, pkg, 'vite-dev'),
  v(`${pkg}-build`, pkg, 'vite-build'),
  v(`${pkg}-no-router-dev`, pkg, 'vite-dev', { VITE_ROUTER: '0' }, ['/']),
  v(`${pkg}-no-router-build`, pkg, 'vite-build', { VITE_ROUTER: '0' }, ['/']),
]

export const variants = Object.fromEntries([
  v('runtime', 'runtime', 'script', {}, [...instance, '/fetch']),
  v('node', 'node', 'script', {}, [...instance, '/files', '/run', '/run-set', '/run-cases?locale={locale}']),
  ...['vue', 'react', 'preact', 'solid'].flatMap(spa),
])

const nodeBin = (pkg, name) => join(dir(pkg), 'node_modules/.bin', name)
const run = {
  script: (variant, port) => [process.execPath, ['--expose-gc', '--import', 'tsx', 'src/server.ts'], { PORT: port }],
  'vite-dev': (variant, port) => [nodeBin(variant.pkg, 'vite'), ['--port', port, '--strictPort', '--host', '127.0.0.1']],
  'vite-build': (variant, port) => [nodeBin(variant.pkg, 'vite'), ['preview', '--port', port, '--strictPort', '--host', '127.0.0.1']],
}
const build = { 'vite-build': (variant) => [nodeBin(variant.pkg, 'vite'), ['build']] }

if (import.meta.url === `file://${process.argv[1]}`) {
  const [command, name, port = '5900'] = process.argv.slice(2)
  const variant = variants[name]
  if (command === 'list') console.log(process.argv.includes('--json') ? JSON.stringify(variants) : Object.keys(variants).join('\n'))
  else if (!variant) throw new Error(`no variant ${name}`)
  else if (command === 'build') {
    const [file, args] = build[variant.mode]?.(variant) ?? [process.execPath, ['-e', '']]
    process.exit(spawnSync(file, args, { cwd: dir(variant.pkg), env: { ...process.env, ...variant.env }, stdio: 'inherit' }).status ?? 1)
  } else if (command === 'start') {
    const [file, args, env] = run[variant.mode](variant, port)
    spawn(file, args, { cwd: dir(variant.pkg), env: { ...process.env, ...variant.env, ...env }, stdio: 'inherit' })
  }
}
