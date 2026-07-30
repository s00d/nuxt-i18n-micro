import { describe, expectTypeOf, it } from 'vitest'
import type { DefineLocaleMessage, ScopedKey, TranslationKey } from '../src/index'

/** `[T] extends [never]` — the un-distributed form, or the check collapses on `never`. */
type IsNever<T> = [T] extends [never] ? true : false

/**
 * These types have two shapes: one before the types generator augments
 * `DefineLocaleMessage`, and one after. Both ship, so both are pinned here — and the
 * assertions avoid bare `expectTypeOf(...).toEqualTypeOf(...)` on a possibly-`never`
 * type, which passes against anything and would make this file decorative.
 */
describe('TranslationKey', () => {
  it('is plain `string` before the generator augments anything', () => {
    // Not through the `extends never` branch, which never fires: the interface carries
    // the `__augmentation` marker, so `keyof` is that literal and the union
    // `'__augmentation' | string` collapses to `string`. Worth pinning, because dropping
    // the `| string` from the augmented branch would break this in a non-obvious way.
    expectTypeOf<keyof DefineLocaleMessage>().toEqualTypeOf<'__augmentation'>()
    expectTypeOf<TranslationKey>().toEqualTypeOf<string>()
    expectTypeOf<IsNever<TranslationKey>>().toEqualTypeOf<false>()
  })

  it('accepts a dynamic key', () => {
    const key: TranslationKey = `page.${'index'}.title`
    expectTypeOf(key).toEqualTypeOf<TranslationKey>()
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
