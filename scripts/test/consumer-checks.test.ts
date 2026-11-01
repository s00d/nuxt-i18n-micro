import { describe, expect, it } from 'vitest'
import { attwFailures, entrySpecifiers, ownErrors } from '../src/commands/consumer-types'
import { createGenerator, judge } from '../src/commands/http-fuzz'

describe('consumer-types', () => {
  const manifest = {
    name: '@i18n-micro/x',
    exports: {
      '.': { import: './a.mjs', require: './a.cjs' },
      './esm': { import: './b.mjs' },
      './package.json': './package.json',
      './dist/*': './dist/*',
      './i18n-t': './src/i18n-t.astro',
    },
  }

  it('lists what a user can import', () => {
    expect(entrySpecifiers(manifest)).toEqual(['@i18n-micro/x', '@i18n-micro/x/esm'])
    expect(entrySpecifiers(manifest, { requirable: true })).toEqual(['@i18n-micro/x'])
  })

  const pnpmPath = (name: string) => `../node_modules/.pnpm/x@1/node_modules/${name}/dist/index.d.ts(1,1): error TS2305: nope`

  it('keeps errors of our packages and of the consumer file, drops the rest', () => {
    const output = [
      pnpmPath('@i18n-micro/core'),
      pnpmPath('nuxt-i18n-micro'),
      pnpmPath('nuxt'),
      pnpmPath('@nuxt/schema'),
      'a.ts(1,1): error TS2307: nope',
      '  context line',
    ].join('\n')
    expect(ownErrors(output)).toEqual([pnpmPath('@i18n-micro/core'), pnpmPath('nuxt-i18n-micro'), 'a.ts(1,1): error TS2307: nope'])
  })

  it('forgives a CommonJS consumer an ESM-only peer, never an import of ours', () => {
    const peer = `x/node_modules/@i18n-micro/a/dist/i.d.cts(1,1): error TS1479: ... Consider writing a dynamic 'import("astro")' call instead.`
    const ours = `x/node_modules/@i18n-micro/a/dist/i.d.cts(1,1): error TS1479: ... Consider writing a dynamic 'import("./base.js")' call instead.`
    const sibling = `x/node_modules/@i18n-micro/a/dist/i.d.cts(1,1): error TS1479: ... Consider writing a dynamic 'import("@i18n-micro/core")' call instead.`
    const output = [peer, ours, sibling].join('\n')
    expect(ownErrors(output, { commonjs: true })).toEqual([ours, sibling])
    expect(ownErrors(output)).toHaveLength(3)
  })

  it('fails only on a declaration that cannot reach its neighbour', () => {
    const report = {
      analysis: {
        problems: [
          { kind: 'InternalResolutionError', resolutionKind: 'node16-esm', fileName: 'dist/a.d.ts', moduleSpecifier: './b' },
          { kind: 'InternalResolutionError', resolutionKind: 'node10', fileName: 'dist/a.d.ts', moduleSpecifier: './b' },
          { kind: 'CJSResolvesToESM', resolutionKind: 'node16-cjs' },
        ],
      },
    }
    expect(attwFailures(report)).toEqual(['node16-esm: dist/a.d.ts -> ./b'])
  })
})

describe('http-fuzz', () => {
  const request = { method: 'GET', path: '/', headers: [] }
  const answer = (head: string, body = '') => `HTTP/1.1 ${head}\r\n\r\n${body}`

  it('replays the same requests for a seed', () => {
    const first = createGenerator(7, 8860)
    const second = createGenerator(7, 8860)
    expect(Array.from({ length: 50 }, first)).toEqual(Array.from({ length: 50 }, second))
  })

  it.each([
    ['off-origin-location', answer('302 Found\r\nLocation: https://evil.example/')],
    ['off-origin-location', answer('302 Found\r\nLocation: //evil.example/')],
    ['header-injection', answer('200 OK\r\nSet-Cookie: x=1')],
    ['reflected-raw', answer('200 OK', '<img src=x onerror=alert(1)>')],
    ['path-traversal', answer('200 OK', 'root:x:0:0:root:/root:/bin/sh')],
    ['stack-leak', answer('500 Internal', 'at async /app/node_modules/h3')],
    ['bad-cookie', answer('200 OK\r\nSet-Cookie: i18n-locale=__proto__')],
  ])('finds %s', (finding, raw) => {
    expect(judge(raw, request, 8860)).toContain(finding)
  })

  it('finds nothing in a clean answer, a relative redirect included', () => {
    expect(judge(answer('302 Found\r\nLocation: /de'), request, 8860)).toEqual([])
    expect(judge(answer('200 OK', '<html></html>'), request, 8860)).toEqual([])
  })

  it('counts a 5xx without calling it a violation', () => {
    expect(judge(answer('500 Internal', 'oops'), request, 8860)).toEqual(['status-500'])
  })
})
