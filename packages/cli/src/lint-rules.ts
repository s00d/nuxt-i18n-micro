export interface LintRule {
  name: string
  description: string
  check: (value: string, context: { key: string; locale: string; file: string }) => boolean
  message: (value: string, context: { key: string; locale: string; file: string }) => string
  fix?: (value: string) => string
}

export interface LintResult {
  file: string
  locale: string
  key: string
  value: string
  rule: string
  message: string
  fixedValue?: string
}

export interface LintConfig {
  enabledRules?: string[]
  disabledRules?: string[]
  customRules: LintRule[]
}

export const lintRules: LintRule[] = [
  {
    name: 'no-trailing-spaces',
    description: 'Check for trailing spaces',
    check: (value) => !value.includes('  \n') && !value.endsWith(' '),
    message: (value, { key, locale, file }) => `Found trailing spaces in file ${file} for key ${key} (${locale})`,
    fix: (value) => value.replace(/[ \t]+$/gm, ''),
  },
  {
    name: 'no-multiple-spaces',
    description: 'Check for multiple spaces',
    check: (value) => !value.includes('  '),
    message: (value, { key, locale, file }) => `Found multiple spaces in file ${file} for key ${key} (${locale})`,
    fix: (value) => value.replace(/ {2,}/g, ' '),
  },
  {
    name: 'no-empty-translation',
    description: 'Check for empty translations',
    check: (value) => value.trim().length > 0,
    message: (value, { key, locale, file }) => `Empty translation in file ${file} for key ${key} (${locale})`,
  },
  {
    name: 'no-html-tags',
    description: 'Check for HTML tags',
    check: (value) => !/<[^>]*>/.test(value),
    message: (value, { key, locale, file }) => `Found HTML tags in file ${file} for key ${key} (${locale})`,
  },
  {
    name: 'no-special-chars',
    description: 'Check for special characters',
    check: (value) => !/[^\p{L}\p{N}\p{P}\s]/u.test(value),
    message: (value, { key, locale, file }) => `Found special characters in file ${file} for key ${key} (${locale})`,
  },
  {
    name: 'no-mixed-case',
    description: 'Check for mixed case in sentence beginnings',
    check: (value) => {
      const sentences = value.split(/[.!?]\s+/)
      return sentences.every((sentence) => {
        if (sentence.length === 0) return true
        const firstChar = sentence[0]
        return firstChar === firstChar.toUpperCase() || !/[a-z]/i.test(firstChar)
      })
    },
    message: (value, { key, locale, file }) => `Found sentence with incorrect case in file ${file} for key ${key} (${locale})`,
    fix: (value) => {
      return value.replace(/([.!?]\s+)([a-z])/g, (_, punctuation, letter) => `${punctuation}${letter.toUpperCase()}`)
    },
  },
  {
    name: 'no-missing-punctuation',
    description: 'Check for missing punctuation at sentence ends',
    check: (value) => {
      const sentences = value.split(/([.!?]\s+)/)
      return sentences.every((sentence) => {
        if (sentence.length === 0) return true
        if (/^[.!?]\s*$/.test(sentence)) return true
        return /[.!?]$/.test(sentence) || !/[a-z]/i.test(sentence)
      })
    },
    message: (value, { key, locale, file }) => `Found sentence without punctuation in file ${file} for key ${key} (${locale})`,
    fix: (value) => {
      const parts = value.split(/([.!?]\s+)/)
      let result = ''

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        if (/^[.!?]\s*$/.test(part)) {
          result += part
          continue
        }

        if (part.trim().length > 0) {
          if (!/[.!?]$/.test(part) && /[a-z]/i.test(part)) {
            result += part.trim() + '.'
            if (i < parts.length - 1) result += ' '
          } else {
            result += part
          }
        }
      }

      return result
    },
  },
  {
    name: 'no-inconsistent-pluralization',
    description: 'Check for consistent pluralization',
    check: (value, { locale }) => {
      if (locale === 'en') {
        const words = value.toLowerCase().split(/\s+/)
        const hasPlural = words.some((word) => word.endsWith('s') && !word.endsWith('ss'))
        const hasSingular = words.some((word) => !word.endsWith('s') || word.endsWith('ss'))
        return !(hasPlural && hasSingular)
      }
      return true
    },
    message: (value, { key, locale, file }) => `Found inconsistent pluralization in file ${file} for key ${key} (${locale})`,
  },
]
