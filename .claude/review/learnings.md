# Review learnings

What reviewers of this repo got wrong or must keep in mind, taken from cubic on 2026-11-02. Used by the `local-review` skill. A rule that no longer matches the code gets fixed or removed.

## bugs_logic (59)

### Match Script After Language Extlangs

When extracting a script subtag from a BCP-47 language tag, match it only after the language and any extlangs; do not treat extension subtags as scripts.

### Shared Astro Benchmark Pages

When reviewing Astro benchmark `[locale]` pages shared by SSR and static variants, do not flag `getStaticPaths` for removal solely because the SSR build uses server output; Astro ignores the export on server routes, while the static build needs it.

**Do not apply when:** Do not apply this exception to Astro server-route pages that are not also used to build the static variant.

### Normalize SSR Router URLs

When `createBrowserHistoryAdapter` uses `ssrUrl` as its server-side fallback, return only the URL’s path, query, and hash so absolute request URLs do not retain their origin.

### Stable useI18n Writers

When reviewing `useI18n` effects that depend on translation writers, verify that `addTranslations` and `addRouteTranslations` retain stable identities for each instance across snapshots.

### Preserve Repeated, Valueless, and Malformed Query Values

When parsing or building route query metadata (e.g. in `splitUrl`, the React adapter's `getRoute()`, or core `routeQuery`), match vue-router's query parsing to preserve repeated keys as arrays, keep `__proto__` keys safe by using array accumulation rather than `Object.fromEntries` (which drops repeated values to the last one), and return `null` (not `''`) for a valueless query key such as `?flag`, including when that key also has a valued occurrence (e.g. `?a&a=1` gives `{ a: [null, '1'] }`). In `routeQuery`, also apply a tolerant `decodeURIComponent` per pair so malformed percent-encoded values stay as written (instead of `URLSearchParams`' `�` replacement), and skip empty pairs so `?a&&b` contributes nothing. Treat the head builder's null-to-empty serialization as a separate concern so the parsed query form stays `null`.

**Do not apply when:** Do not apply the tolerant-decode and empty-pair requirements to helpers that intentionally substitute `URLSearchParams`' replacement behavior or serialize empty pairs, if such helpers exist.

### Preserve Preact cssText styles

When serializing Preact object styles to a CSS string, emit the `cssText` value as raw CSS text instead of converting it into a `css-text` declaration.

### Unitless CSS Custom Properties

When reviewing string-form `mergeStyles`, preserve numeric values for CSS custom properties beginning with `--` without appending a unit, consistent with Preact's `setStyle`.

### Preserve String Link Styles

When I18nLink applies activeStyle to an active link with a string-valued style, preserve the string style or normalize both style forms before merging.

**Do not apply when:** Do not apply a string-style corruption finding to Preact I18nLink, which preserves string styles; React style props accept objects only so string styles are not valid inputs there.

### Interpolate tc Default Values

When reviewing `tc()` calls with a non-empty default value, verify that `tc()` interpolates the default consistently with `t()`, including for configured plural rules.

### Switcher Browser Navigation Fallback

When reviewing I18nSwitcher, if a custom localeRoute is configured without a router or switchLocale, verify that the click is left to the browser for navigation.

### Island Translation Existence Semantics

For island `has` checks, do not flag fallback-only keys as a server-parity bug when `t` can answer them; island `has` indicates whether `t` can answer the key.

**Do not apply when:** `t` cannot answer the key in the island state.

### Resolve Additional Dirs Per Layer

For Nuxt types-generator `additionalTranslationDirs`, check that each configured relative directory is resolved against every layer root, matching the module’s behavior.

### Use Path-Aware Watcher Matching

When matching Nuxt types-generator watcher files against translation directories, use the shared `isInsideDir` helper rather than a raw prefix check so separator differences are normalized.

### Hidden Text Default Value Fallback

When Astro hidden-text rendering suppresses a missing translation, preserve the shared renderer behavior by rendering `defaultValue` bare.

### Locale home fallback for missing strategy paths

When a custom routing strategy returns no path for a locale home, preserve the locale-specific fallback: `/${locale}` for non-default locales and `/` for the default locale.

### Disabled Locale Prefix Handling

When `resolveLinkHref` normalizes an absolute href with a disabled locale prefix, treat that prefix as an ordinary path segment rather than stripping it as a locale.

**Do not apply when:** Do not apply this rule to enabled locale prefixes; the developer's clarification is specifically about disabled locales.

### Wrap Express next in run

When an Express middleware passes `next` to `i18n.run`, wrap it in a zero-argument callback so the fork supplied by `run` is not interpreted as an Express error argument.

### Test Reference Handling

When reviewing test-code references, preserve the CLI behavior that they count as usage for `clean` and `check --only unused`, while `extract` and the `undefined` check ignore them.

### Preserve Existing Pseudo Values

When reviewing `pseudo` without `--replace`, verify that it keeps every present target value except a blank string.

### Push the Saved Project Tree

When reviewing `sync-remote` push payload construction, verify it sends the project’s own tree as a save would write it, including changes pulled earlier in the same run.

### Document Hard-Link Write Limits

When reviewing `commit` and `writeFilesAtomic`, document that hard-linked targets must be written in place and that this limits the all-or-nothing guarantee.

### Reset Stateful Regex Before Fix

When a custom lint rule uses a `g` or `y` regex and has a replacement, reset the regex’s `lastIndex` before applying the replacement.

### Duplicate Finding File Attribution

When reviewing duplicate findings from the check command, verify that duplicate values are collected from the project's own locale files so each reported file contains the flagged key, rather than from inherited layer values.

### Per-Locale Unused Search

When reviewing `search --onlyUnused`, check inheritance separately for each locale, matching `clean`, so a removable locale override beside a layer key is listed.

### Match Translation Placeholder Multisets

When validating a translated answer in `isIntact`, compare its placeholders with the source placeholders as a multiset and reject any lost, repeated, or added placeholder.

### Check Placeholder Drift

When reviewing `check` placeholder validation, verify it uses the runtime grammar and compares occurrence counts for ordinary strings, but only placeholder presence for plural strings.

**Do not apply when:** Do not require occurrence-count equality for plural strings; compare placeholder presence only because each plural form repeats the placeholder.

### Rename Collision Handling

When multiple keys renamed to the same destination have different values, flag the collision and require rename to stop with exit code 2; allow the rename when the values are identical.

**Do not apply when:** Do not treat identical values written to the same destination as a conflict; the developer says those should still move.

### Slashless Dotted Link Convention

For i18n links, preserve `externalLinkHref` behavior that treats slash-less dotted targets as bare external domains; direct local-file links to use a leading slash.

**Do not apply when:** Do not apply the bare-domain convention to a local file path written with a leading slash (e.g., `/report.pdf`) or to a slashless dotted file name (e.g., `report.pdf`).

### x-default Locale Eligibility

When generating an x-default hreflang link, verify that the configured default locale is present in the locale list and its `seo` value is not `false`.

### Own-Property Locale Labels

When resolving a locale label from `customLabels`, use `ownValue` so prototype-named locale codes resolve only an explicitly provided label before falling back.

### Switcher Locale Path Resolution

When reviewing documentation for `$switchLocalePath(code)`, state that relative paths resolve under `app.baseURL` and locale `baseUrl` destinations on another domain remain absolute.

### VitePress format config forwarding

When reviewing VitePress `withI18n` format configuration, verify that `numberFormats`, `datetimeFormats`, and `timeZone` reach the theme through the virtual config, with explicit theme options taking precedence.

### Separate Date and Relative-Time Guidance

When documenting `timeZone` for date formatting, clarify that it can align calendar dates across runtimes but does not affect `relativeDate` calculations, which depend on the clock.

### Normalize Nuxt Route Groups

When deriving parent paths or `$defineI18nRoute` keys with `pageFilePathToRoutePath`, omit Nuxt `(group)` segments so both match the URL path.

### Preserve Prefixed Client Destinations

When `autoDetectPath` is `'*'`, the server ignores app state but still redirects prefixed URLs using the configured preference cookie and `Accept-Language`; `setLocale()` writes that cookie, so a plugin can redirect a prefixed URL on a later request. In documentation or code describing this wildcard behavior, verify that the cookie-based exception is stated and that `'/'` or `'no_prefix'` is recommended when explicit locale URLs should win. For client navigation targeting a locale-prefixed path, preserve the destination locale instead of redirecting to the stored preference.

**Do not apply when:** Do not apply this client-navigation rule to server-side entry requests, where the developer says `autoDetectPath: '*'` rewrites prefixed URLs; the server still uses the configured preference cookie even though it ignores app state.

### Preserve External Link Schemes

When reviewing external-link normalization in `externalLinkHref` and its link-component consumers, verify that `tel:`, `mailto:`, and `//` URLs pass through unchanged.

### Track Clears on Shared Cache

For the translation storage stale-write guard, keep the clear counter on the global `ChunkCache` so direct cache clears, including the HMR watcher’s, increment it.

### Unprefixed Prefix-and-Default Locale

When `getCurrentLocale` or `resolveLocaleFromPath` handles an unprefixed URL under `prefix_and_default`, use the default locale rather than allowing a stored locale to change it.

### Reject Removed Astro Integration Options

When reviewing `i18nIntegration` options, verify that `messages`, `plural`, `missingHandler`, and `routingStrategy` cause an error directing callers to `createI18n` or `createI18nMiddleware`, while explicitly `undefined` values remain accepted.

### Key Route Tables by Matching Options

When building shared route-array tables or the signature fallback, include both `strict` and `sensitive` in the cache key so routers with different matching options do not reuse route answers.

### Validate Query Locale Before Override

In `src/runtime/server/middleware/i18n.global.ts`, suppress the URL default locale for a `?locale` query only when that locale is included in `validLocales`.

### Copy Cached Route Arrays

When returning a cached route target, ensure array values in `params` and `query` are copied so callers cannot mutate the cached arrays.

### Match Nested Additional Directories

When reviewing devtools saves using an `additional:` path, verify that the prefix is matched against configured `additionalTranslationDirs` entries, including nested directory paths.

### Root-only reads when page locales are disabled

When reviewing mergeSourceTranslations with disablePageLocales enabled, verify it returns root translations alone without reading any pages/ files, including pages/index.

### Page Wins Under Disabled Locales

When `disablePageLocales` folds page files into the root bucket, preserve page-file precedence for conflicting keys regardless of file read order.

### Preserve Unmatched Prerender Routes

When prerender handles a URL that matches no page, return null from `path()` and preserve the URL during prefix cleanup instead of localizing or deleting it.

### Apply Params to String Route Switches

When reviewing string targets passed to `$switchRoute`, verify they are resolved with `localeRoute` in the current locale and then switched with `switchLocaleRoute` so `i18nRouteParams` apply.

### Preserve Unlocalized Page Meta Disabling

When reviewing route-strategy records for unlocalized pages with `disableMeta`, verify the value is stored as `meta.i18nNoMeta` and that `isMetaDisabled` reads it for nonlocalized routes.

### Ignore Double-Locale Remainders

When `shouldReturn404` examines a remaining path that begins with another locale, return `null` and leave the URL to the router rather than reporting a locale-not-allowed reason.

### Skip Param Redirect Targets

When reviewing `noPrefixRedirect` generation, skip assigning a string redirect if the localized target path contains a route parameter, because the redirect cannot carry that parameter.

### Normalize Declared Route Aliases

When processing declared route aliases in any of the four route strategies, use `BaseStrategy.declaredAliases()` to normalize a string alias to a list for base-route comparisons and `routeAliases`.

### Normalize Declared Route Aliases

When base-route comparisons or `routeAliases` handle a declared alias, use `BaseStrategy.declaredAliases()` so a single-string alias is normalized to a list and retained for localization.

### Guard Foreign Locale Suffix Stripping

When getBaseRouteName handles a localized route name with a foreign locale suffix, strip the suffix only if the router has a matching localized-suffixed, localized-unsuffixed, or base route; otherwise preserve the page name.

### Preserve Relative Child Paths

In `childSegment`, treat only absolute custom values as possible full URLs; preserve relative child values as written.

### Encoded Aliases for Shared Routes

When locales without custom paths share a route, verify that `buildEncodedPathAliases` is applied and its aliases are assigned to both `alias` and `meta.alias`.

### Equal Child and Parent Paths

In `childSegment`, when a child custom value equals the localized parent path, treat it as the parent’s own path and return an empty segment rather than duplicating the parent.

### Handle Skipped Levels in Child Paths

When resolving a full-URL child path that shares an ancestor with but skips an uncustomized intermediate level, keep the segment after the shared part instead of duplicating the path.

### Nested Rule URL Claims

When reviewing slash-keyed `globalLocaleRoutes` rules for top-level URL claims, count only absolute default-locale values; do not let relative or other-locale values claim a top-level URL, or add this claim to shared lookup keys.

### Distinguish and guard npm `view` failures

When reviewing `publishedVersions` (and related `check-versions` commands) that use `npm view <name> versions --json` to guard releases, treat npm failures as follows:
- Interpret an `E404` error code as “no published versions” and allow the first release.
- For any other error code, malformed error payload, or unparseable JSON body, treat the lookup as failed and return `null` so the release gate stays closed.
- Validate the npm error payload shape (e.g. via `isNpmError`) before reading `error.code`, so string, null, or otherwise malformed `error` values do not crash the script and instead count as lookup failures.

## testing_documentation (13)

### Complete Package Bump Command

When reviewing day-to-day workspace package bump instructions, flag `pnpm run bump` commands that omit the required `--level` or `--packages` arguments.

### Document isSSG Type and Runtime Status

When reviewing upgrade guidance for `ModuleOptionsExtend.isSSG`, describe it as an optional deprecated type property that is no longer populated at runtime, rather than saying the type drops it.

### Preserve Astro Peer Ranges

When changing shared catalog React or Preact ranges, preserve `@i18n-micro/astro`'s package-specific peer ranges because its client supports React 16.8+.

### Isolate runCli child environments

When constructing the child environment in `runCli`, remove inherited variables containing `TOKEN` or `API_KEY`, and remove `DEFAULT_LOCALE`, before applying `options.env`.

### Dry-run exit codes

When documenting exit codes for `clean`, `sync`, or a `sync-remote` pull, state that findings reported with `--dryRun` exit 0.

### Prefix Cross-Domain Link Paths

When reviewing `prefix` cross-domain locale links or their upgrade documentation, verify that the locale prefix is retained whether or not `baseDefault` is set.

### Scope Hash-Mode Redirect Claims

When reviewing hashMode documentation, scope the claim that the server never redirects to cases outside `prefix`; under `prefix`, documents such as `/about` and `/de` redirect into the hash.

### Switcher Includes Active Locale

When reviewing documentation for `<i18n-switcher>`, describe its dropdown as including all enabled locales, including the active locale.

### defaultPlural form selection

When reviewing documentation for `defaultPlural`, verify it says non-negative integer counts select the form at that index, clamped to the last, while negative, fractional, and `NaN` counts select the last form.

### i18n-t HTML Rendering Rules

When reviewing `<i18n-t>` rendering rules, verify that `html` is documented as applying in every case and that slots are ignored when `html` is enabled.

### Journey Status Check Convention

In `test/journeys/*.spec.ts`, use `request.get(path)` for ordinary status checks and set `{ maxRedirects: 0 }` when the check is specifically about the redirect.

### Include Logic-Bearing Index Entrypoints

Keep `index.ts` files in the Stryker mutation glob so logic-bearing entrypoints such as `devtools-ui` are mutated; barrel files produce no mutants.

### Route Metadata Runtime Boundary

When reviewing documentation about `@i18n-micro/route-strategy` and `@i18n-micro/path-strategy`, distinguish build-time localization rules from `meta.i18n` fields carried on router route records and read by the runtime.

## security_privacy (2)

### Locale-Domain SEO Origin Precedence

When reviewing SEO origin selection for locale-domain requests, verify that `metaBaseUrl` precedes the default locale’s `baseUrl`, which precedes `site.url`, and that the request origin remains the fallback when none is set.

### Filter Reserved Merge Keys

In `deepMergeTranslationsRecursive`, ensure every source key, including root `__proto__`, passes through the reserved-key filter even when the target is empty.

## performance (1)

### Distinguish Cache Eviction Policies

When reviewing `cacheMaxSize` documentation or cache eviction behavior, keep LRU claims scoped to the fetch and server caches, and identify the browser dictionary map as FIFO.
