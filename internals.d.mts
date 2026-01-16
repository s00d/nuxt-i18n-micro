declare module '#build/i18n.plural.mjs' {
  export function plural(key: string, count: number, params: Record<string, string | number | boolean>, locale: string, getter: (key: string | string[], params?: Record<string, string | number | boolean>, defaultValue?: string) => unknown): string | null
}
