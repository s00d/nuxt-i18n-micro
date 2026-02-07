import type { Locale } from '@i18n-micro/types'
import type { InjectionKey } from 'vue'
import type { VueI18n } from './composer'
import type { I18nRoutingStrategy } from './router/types'

export const I18nInjectionKey: InjectionKey<VueI18n> = Symbol('i18n')
export const I18nLocalesKey: InjectionKey<Locale[]> = Symbol('i18n-locales')
export const I18nDefaultLocaleKey: InjectionKey<string> = Symbol('i18n-default-locale')
export const I18nRouterKey: InjectionKey<I18nRoutingStrategy> = Symbol('i18n-router-strategy')
