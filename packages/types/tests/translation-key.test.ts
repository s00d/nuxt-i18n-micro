import { describe, expectTypeOf, it } from 'vitest'
import type { DefineLocaleMessage, ScopedKey, TranslationKey } from '../src/index'

/** `[T] extends [never]` — the un-distributed form, or the check collapses on `never`. */
type IsNever<T> = [T] extends [never] ? true : false

type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false

/**
 * These types have two shapes: one before the types generator augments
 * `DefineLocaleMessage`, and one after. Both ship, so both are pinned here — and the
 * assertions avoid bare `expectTypeOf(...).toEqualTypeOf(...)` on a possibly-`never`
 * type, which passes against anything and would make this file decorative.
 */
describe('TranslationKey', () => {
  it('is plain `string` before the generator augments anything', () => {
    // `keyof` still includes the `__augmentation` marker, but `TranslationKey` excludes it
    // so the empty branch stays documented `string` (and the sentinel is not a completion).
    expectTypeOf<keyof DefineLocaleMessage>().toEqualTypeOf<'__augmentation'>()
    expectTypeOf<Exclude<keyof DefineLocaleMessage, '__augmentation'>>().toEqualTypeOf<never>()
    expectTypeOf<TranslationKey>().toEqualTypeOf<string>()
    expectTypeOf<IsNever<TranslationKey>>().toEqualTypeOf<false>()
  })

  it('accepts a dynamic key', () => {
    const key: TranslationKey = `page.${'index'}.title`
    expectTypeOf(key).toEqualTypeOf<TranslationKey>()
  })

  it('keeps literal keys when using `(string & {})` instead of `| string`', () => {
    // Simulated generator output: this is what `TranslationKey` reduces to once
    // `DefineLocaleMessage` carries real keys (after excluding `__augmentation`).
    type Generated = 'home.title' | 'nav.home'
    type Fixed = Generated | (string & {})
    type Broken = Generated | string

    expectTypeOf<Equals<Broken, string>>().toEqualTypeOf<true>()
    expectTypeOf<Equals<Fixed, string>>().toEqualTypeOf<false>()
    expectTypeOf<'home.title'>().toMatchTypeOf<Fixed>()
    expectTypeOf<string>().toMatchTypeOf<Fixed>()
  })
})

describe('ScopedKey', () => {
  it('is `never` while no keys are known, and the documented cast still compiles', () => {
    // `Extract<string, \`errors.${string}\`>` is `never`: `string` does not extend the
    // template. The cast in the JSDoc example is still valid, and `never` is assignable
    // to the `TranslationKey` a translate call expects — so the example works, it just
    // carries no narrowing until the generator has run.
    expectTypeOf<IsNever<ScopedKey<'errors'>>>().toEqualTypeOf<true>()

    // The cast from the JSDoc example: it compiles, and the result is accepted wherever a
    // `TranslationKey` is expected, because `never` is assignable to everything.
    const code = '404'
    const key = `errors.${code}` as ScopedKey<'errors'>
    const accepted: TranslationKey = key
    expectTypeOf(accepted).toEqualTypeOf<TranslationKey>()
  })

  it('narrows to its scope once keys are known', () => {
    // The augmented case, simulated: this is what `ScopedKey` reduces to when
    // `DefineLocaleMessage` carries literal keys.
    type Keys = 'errors.404' | 'errors.500' | 'btn.save'
    type Scoped = Extract<Keys, `errors.${string}`>

    expectTypeOf<Scoped>().toEqualTypeOf<'errors.404' | 'errors.500'>()
    expectTypeOf<IsNever<Scoped>>().toEqualTypeOf<false>()
    expectTypeOf<Extract<Keys, `btn.${string}`>>().toEqualTypeOf<'btn.save'>()
  })

  it('constrains its scope parameter to a string', () => {
    // Part of the published contract: loosening it would allow a scope that cannot form
    // a template literal key at all.
    // @ts-expect-error — a number is not a valid scope
    expectTypeOf<IsNever<ScopedKey<404>>>().toEqualTypeOf<true>()
  })
})
