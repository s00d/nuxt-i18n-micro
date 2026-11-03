import { isInternalPath } from '@i18n-micro/utils/app-path'
import { createI18nConfigResolver } from '@i18n-micro/utils/runtime-config'
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { expect, test } from 'vitest'
import { buildFullConfigSource, buildPrivateConfigSource } from '../../src/config-template'

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

test('excludePatterns appears once: a minifier inlines the spread, and wrangler reports a duplicate key', () => {
  const source = buildFullConfigSource({ excludePatterns: ['/a'] })
  expect(source.match(/excludePatterns/g)).toHaveLength(1)
})

const privateConfig = {
  rootDirs: ['/build/app'],
  payloadFsDir: '/build/app/.nuxt/i18n-merged',
  debug: false,
} as never

test('the build paths of the private config sit behind the constant a production bundle drops', () => {
  const source = buildPrivateConfigSource(privateConfig, false)
  const [always, guarded] = source.split('if (import.meta.prerender)')
  expect(always).toContain('"debug":false')
  expect(always).not.toContain('/build/app')
  expect(guarded).toContain('"payloadFsDir":"/build/app/.nuxt/i18n-merged"')
  expect(guarded).toContain('"rootDirs":["/build/app"]')
})

test('a dev server has its paths whatever the bundler does with import.meta', () => {
  const source = buildPrivateConfigSource(privateConfig, true)
  expect(source).not.toContain('import.meta')
  expect(source).toContain('"payloadFsDir":"/build/app/.nuxt/i18n-merged"')
  expect(source).toContain('"rootDirs":["/build/app"]')
})
