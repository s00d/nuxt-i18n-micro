import { describe, expect, it, vi } from 'vitest'

// The code as it runs on Windows, on any machine: `node:path` is `path.win32`, and these drives do not exist.
vi.mock('node:path', async (importOriginal) => {
  const { win32 } = await importOriginal<typeof import('node:path')>()
  return { ...win32, default: win32 }
})
vi.mock('node:fs', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:fs')>()),
  existsSync: () => true,
  realpathSync: (path: string) => path,
  statSync: () => ({ isDirectory: () => true }),
}))

const { isUnder, relativePath } = await import('../src/fs')
const { isOwnSource, pageNameOf } = await import('../src/source')
const { extraSourceDirsOf } = await import('../src/nuxt')
const { KeyRegistry } = await import('../src/text-to-i18n')

describe('native Windows paths', () => {
  it('a report shows forward slashes', () => {
    expect(relativePath('D:\\app', 'D:\\app\\pages\\blog\\[slug].vue')).toBe('pages/blog/[slug].vue')
    expect(pageNameOf('blog\\[slug]\\index.vue')).toBe('blog-slug')
  })

  it('another drive is not under a directory, though `relative` opens with no `..`', () => {
    expect(isUnder('D:\\app', 'D:\\app\\pages\\a.vue')).toBe(true)
    expect(isUnder('D:\\app', 'D:\\app')).toBe(true)
    expect(isUnder('D:\\app', 'D:\\other\\a.vue')).toBe(false)
    expect(isUnder('D:\\app', 'E:\\app\\a.vue')).toBe(false)
  })

  it('a write stays out of node_modules, nested layers and other drives', () => {
    const config = { rootDir: 'D:\\app', layerRoots: ['D:\\app\\layers\\base'] } as Parameters<typeof isOwnSource>[0]
    expect(isOwnSource(config, 'D:\\app\\pages\\a.vue')).toBe(true)
    expect(isOwnSource(config, 'D:\\app\\node_modules\\pkg\\a.vue')).toBe(false)
    expect(isOwnSource(config, 'D:\\app\\packages\\ui\\node_modules\\x\\b.vue')).toBe(false)
    expect(isOwnSource(config, 'D:\\app\\layers\\base\\c.vue')).toBe(false)
    expect(isOwnSource(config, 'E:\\other\\c.vue')).toBe(false)
  })

  it('a folder outside the project counts on another drive, a package does not on any', () => {
    const alias = { '#ui': 'E:\\shared\\ui', '#pkg': 'D:\\repo\\node_modules\\nuxt\\dist\\app', '#own': 'D:\\repo\\app\\ui' }
    expect(extraSourceDirsOf({ alias } as never, 'D:\\repo\\app')).toEqual(['E:\\shared\\ui'])
  })

  it('a generated key comes from the folders of the page', () => {
    const registry = new KeyRegistry({})
    expect(registry.keyFor('Save', 'D:\\p\\pages\\a.vue', 1)).toBe('pages.a.save')
  })
})
