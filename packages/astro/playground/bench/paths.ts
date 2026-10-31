import { localeCodes } from '../../../../benchmark/integrations/catalogue'

/** The prefixed locales of a static build: every code but the default one, `/en` included for the prefix-all strategy. */
export const localePaths = localeCodes.map((locale) => ({ params: { locale } }))
