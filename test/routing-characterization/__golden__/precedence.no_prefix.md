# precedence · no_prefix

$defineI18nRoute against the config on one page: the config's entry wins whole, whichever key form it uses

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect | meta.i18n |
|---|---|---|---|---|
| index | / |  |  | index: en, de, fr |
| about | /about |  |  | about: en, fr |
| contact | /contact |  |  | contact: en, fr |
| team | /team |  |  | team: en, fr |
| careers | /careers |  |  | careers: en |
| localized-about-de | /von-config |  |  | about: de |
| localized-contact-de | /kontakt-seite |  |  | contact: de |
| localized-team-de | /team-config |  |  | team: de |
| localized-careers-de | /jobs-seite |  |  | careers: de |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | null | null |
| /about | about | en | about | about | English | null | null | null |
| /careers | careers | en | careers | careers | English | null | null | null |
| /contact | contact | en | contact | contact | English | null | null | null |
| /jobs-seite | localized-careers-de | de | careers | careers | Deutsch | null | null | null |
| /kontakt-seite | localized-contact-de | de | contact | contact | Deutsch | null | null | null |
| /team | team | en | team | team | English | null | null | null |
| /team-config | localized-team-de | de | team | team | Deutsch | null | null | null |
| /von-config | localized-about-de | de | about | about | Deutsch | null | null | null |
| /en | null | en | index | index | English | en | null | null |
| /en/ | null | en | index | index | English | en | null | null |
| /de | null | en | index | index | English | de | null | null |
| /de/ | null | en | index | index | English | de | null | null |
| /about/ | about | en | about | about | English | null | null | null |
| /de/about/ | null | en | about | about | English | de | null | null |
| /missing | null | en |  | null | English | null | null | null |
| /de/missing | null | en |  | null | English | de | null | null |
| /xx/about | null | en |  | null | English | null | null | null |
| /de/de/about | null | en |  | null | English | de | null | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,fr,de |
| /careers | /careers?q=1#top [careers] |  | /careers?q=1#top [careers] | /careers?q=1#top [careers] | null | null | en,de |
| /contact | /contact?q=1#top [contact] |  | /contact?q=1#top [contact] | /contact?q=1#top [contact] | null | null | en,fr,de |
| /jobs-seite | /careers?q=1#top [careers] |  | /careers?q=1#top [careers] | /careers?q=1#top [careers] | null | null | en,de |
| /kontakt-seite | /contact?q=1#top [contact] |  | /contact?q=1#top [contact] | /contact?q=1#top [contact] | null | null | en,fr,de |
| /team | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | null | null | en,fr,de |
| /team-config | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | null | null | en,fr,de |
| /von-config | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,fr,de |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,fr,de |
| /de/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,fr,de |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about | /von-config?q=1#top [localized-about-de] |  | /von-config?q=1#top [localized-about-de] | /von-config?q=1#top [localized-about-de] | null | null | en,fr,de |
| /careers | /jobs-seite?q=1#top [localized-careers-de] |  | /jobs-seite?q=1#top [localized-careers-de] | /jobs-seite?q=1#top [localized-careers-de] | null | null | en,de |
| /contact | /kontakt-seite?q=1#top [localized-contact-de] |  | /kontakt-seite?q=1#top [localized-contact-de] | /kontakt-seite?q=1#top [localized-contact-de] | null | null | en,fr,de |
| /jobs-seite | /jobs-seite?q=1#top [localized-careers-de] |  | /jobs-seite?q=1#top [localized-careers-de] | /jobs-seite?q=1#top [localized-careers-de] | null | null | en,de |
| /kontakt-seite | /kontakt-seite?q=1#top [localized-contact-de] |  | /kontakt-seite?q=1#top [localized-contact-de] | /kontakt-seite?q=1#top [localized-contact-de] | null | null | en,fr,de |
| /team | /team-config?q=1#top [localized-team-de] |  | /team-config?q=1#top [localized-team-de] | /team-config?q=1#top [localized-team-de] | null | null | en,fr,de |
| /team-config | /team-config?q=1#top [localized-team-de] |  | /team-config?q=1#top [localized-team-de] | /team-config?q=1#top [localized-team-de] | null | null | en,fr,de |
| /von-config | /von-config?q=1#top [localized-about-de] |  | /von-config?q=1#top [localized-about-de] | /von-config?q=1#top [localized-about-de] | null | null | en,fr,de |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about/ | /von-config?q=1#top [localized-about-de] |  | /von-config?q=1#top [localized-about-de] | /von-config?q=1#top [localized-about-de] | null | null | en,fr,de |
| /de/about/ | /von-config?q=1#top [localized-about-de] |  | /von-config?q=1#top [localized-about-de] | /von-config?q=1#top [localized-about-de] | null | null | en,fr,de |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,fr,de |
| /careers | / [index] |  | / [index] | / [index] | null | null | en,de |
| /contact | /contact?q=1#top [contact] |  | /contact?q=1#top [contact] | /contact?q=1#top [contact] | null | null | en,fr,de |
| /jobs-seite | / [index] |  | / [index] | / [index] | null | null | en,de |
| /kontakt-seite | /contact?q=1#top [contact] |  | /contact?q=1#top [contact] | /contact?q=1#top [contact] | null | null | en,fr,de |
| /team | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | null | null | en,fr,de |
| /team-config | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | null | null | en,fr,de |
| /von-config | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,fr,de |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,fr,de |
| /de/about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,fr,de |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / |
|---|---|---|---|
| about | /about [about] | /von-config [localized-about-de] | /about [about] |
| careers | /careers [careers] | /jobs-seite [localized-careers-de] | / [index] |
| contact | /contact [contact] | /kontakt-seite [localized-contact-de] | /contact [contact] |
| index | / [index] | / [index] | / [index] |
| team | /team [team] | /team-config [localized-team-de] | /team [team] |

## Invariant breaks (2)

- /careers → fr → en: round trip ends on /, not /careers?q=1#top
- /jobs-seite → fr → de: round trip ends on /, not /jobs-seite?q=1#top
