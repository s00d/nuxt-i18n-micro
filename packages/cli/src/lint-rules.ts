import type { LintRuleName } from './spec'

export interface LintRule {
  name: string
  description: string
  isValid: (value: string) => boolean
  fix?: (value: string) => string
}

/** Rules for what is wrong in any language. Whether a text ends in a period is not one of them. */
export const lintRules: Record<LintRuleName, Pick<LintRule, 'isValid' | 'fix'>> = {
  'no-trailing-spaces': {
    isValid: (value) => !/[ \t]$/m.test(value),
    fix: (value) => value.replace(/[ \t]+$/gm, ''),
  },
  'no-multiple-spaces': {
    isValid: (value) => !value.includes('  '),
    fix: (value) => value.replace(/ {2,}/g, ' '),
  },
  'no-empty-translation': {
    isValid: (value) => value.trim().length > 0,
  },
}
