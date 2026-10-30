// The pure core. Framework adapters live in their own entries (`./client/vue`, `./client/react`,
// `./client/preact`, `./client/svelte`): each needs its framework installed, and an island needs one.
export type { I18nState } from './core'
export { hasTranslation, translate } from './core'
