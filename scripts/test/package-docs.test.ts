import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { readPackageDocs } from '../src/utils/package-docs'

/**
 * The reference pages are only as good as this model: a wrong group, an inherited member or
 * a lost `@param` shows up as a page that reads badly, never as a failure.
 */
describe('readPackageDocs', () => {
  const dir = mkdtempSync(join(tmpdir(), 'package-docs-'))
  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  mkdirSync(join(dir, 'src'))
  writeFileSync(
    join(dir, 'src/index.ts'),
    `
    interface Base { inherited: string; also: number }

    /** Props of {@link Thing}. */
    export interface ThingProps extends Base {
      /** What it shows. @default 'hi' */
      label?: string
    }

    /**
     * Renders a thing.
     * ponytail: maintainers only.
     */
    export function Thing(props: ThingProps): string { return props.label ?? '' }

    /**
     * Adds two numbers.
     * @param a - the first
     * @param b the second
     * @returns their sum
     */
    export const add = (a: number, b: number): number => a + b

    export const useThing = (name: string) => ({ name, /** Says it. */ say: () => name })

    export const LIMIT = 3

    export class Box<T> extends Array<T> {
      constructor(public size: number) { super() }
      private hidden = 1
      protected peek(): T | undefined { return this[0] }
    }

    export type Long = 'aaaaaaaaaaaaaaaaaaaa' | 'bbbbbbbbbbbbbbbbbbbbbbb' | 'cccccccccccccccccccccc' | 'ddddddddddddddddddd'
    `,
  )
  const [entry] = readPackageDocs(dir, { name: '@scope/demo', exports: { '.': './dist/index.mjs' } }, new Map())
  const byName = new Map(entry!.exports.map((item) => [item.name, item]))

  it('groups exports in reader order', () => {
    expect(entry!.exports.map((item) => `${item.group} ${item.name}`)).toEqual([
      'component Thing',
      'composable useThing',
      'function add',
      'class Box',
      'constant LIMIT',
      'type Long',
      'type ThingProps',
    ])
    expect(entry!.specifier).toBe('@scope/demo')
  })

  it('lists own members only, with the parent named once', () => {
    const props = byName.get('ThingProps')!
    expect(props.signature).toBe('interface ThingProps extends Base')
    expect(props.members).toEqual([{ name: 'label?', type: 'string', default: "'hi'", description: 'What it shows.', deprecated: null }])
    expect(props.description).toBe('Props of `Thing`.')
  })

  it('reads params and returns from JSDoc, and drops maintainer notes', () => {
    const add = byName.get('add')!
    expect(add.signature).toBe('function add(a: number, b: number): number')
    expect(add.params).toEqual([
      { name: 'a', description: 'the first', type: 'number', optional: false },
      { name: 'b', description: 'the second', type: 'number', optional: false },
    ])
    expect(add.returns).toBe('their sum')
    expect(byName.get('Thing')!.description).toBe('Renders a thing.')
  })

  it('folds an inferred returned object into a member table', () => {
    const hook = byName.get('useThing')!
    expect(hook.signature).toBe('function useThing(name: string): { … }')
    expect(hook.members.map((member) => `${member.name}: ${member.type}`)).toEqual(['name: string', 'say: () => string'])
  })

  it('shows a class by its constructor and its non-private members', () => {
    const box = byName.get('Box')!
    expect(box.signature).toBe('class Box<T> extends Array<T> {\n  constructor(public size: number)\n}')
    expect(box.members.map((member) => member.name)).toEqual(['protected peek'])
  })

  it('breaks a long union one member per line', () => {
    expect(byName.get('Long')!.signature.split('\n')).toHaveLength(5)
  })
})
