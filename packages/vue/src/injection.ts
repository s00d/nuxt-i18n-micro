import type { InjectionKey } from 'vue'
import type { VueI18n } from './composer'
import type { Locale } from '@i18n-micro/types'

export const I18nInjectionKey: InjectionKey<VueI18n> = Symbol('i18n')
export const I18nLocalesKey: InjectionKey<Locale[]> = Symbol('i18n-locales')
export const I18nDefaultLocaleKey: InjectionKey<string> = Symbol('i18n-default-locale')
