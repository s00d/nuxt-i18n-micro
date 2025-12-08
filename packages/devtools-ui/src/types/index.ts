// Re-export types from bridge
export type {
  JSONValue,
  TranslationContent,
  LocaleData,
  I18nDevToolsBridge,
} from '../bridge/interface'

// Re-export types from @i18n-micro/types
export type { ModuleOptions } from '@i18n-micro/types'

export interface TreeNode {
  name: string
  fullPath: string
  isFile: boolean
  children: TreeNode[]
}
