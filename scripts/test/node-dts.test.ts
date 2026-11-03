import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { writeNodeDeclarations } from '../src/utils/node-dts'

describe('writeNodeDeclarations', () => {
  let dir: string
  const write = (file: string, content: string) => {
    mkdirSync(dirname(join(dir, file)), { recursive: true })
    writeFileSync(join(dir, file), content)
  }
  const read = (file: string) => readFileSync(join(dir, file), 'utf8')

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'node-dts-'))
  })
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('adds .js to every form of relative specifier in a .d.ts', () => {
    write(
      'index.d.ts',
      [
        `export { a } from './text';`,
        `import './side';`,
        `export type B = import("./text").B;`,
        `export * from './folder';`,
        `import type C from './Comp.vue';`,
        `declare module './text' {}`,
      ].join('\n'),
    )
    write('text.d.ts', '')
    write('side.d.ts', '')
    write('folder/index.d.ts', `export * from '..';`)
    write('Comp.vue.d.ts', '')

    writeNodeDeclarations(dir)

    expect(read('index.d.ts').split('\n')).toEqual([
      `export { a } from './text.js';`,
      `import './side.js';`,
      `export type B = import("./text.js").B;`,
      `export * from './folder/index.js';`,
      `import type C from './Comp.vue.js';`,
      `declare module './text.js' {}`,
    ])
    expect(read('folder/index.d.ts')).toBe(`export * from '../index.js';`)
  })

  it('leaves packages, JSON and anything that is not a declaration here', () => {
    const source = `import a from '@i18n-micro/core';\nimport b from '../package.json';\nimport c from './missing';\n// from './text'`
    write('index.d.ts', source)
    writeNodeDeclarations(dir)
    expect(read('index.d.ts')).toBe(source)
  })

  it('gives each file a .d.cts reaches its own .d.cts, and no other', () => {
    write('index.d.ts', `export * from './a';`)
    write('index.d.cts', `export * from './a';`)
    write('a.d.ts', `export * from './b';`)
    write('b.d.ts', `export const b: 1;`)
    write('esm-only.d.ts', `export * from './b';`)

    writeNodeDeclarations(dir)

    expect(read('index.d.cts')).toBe(`export * from './a.cjs';`)
    expect(read('a.d.cts')).toBe(`export * from './b.cjs';`)
    expect(read('b.d.cts')).toBe(`export const b: 1;`)
    expect(read('a.d.ts')).toBe(`export * from './b.js';`)
    expect(existsSync(join(dir, 'esm-only.d.cts'))).toBe(false)
  })

  it('survives a cycle and a second run', () => {
    write('a.d.ts', `export * from './b';`)
    write('a.d.cts', `export * from './b';`)
    write('b.d.ts', `export * from './a';`)

    writeNodeDeclarations(dir)
    const first = [read('a.d.ts'), read('a.d.cts'), read('b.d.ts'), read('b.d.cts')]
    writeNodeDeclarations(dir)

    expect([read('a.d.ts'), read('a.d.cts'), read('b.d.ts'), read('b.d.cts')]).toEqual(first)
    expect(first).toEqual([`export * from './b.js';`, `export * from './b.cjs';`, `export * from './a.js';`, `export * from './a.cjs';`])
  })
})
