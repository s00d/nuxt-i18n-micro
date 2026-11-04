import { FormatService } from '@i18n-micro/core'
import type { ResolvedI18nConfig } from '@i18n-micro/types'

const formatters = new WeakMap<ResolvedI18nConfig, FormatService>()

/**
 * The server's formatters. `Intl` objects are costly and depend only on what the service is built
 * from, so requests share them: its input is this read-only config, and no request reaches it
 * (`$tn` and `$td` pass the locale per call). One per resolved config: runtime overrides and hosts.
 * No vue here: the page plugin and the Nitro helpers share it.
 */
export function formatterFor(config: ResolvedI18nConfig): FormatService {
  let formatter = formatters.get(config)
  if (!formatter) formatters.set(config, (formatter = new FormatService(config)))
  return formatter
}
