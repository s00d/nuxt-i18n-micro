import { readFileSync } from 'node:fs'
import { type ComponentDoc, parseSource, type SlotDescriptor } from 'vue-docgen-api'

/** Slots of a `SlotsType` block: vue-docgen-api reads them from templates only, and a render function has none. */
export function declaredSlots(source: string): SlotDescriptor[] {
  const block = source.match(/SlotsType<\{([\s\S]*?)\n\s*\}>/)?.[1] ?? ''
  return [...block.matchAll(/\/\*\* (.+?) \*\/\n\s+'?([\w-]+)'?: \((?:scope: \{ (\w+):[^)]*)?\)/g)].map(([, description, name, binding]) => ({
    name: name!,
    bindings: (binding ? [{ name: binding }] : []) as SlotDescriptor['bindings'],
    description: description!,
  }))
}

/**
 * vue-docgen-api on a component file. A functional component is `Object.assign(render, options)`,
 * which it does not recognise, so it reads the same options as `defineComponent`.
 */
export async function parseComponent(file: string): Promise<ComponentDoc> {
  const source = readFileSync(file, 'utf8')
  const parsed = await parseSource(source.replace('export default Object.assign(render, {', 'export default defineComponent({'), file)
  return parsed.slots?.length ? parsed : { ...parsed, slots: declaredSlots(source) }
}
