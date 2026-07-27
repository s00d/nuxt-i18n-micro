import { defineLoader } from 'vitepress'
import { dataFile, readData } from '../.vitepress/data/loaders'

export interface ApiExport {
  name: string
  kind: string
  signature: string
  members: { name: string; signature: string }[]
}

export interface ApiPackage {
  name: string
  slug: string
  entryPoints: { specifier: string; exports: ApiExport[] }[]
  exportCount: number
}

export interface PackagesData {
  packages: ApiPackage[]
}

declare const data: PackagesData
export { data }

export function loadPackages(): ApiPackage[] {
  return readData<ApiPackage[]>('packages', [])
}

export default defineLoader({
  watch: [dataFile('packages')],
  load: (): PackagesData => ({ packages: loadPackages() }),
})
