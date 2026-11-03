import { describe, expect, test } from 'vitest'
import type { TreeNode } from '../src/types'
import { ancestorPaths, buildFileTree, countFiles, filterTree, flattenTree, splitMatch } from '../src/util/i18nUtils'

const names = (nodes: TreeNode[]) => nodes.map((n) => n.name)
const allOpen = () => true
const noneOpen = () => false
/** `depth:name` per visible row. */
const outline = (files: string[], isOpen: (n: TreeNode) => boolean = allOpen) =>
  flattenTree(buildFileTree(files), isOpen).map((r) => `${r.depth}:${r.node.name}`)

describe('buildFileTree ordering and nesting', () => {
  test('folders first, then files, each alphabetically, at every level', () => {
    const tree = buildFileTree([
      'ru.json',
      'pages/b/en.json',
      'de.json',
      'pages/a/de.json',
      'pages/a/en.json',
      'additional:locales-extra/de.json',
      'en.json',
    ])
    expect(names(tree)).toEqual(['additional:locales-extra', 'pages', 'de.json', 'en.json', 'ru.json'])
    expect(names(tree[1]!.children)).toEqual(['a', 'b'])
    expect(names(tree[1]!.children[0]!.children)).toEqual(['de.json', 'en.json'])
  })

  test('folder paths are prefixes of their files, file paths are the listed keys', () => {
    const tree = buildFileTree(['de.json', 'pages/about/de.json'])
    const pages = tree.find((n) => n.name === 'pages')!
    expect(pages.fullPath).toBe('pages')
    expect(pages.children[0]!.fullPath).toBe('pages/about')
    expect(pages.children[0]!.children[0]!.fullPath).toBe('pages/about/de.json')
  })

  test('dots, dashes, brackets and prefixes stay in the names', () => {
    const files = ['pages/[id]/de.json', 'pages/[...slug]/de.json', 'pages/my-page.v2/de.extra.json', 'additional:locales-extra/en.json']
    expect(outline(files)).toEqual([
      '0:additional:locales-extra',
      '1:en.json',
      '0:pages',
      '1:[...slug]',
      '2:de.json',
      '1:[id]',
      '2:de.json',
      '1:my-page.v2',
      '2:de.extra.json',
    ])
  })

  test('deep nesting and long names are kept whole', () => {
    const long = 'a-very-long-folder-name-that-goes-on-and-on-well-past-any-sidebar-width'
    const file = `${long}/l2/l3/l4/l5/l6/l7/${'x'.repeat(120)}.de.json`
    // a sibling keeps the common folder from swallowing the chain
    const rows = flattenTree(buildFileTree([file, 'en.json']), allOpen)
    expect(rows.map((r) => r.depth)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 0])
    expect(rows[0]!.node.name).toBe(long)
    expect(rows[7]!.node.fullPath).toBe(file)
    expect(rows[7]!.node.name).toHaveLength(128)
  })

  test('a single file, and no files', () => {
    expect(outline(['de.json'])).toEqual(['0:de.json'])
    expect(outline([])).toEqual([])
  })
})

describe('flattenTree', () => {
  const files = ['pages/a/de.json', 'pages/b/de.json', 'en.json']

  test('lists only the children of open folders', () => {
    expect(outline(files, noneOpen)).toEqual(['0:pages', '0:en.json'])
    expect(outline(files, (n) => n.fullPath === 'pages')).toEqual(['0:pages', '1:a', '1:b', '0:en.json'])
  })

  test('rows know their parent folder', () => {
    const rows = flattenTree(buildFileTree(files), allOpen)
    expect(rows.find((r) => r.node.fullPath === 'pages/a/de.json')!.parent).toBe('pages/a')
    expect(rows.find((r) => r.node.name === 'pages')!.parent).toBeNull()
  })

  test('hundreds of folders stay cheap while closed', () => {
    const many = Array.from({ length: 600 }, (_, i) => [`pages/p${i}/en.json`, `pages/p${i}/de.json`]).flat()
    expect(flattenTree(buildFileTree([...many, 'en.json']), noneOpen)).toHaveLength(2)
    expect(flattenTree(buildFileTree([...many, 'en.json']), (n) => n.fullPath === 'pages')).toHaveLength(602)
  })
})

describe('filterTree', () => {
  const tree = buildFileTree(['de.json', 'en.json', 'pages/about/de.json', 'pages/about/en.json', 'pages/blog/de.json'])
  const rows = (query: string) => flattenTree(filterTree(tree, query), allOpen).map((r) => `${r.depth}:${r.node.name}`)

  test('matches anywhere in the path, case-insensitive, keeping the parents', () => {
    expect(rows('BLOG')).toEqual(['0:pages', '1:blog', '2:de.json'])
    expect(rows('about/en')).toEqual(['0:pages', '1:about', '2:en.json'])
    expect(rows(' de.json ')).toEqual(['0:pages', '1:about', '2:de.json', '1:blog', '2:de.json', '0:de.json'])
  })

  test('a folder name match keeps everything under it', () => {
    expect(rows('about')).toEqual(['0:pages', '1:about', '2:de.json', '2:en.json'])
  })

  test('blank query is the whole tree, no match is empty', () => {
    expect(filterTree(tree, '  ')).toBe(tree)
    expect(filterTree(tree, 'nothing-here')).toEqual([])
  })

  test('leaves the full tree untouched', () => {
    filterTree(tree, 'blog')
    expect(countFiles(tree[0]!)).toBe(3)
    expect(tree.reduce((sum, n) => sum + countFiles(n), 0)).toBe(5)
  })

  test('splitMatch marks the first match for highlighting', () => {
    expect(splitMatch('pages-About.json', 'about')).toEqual(['pages-', 'About', '.json'])
    expect(splitMatch('de.json', 'xx')).toBeNull()
    expect(splitMatch('de.json', '  ')).toBeNull()
  })
})

describe('ancestorPaths', () => {
  const tree = buildFileTree(['en.json', 'pages/a/b/c/de.json', 'pages/x/de.json'])

  test('the folders down to a file, outermost first', () => {
    expect(ancestorPaths(tree, 'pages/a/b/c/de.json')).toEqual(['pages', 'pages/a', 'pages/a/b', 'pages/a/b/c'])
    expect(ancestorPaths(tree, 'pages/x/de.json')).toEqual(['pages', 'pages/x'])
  })

  test('none for a top-level or unknown file', () => {
    expect(ancestorPaths(tree, 'en.json')).toEqual([])
    expect(ancestorPaths(tree, 'missing.json')).toEqual([])
  })
})
