/**
 * The module's public options, read from the type that defines them.
 *
 * Parsed with the TypeScript AST rather than a regex: `ModuleOptions` carries nested
 * object types and JSDoc blocks that contain the word `?:` in prose, and a regex over
 * them reports members that do not exist.
 *
 * The JSDoc is part of the contract here — it is what the generated options reference
 * shows — so the description and `@default` are read from the same declaration, and
 * cannot drift from the type they document.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { repoRoot } from './workspace'

export interface ModuleOption {
  /** Dotted path, e.g. `translationPayloads.ssrMode`. */
  path: string
  /** Type as written in the declaration. */
  type: string
  /** Value of the `@default` tag, or null when there is none. */
  default: string | null
  /** JSDoc description with tags removed. */
  description: string
  optional: boolean
  /** Reason from `@deprecated`, or null when the option is current. */
  deprecated: string | null
}

const MAX_DEPTH = 2

const flat = (text: string): string => text.replace(/\s+/g, ' ').trim()

function tagText(tag: ts.JSDocTag): string {
  const comment = tag.comment
  if (typeof comment === 'string') return flat(comment)
  if (Array.isArray(comment)) return flat(comment.map((part) => part.text).join(''))
  return ''
}

interface JsDocInfo {
  description: string
  default: string | null
  deprecated: string | null
}

function readJsDoc(member: ts.PropertySignature): JsDocInfo {
  // `ts.getJSDocTags` walks the same nodes the compiler does, so a tag written in an
  // unusual position is still found — a hand-rolled comment scan misses those.
  const info: JsDocInfo = { description: '', default: null, deprecated: null }

  for (const tag of ts.getJSDocTags(member)) {
    const name = tag.tagName.text
    if (name === 'default') info.default = tagText(tag)
    // An empty `@deprecated` still marks the option; the empty string would read as absent.
    else if (name === 'deprecated') info.deprecated = tagText(tag) || 'deprecated'
  }

  // Every block, not just the last: a declaration preceded by two JSDoc comments would
  // otherwise lose all but the final one.
  const docs = (member as unknown as { jsDoc?: ts.JSDoc[] }).jsDoc ?? []
  const parts = docs
    .map((doc) => (typeof doc.comment === 'string' ? doc.comment : Array.isArray(doc.comment) ? doc.comment.map((part) => part.text).join('') : ''))
    .filter(Boolean)
  info.description = flat(parts.join(' '))

  return info
}

/**
 * Members of `interfaceName`, descending one level into inline object types so a nested
 * option (`translationPayloads.ssrMode`) is reported under its full path.
 */
export function readModuleOptions(interfaceName = 'ModuleOptions', file = join(repoRoot, 'packages/types/src/index.ts')): ModuleOption[] {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.ESNext, true)
  const options: ModuleOption[] = []

  const interfaces = new Map<string, ts.NodeArray<ts.TypeElement>>()
  source.forEachChild((node) => {
    if (ts.isInterfaceDeclaration(node)) interfaces.set(node.name.text, node.members)
    if (ts.isTypeAliasDeclaration(node) && ts.isTypeLiteralNode(node.type)) interfaces.set(node.name.text, node.type.members)
  })

  const collect = (members: ts.NodeArray<ts.TypeElement>, prefix: string, depth: number): void => {
    for (const member of members) {
      if (!ts.isPropertySignature(member) || !member.name) continue
      const name = ts.isIdentifier(member.name) || ts.isStringLiteral(member.name) ? member.name.text : null
      if (!name) continue

      const path = prefix ? `${prefix}.${name}` : name
      const doc = readJsDoc(member)

      options.push({
        path,
        type: member.type ? flat(member.type.getText()) : 'unknown',
        default: doc.default,
        description: doc.description,
        optional: Boolean(member.questionToken),
        deprecated: doc.deprecated,
      })

      if (depth >= MAX_DEPTH || !member.type) continue

      if (ts.isTypeLiteralNode(member.type)) {
        collect(member.type.members, path, depth + 1)
      } else if (ts.isTypeReferenceNode(member.type)) {
        // A nested option group is usually a named interface (`TranslationPayloadOptions`),
        // not an inline literal — reading only the literal form hid every option inside it.
        const referenced = interfaces.get(member.type.typeName.getText())
        if (referenced) collect(referenced, path, depth + 1)
      }
    }
  }

  source.forEachChild((node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) collect(node.members, '', 0)
  })

  return options
}
