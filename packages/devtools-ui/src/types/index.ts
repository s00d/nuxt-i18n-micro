// Re-export types from bridge

// Re-export types from @i18n-micro/types
export type { ModuleOptions } from '@i18n-micro/types'
export type {
  I18nDevToolsBridge,
  JSONValue,
  LocaleData,
  TranslationContent,
} from '../bridge/interface'

export interface TreeNode {
  name: string
  fullPath: string
  isFile: boolean
  children: TreeNode[]
}
