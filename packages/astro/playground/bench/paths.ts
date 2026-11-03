import { localeCodes } from '../../../../benchmark/integrations/catalogue'

/** The prefixed locales of a static build, `/en` too for the prefix-all strategy. A new list per route: Astro keeps its index on the list. */
export const localePaths = () => localeCodes.map((locale) => ({ params: { locale } }))
