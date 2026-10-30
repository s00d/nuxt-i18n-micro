# precedence · prefix_except_default

$defineI18nRoute against the config on one page: the config's entry wins whole, whichever key form it uses

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect | meta.i18n |
|---|---|---|---|---|
| index | / |  |  | index: en |
| about | /about |  |  | about: en |
| contact | /contact |  |  | contact: en |
| team | /team |  |  | team: en |
| careers | /careers |  |  | careers: en |
| localized-index | /:locale(de\|fr) |  |  | index: de, fr |
| localized-about | /:locale(fr)/about |  |  | about: fr |
| localized-about-de | /:locale(de)/von-config |  |  | about: de |
| localized-contact | /:locale(fr)/contact |  |  | contact: fr |
| localized-contact-de | /:locale(de)/kontakt-seite |  |  | contact: de |
| localized-team | /:locale(fr)/team |  |  | team: fr |
| localized-team-de | /:locale(de)/team-config |  |  | team: de |
| localized-careers-de | /:locale(de)/jobs-seite |  |  | careers: de |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | en | null |
| /about | about | en | about | about | English | null | en | null |
| /careers | careers | en | careers | careers | English | null | en | null |
| /contact | contact | en | contact | contact | English | null | en | null |
| /de | localized-index | de | index | index | Deutsch | de | de | null |
| /de/jobs-seite | localized-careers-de | de | careers | careers | Deutsch | de | de | null |
| /de/kontakt-seite | localized-contact-de | de | contact | contact | Deutsch | de | de | null |
| /de/team-config | localized-team-de | de | team | team | Deutsch | de | de | null |
| /de/von-config | localized-about-de | de | about | about | Deutsch | de | de | null |
| /fr | localized-index | fr | index | index | Français | fr | fr | null |
| /fr/about | localized-about | fr | about | about | Français | fr | fr | null |
| /fr/contact | localized-contact | fr | contact | contact | Français | fr | fr | null |
| /fr/team | localized-team | fr | team | team | Français | fr | fr | null |
| /team | team | en | team | team | English | null | en | null |
| /en | null | en | index | index | English | en | en | Default locale should not have prefix |
| /en/ | null | en | index | index | English | en | en | Default locale should not have prefix |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | about | en | about | about | English | null | en | null |
| /de/about/ | null | de | about | about | Deutsch | de | de | null |
| /missing | null | en |  | null | English | null | en | null |
| /de/missing | null | de |  | null | Deutsch | de | de | null |
| /xx/about | null | en |  | null | English | null | en | null |
| /de/de/about | null | de |  | null | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,fr,de |
| /careers | /careers?q=1#top [careers] |  | /careers?q=1#top [careers] | /careers?q=1#top [careers] | null | null | en,de |
| /contact | /contact?q=1#top [contact] |  | /contact?q=1#top [contact] | /contact?q=1#top [contact] | null | null | en,fr,de |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /de/jobs-seite | /careers?q=1#top [careers] |  | /careers?q=1#top [careers] | /careers?q=1#top [careers] | null | /careers | en,de |
| /de/kontakt-seite | /contact?q=1#top [contact] |  | /contact?q=1#top [contact] | /contact?q=1#top [contact] | null | /contact | en,fr,de |
| /de/team-config | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | null | /team | en,fr,de |
| /de/von-config | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,fr,de |
| /fr | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /fr/about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,fr,de |
| /fr/contact | /contact?q=1#top [contact] |  | /contact?q=1#top [contact] | /contact?q=1#top [contact] | null | /contact | en,fr,de |
| /fr/team | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | null | /team | en,fr,de |
| /team | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | null | null | en,fr,de |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,fr,de |
| /de/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,fr,de |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | /missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | /de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | /de | en,de,fr |
| /about | /de/von-config?q=1#top [localized-about-de] |  | /de/von-config?q=1#top [localized-about-de] | /de/von-config?q=1#top [localized-about-de] | /de/von-config | /de/von-config | en,fr,de |
| /careers | /de/jobs-seite?q=1#top [localized-careers-de] |  | /de/jobs-seite?q=1#top [localized-careers-de] | /de/jobs-seite?q=1#top [localized-careers-de] | /de/jobs-seite | /de/jobs-seite | en,de |
| /contact | /de/kontakt-seite?q=1#top [localized-contact-de] |  | /de/kontakt-seite?q=1#top [localized-contact-de] | /de/kontakt-seite?q=1#top [localized-contact-de] | /de/kontakt-seite | /de/kontakt-seite | en,fr,de |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /de/jobs-seite | /de/jobs-seite?q=1#top [localized-careers-de] |  | /de/jobs-seite?q=1#top [localized-careers-de] | /de/jobs-seite?q=1#top [localized-careers-de] | null | null | en,de |
| /de/kontakt-seite | /de/kontakt-seite?q=1#top [localized-contact-de] |  | /de/kontakt-seite?q=1#top [localized-contact-de] | /de/kontakt-seite?q=1#top [localized-contact-de] | null | null | en,fr,de |
| /de/team-config | /de/team-config?q=1#top [localized-team-de] |  | /de/team-config?q=1#top [localized-team-de] | /de/team-config?q=1#top [localized-team-de] | null | null | en,fr,de |
| /de/von-config | /de/von-config?q=1#top [localized-about-de] |  | /de/von-config?q=1#top [localized-about-de] | /de/von-config?q=1#top [localized-about-de] | null | null | en,fr,de |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /fr/about | /de/von-config?q=1#top [localized-about-de] |  | /de/von-config?q=1#top [localized-about-de] | /de/von-config?q=1#top [localized-about-de] | null | /de/von-config | en,fr,de |
| /fr/contact | /de/kontakt-seite?q=1#top [localized-contact-de] |  | /de/kontakt-seite?q=1#top [localized-contact-de] | /de/kontakt-seite?q=1#top [localized-contact-de] | null | /de/kontakt-seite | en,fr,de |
| /fr/team | /de/team-config?q=1#top [localized-team-de] |  | /de/team-config?q=1#top [localized-team-de] | /de/team-config?q=1#top [localized-team-de] | null | /de/team-config | en,fr,de |
| /team | /de/team-config?q=1#top [localized-team-de] |  | /de/team-config?q=1#top [localized-team-de] | /de/team-config?q=1#top [localized-team-de] | /de/team-config | /de/team-config | en,fr,de |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /about/ | /de/von-config?q=1#top [localized-about-de] |  | /de/von-config?q=1#top [localized-about-de] | /de/von-config?q=1#top [localized-about-de] | /de/von-config | /de/von-config | en,fr,de |
| /de/about/ | /de/von-config?q=1#top [localized-about-de] |  | /de/von-config?q=1#top [localized-about-de] | /de/von-config?q=1#top [localized-about-de] | null | null | en,fr,de |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | /de/missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | null | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /de/xx/about | /de/xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/de/about?q=1#top [null] | /de/de/about?q=1#top [null] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | /fr | en,de,fr |
| /about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/about | /fr/about | en,fr,de |
| /careers | /fr [localized-index] |  | /fr [localized-index] | /fr [localized-index] | null | null | en,de |
| /contact | /fr/contact?q=1#top [localized-contact] |  | /fr/contact?q=1#top [localized-contact] | /fr/contact?q=1#top [localized-contact] | /fr/contact | /fr/contact | en,fr,de |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/jobs-seite | /fr [localized-index] |  | /fr [localized-index] | /fr [localized-index] | null | null | en,de |
| /de/kontakt-seite | /fr/contact?q=1#top [localized-contact] |  | /fr/contact?q=1#top [localized-contact] | /fr/contact?q=1#top [localized-contact] | null | /fr/contact | en,fr,de |
| /de/team-config | /fr/team?q=1#top [localized-team] |  | /fr/team?q=1#top [localized-team] | /fr/team?q=1#top [localized-team] | null | /fr/team | en,fr,de |
| /de/von-config | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,fr,de |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,fr |
| /fr/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | null | en,fr,de |
| /fr/contact | /fr/contact?q=1#top [localized-contact] |  | /fr/contact?q=1#top [localized-contact] | /fr/contact?q=1#top [localized-contact] | null | null | en,fr,de |
| /fr/team | /fr/team?q=1#top [localized-team] |  | /fr/team?q=1#top [localized-team] | /fr/team?q=1#top [localized-team] | null | null | en,fr,de |
| /team | /fr/team?q=1#top [localized-team] |  | /fr/team?q=1#top [localized-team] | /fr/team?q=1#top [localized-team] | /fr/team | /fr/team | en,fr,de |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/about | /fr/about | en,fr,de |
| /de/about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,fr,de |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /fr/missing | /fr/missing | null |
| /de/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | /fr/missing | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | /fr/xx/about | /fr/xx/about | null |
| /de/de/about | /fr/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | null | /fr/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /about [about] | /de/von-config [localized-about-de] | /fr/about [localized-about] | /about [about] | /de/von-config [localized-about-de] | /fr/about [localized-about] | /about [about] | /de/von-config [localized-about-de] | /fr/about [localized-about] |
| careers | /careers [careers] | /de/jobs-seite [localized-careers-de] | /fr [localized-index] | /careers [careers] | /de/jobs-seite [localized-careers-de] | /fr [localized-index] | /careers [careers] | /de/jobs-seite [localized-careers-de] | /fr [localized-index] |
| contact | /contact [contact] | /de/kontakt-seite [localized-contact-de] | /fr/contact [localized-contact] | /contact [contact] | /de/kontakt-seite [localized-contact-de] | /fr/contact [localized-contact] | /contact [contact] | /de/kontakt-seite [localized-contact-de] | /fr/contact [localized-contact] |
| index | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] |
| team | /team [team] | /de/team-config [localized-team-de] | /fr/team [localized-team] | /team [team] | /de/team-config [localized-team-de] | /fr/team [localized-team] | /team [team] | /de/team-config [localized-team-de] | /fr/team [localized-team] |

## Invariant breaks (2)

- /careers → fr → en: round trip ends on /, not /careers?q=1#top
- /de/jobs-seite → fr → de: round trip ends on /de, not /de/jobs-seite?q=1#top
