import { defineLoader } from 'vitepress'
import { dataFile, readData } from '../.vitepress/data/loaders'

export interface PropDoc {
  name: string
  type: string
  default: string | null
  required: boolean
  description: string
}

export interface SlotDoc {
  name: string
  description: string
  bindings: string[]
}

export interface ComponentDoc {
  tag: string
  description: string
  props: PropDoc[]
  slots: SlotDoc[]
  events: { name: string; description: string }[]
}

export interface DocParam {
  name: string
  type: string
  description: string
  optional: boolean
}

export interface DocSymbol {
  name: string
  kind: string
  signature: string
  description: string
  params: DocParam[]
  returns: string
  examples: string[]
  deprecated: string | null
}

export interface ReferenceData {
  components: ComponentDoc[]
  composables: { name: string; symbols: DocSymbol[] }[]
  methods: DocSymbol[]
}

declare const data: ReferenceData
export { data }

/**
 * One loader for everything the reference components render, so a page that shows a
 * component's props and a composable's signature does not pull in three separate
 * datasets.
 */
export default defineLoader({
  watch: [dataFile('components'), dataFile('composables'), dataFile('methods')],
  load: (): ReferenceData => ({
    components: readData('components', []),
    composables: readData('composables', []),
    methods: readData('methods', []),
  }),
})
