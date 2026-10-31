<script lang="ts">
  import type { I18nClientProps } from '@i18n-micro/astro'
  import { createI18nStore, useAstroI18n } from '@i18n-micro/astro/client/svelte'

  const { i18n }: { i18n: I18nClientProps } = $props()
  const { t, tc, tn, td, tdr, has, locale } = useAstroI18n(createI18nStore(i18n))
</script>

<span data-testid="svelte-t">{t('welcome')}</span>
<span data-testid="svelte-param">{t('greeting', { name: 'Ada' })}</span>
<span data-testid="svelte-nested">{t('section.title')}</span>
<span data-testid="svelte-tc">{tc('apples', 2)}</span>
<span data-testid="svelte-tn">{tn(1234.5)}</span>
<span data-testid="svelte-td">{td(0)}</span>
<span data-testid="svelte-tdr">{tdr(Date.now() - 3600000)}</span>
<span data-testid="svelte-has">{has('welcome')} {has('not.passed')}</span>
<span data-testid="svelte-missing">{t('not.passed')}</span>
<span data-testid="svelte-locale">{String(locale)}</span>
