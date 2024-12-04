import type { Params } from './types'

export function interpolate(template: string, params: Params): string {
  let result = template

  for (const key in params) {
    result = result.split(`{${key}}`).join(String(params[key]))
  }

  return result
}
