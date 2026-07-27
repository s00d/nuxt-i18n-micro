import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parse } from 'vue-docgen-api'
import { repoRoot } from '../src/utils/workspace'

/**
 * The component pages render whatever vue-docgen-api reports, so what needs guarding is
 * that the source keeps carrying the documentation — a prop added without a comment, or
 * a slot description dropped from a template, silently empties a column.
 */
const componentFile = (tag: string) => join(repoRoot, 'src/runtime/components', `${tag}.vue`)
const TAGS = ['i18n-t', 'i18n-link', 'i18n-switcher', 'i18n-group']

describe('component reference sources', () => {
  it.each(TAGS)('%s describes itself and every prop', async (tag) => {
    const doc = await parse(componentFile(tag))

    expect(doc.description, `${tag} has no component description`).toBeTruthy()
    const undocumented = (doc.props ?? []).filter((prop) => !prop.description).map((prop) => prop.name)
    expect(undocumented, `${tag} props without a comment`).toEqual([])
  })

  it.each(TAGS)('%s describes every slot it renders', async (tag) => {
    const doc = await parse(componentFile(tag))
    const undocumented = (doc.slots ?? []).filter((slot) => !slot.description).map((slot) => slot.name)
    expect(undocumented, `${tag} slots without a <!-- @slot --> comment`).toEqual([])
  })

  it('reads scoped slot bindings, which a page needs to be usable', async () => {
    const doc = await parse(componentFile('i18n-group'))
    const [slot] = doc.slots ?? []
    expect(slot?.bindings?.map((binding) => binding.name).sort()).toEqual(['prefix', 't'])
  })

  it('resolves a union prop type rather than reporting it as unknown', async () => {
    const doc = await parse(componentFile('i18n-link'))
    const to = doc.props?.find((prop) => prop.name === 'to')
    expect(to?.required).toBe(true)
    expect((to?.type as { name?: string })?.name).toBe('union')
  })
})
