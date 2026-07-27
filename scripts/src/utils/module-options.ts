/**
 * The module's public option names, read from the type that defines them.
 *
 * Parsed with the TypeScript AST rather than a regex: `ModuleOptions` carries nested
 * object types and JSDoc blocks that contain the word `?:` in prose, and a regex over
 * them reports members that do not exist.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { repoRoot } from './workspace'

export interface ModuleOption {
  /** Dotted path, e.g. `translationPayloads.ssrMode`. */
  path: string
  /** True when the option is marked `@deprecated`. */
  deprecated: boolean
}

const MAX_DEPTH = 2

function isDeprecated(node: ts.Node, source: ts.SourceFile): boolean {
  const start = node.getFullStart()
  const text = source.text.slice(start, node.getStart(source))
  return text.includes('@deprecated')
}

/**
 * Members of `interfaceName`, descending one level into inline object types so a nested
 * option (`translationPayloads.ssrMode`) is reported under its full path.
 */
export function readModuleOptions(interfaceName = 'ModuleOptions', file = join(repoRoot, 'packages/types/src/index.ts')): ModuleOption[] {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.ESNext, true)
  const options: ModuleOption[] = []

  const collect = (members: ts.NodeArray<ts.TypeElement>, prefix: string, depth: number): void => {
    for (const member of members) {
      if (!ts.isPropertySignature(member) || !member.name) continue
      const name = ts.isIdentifier(member.name) || ts.isStringLiteral(member.name) ? member.name.text : null
      if (!name) continue

      const path = prefix ? `${prefix}.${name}` : name
      options.push({ path, deprecated: isDeprecated(member, source) })

      if (depth < MAX_DEPTH && member.type && ts.isTypeLiteralNode(member.type)) {
        collect(member.type.members, path, depth + 1)
      }
    }
  }

  source.forEachChild((node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) collect(node.members, '', 0)
  })

  return options
}
