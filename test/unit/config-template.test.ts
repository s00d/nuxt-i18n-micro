import { isInternalPath } from '@i18n-micro/utils/app-path'
import { createI18nConfigResolver } from '@i18n-micro/utils/runtime-config'
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { expect, test } from 'vitest'
import { buildFullConfigSource } from '../../src/config-template'

const evaluate = (source: string) => new Function(`return ${source}`)() as ModuleOptionsExtend

test('RegExp excludePatterns survive the generated config and keep matching, also when frozen in dev', () => {
  const config = evaluate(buildFullConfigSource({ excludePatterns: [/^\/admin\/.*/gi, '/legal/*', new RegExp('a/b')] }))

  expect(config.excludePatterns).toEqual([/^\/admin\/.*/gi, '/legal/*', /a\/b/])
  expect(isInternalPath('/ADMIN/users', config.excludePatterns)).toBe(true)
  expect(isInternalPath('/ADMIN/users', config.excludePatterns)).toBe(true)
  expect(isInternalPath('/legal/terms', config.excludePatterns)).toBe(true)
  expect(isInternalPath('/about', config.excludePatterns)).toBe(false)

  const frozen = createI18nConfigResolver()(config)
  expect(isInternalPath('/ADMIN/users', frozen.excludePatterns)).toBe(true)
})

test('a config without patterns stays valid', () => {
  expect(evaluate(buildFullConfigSource({})).excludePatterns).toEqual([])
})
