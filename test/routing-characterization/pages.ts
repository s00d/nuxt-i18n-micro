/**
 * `pages/` file list -> NuxtPage tree, following Nuxt's file-based routing rules
 * (nuxt/src/pages/utils.ts generateRoutesFromFiles), so characterization scenarios are written
 * the way a real project is: as files.
 *
 * - `index.vue` is the empty segment; `[id]` -> `:id()`, `[[id]]` -> `:id?`, `[...slug]` -> `:slug(.*)*`
 * - the route name joins the segments with `-` (params by name, `index` dropped)
 * - `a.vue` next to a folder `a/` makes the files in `a/` its children (relative paths);
 *   `a/index.vue` then takes the name `a` and the parent loses it
 */
import type { NuxtPage } from '@nuxt/schema'

interface Segment {
  path: string
  name: string
}

function parseSegment(raw: string): Segment {
  if (raw === 'index') return { path: '', name: '' }
  const catchAll = /^\[\.\.\.(\w+)\]$/.exec(raw)
  if (catchAll) return { path: `:${catchAll[1]}(.*)*`, name: catchAll[1]! }
  const optional = /^\[\[(\w+)\]\]$/.exec(raw)
  if (optional) return { path: `:${optional[1]}?`, name: optional[1]! }
  // mixed static/dynamic segments, e.g. `post-[id]` -> `post-:id()`
  let path = ''
  let name = ''
  for (const part of raw.split(/(\[\w+\])/).filter(Boolean)) {
    const param = /^\[(\w+)\]$/.exec(part)
    path += param ? `:${param[1]}()` : part
    name += param ? param[1] : part
  }
  return { path, name }
}

interface Node {
  segment: Segment
  file?: string
  children: Map<string, Node>
}

export function pagesFromFiles(files: string[]): NuxtPage[] {
  const root: Node = { segment: { path: '', name: '' }, children: new Map() }
  for (const file of files) {
    const parts = file.replace(/\.vue$/, '').split('/')
    let node = root
    for (const part of parts) {
      let next = node.children.get(part)
      if (!next) {
        next = { segment: parseSegment(part), children: new Map() }
        node.children.set(part, next)
      }
      node = next
    }
    node.file = `pages/${file}`
  }
  return toPages(root, [], true)
}

function toPages(node: Node, nameParts: string[], topLevel: boolean, parentPathParts: string[] = []): NuxtPage[] {
  const pages: NuxtPage[] = []
  for (const child of node.children.values()) {
    const names = child.segment.name ? [...nameParts, child.segment.name] : nameParts
    const pathParts = [...parentPathParts, child.segment.path]
    const routePath = topLevel ? `/${pathParts.filter(Boolean).join('/')}` : pathParts.filter(Boolean).join('/')
    if (child.file && child.children.size) {
      // a page with nested routes: its folder's files become children with relative paths
      const children = toPages(child, names, false)
      const ownIndex = children.find((c) => c.path === '')
      pages.push({ path: routePath, file: child.file, ...(ownIndex ? {} : { name: names.join('-') || 'index' }), children })
    } else if (child.file) {
      pages.push({ path: routePath, name: names.join('-') || 'index', file: child.file })
      if (child.children.size) pages.push(...toPages(child, names, topLevel, pathParts))
    } else {
      // a plain folder: its files continue the current level
      pages.push(...toPages(child, names, topLevel, pathParts))
    }
  }
  return pages
}
