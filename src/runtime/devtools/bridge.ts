import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { Ref } from 'vue'
import type { NuxtI18n } from '../utils/nuxt-i18n'

export const I18N_DEVTOOLS_BRIDGE_KEY = 'i18n-micro-devtools-bridge'

export interface I18nDevtoolsBridge {
  i18n: NuxtI18n
  i18nConfig: ModuleOptionsExtend
  localeState: Ref<string | null>
}
