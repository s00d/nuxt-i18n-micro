import { tv } from 'tailwind-variants'

// tailwind-variants' defaults are what this app wants (twMerge on, no twMergeConfig), so tv is used as is.
// Do not pass a twMergeConfig per call: tailwind-variants keeps one merger per process and rebuilds it
// whenever the config object differs (shallow compare). If a custom class group is ever needed,
// configure it once with createTV in this file.
export { tv }
