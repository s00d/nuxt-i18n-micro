/** The pnpm catalog, and the protocols a workspace dependency is allowed to use. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { repoRoot } from './workspace'

interface WorkspaceYaml {
  catalog?: Record<string, string>
  catalogs?: Record<string, Record<string, string>>
}

export interface Catalog {
  /** Package name → version range, from the default catalog. */
  entries: Map<string, string>
  /** Named catalogs (`catalog:react17`), keyed by catalog name. */
  named: Map<string, Map<string, string>>
}

export function readCatalog(root = repoRoot): Catalog {
  const parsed = parse(readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf8')) as WorkspaceYaml | null

  const named = new Map<string, Map<string, string>>()
  for (const [name, entries] of Object.entries(parsed?.catalogs ?? {})) {
    named.set(name, new Map(Object.entries(entries)))
  }

  return { entries: new Map(Object.entries(parsed?.catalog ?? {})), named }
}

/** Does `spec` use the catalog protocol, and if so which catalog? */
export function catalogRef(spec: string): { isCatalog: boolean; name: string | null } {
  if (!spec.startsWith('catalog:')) return { isCatalog: false, name: null }
  const rest = spec.slice('catalog:'.length).trim()
  return { isCatalog: true, name: rest === '' || rest === 'default' ? null : rest }
}

export function isWorkspaceProtocol(spec: string): boolean {
  return spec.startsWith('workspace:')
}

/**
 * Specs that name no registry version and so cannot drift from the catalog:
 * local paths, git URLs, tarballs and the catalog/workspace protocols themselves.
 */
export function isNonRegistrySpec(spec: string): boolean {
  // `npm:` is deliberately absent: `npm:other@1.0.0` does name a registry version, just
  // under a different package name, and skipping it let a pin drift from the catalog.
  return (
    /^(?:catalog:|workspace:|file:|link:|portal:|git\+|git:|ssh:|https?:|github:|gitlab:|bitbucket:)/.test(spec) ||
    /^[\w.-]+\/[\w.-]+(?:#|$)/.test(spec)
  )
}

/** The package a `npm:` alias points at, or null when `spec` is not an alias. */
export function aliasTarget(spec: string): string | null {
  if (!spec.startsWith('npm:')) return null
  const rest = spec.slice('npm:'.length)
  const at = rest.lastIndexOf('@')
  return at > 0 ? rest.slice(0, at) : rest
}
