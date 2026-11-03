# precedence · prefix_and_default

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
| localized-index | /:locale(en\|de\|fr) |  |  | index: en, de, fr |
| localized-about | /:locale(en\|fr)/about |  |  | about: en, fr |
| localized-about-de | /:locale(de)/von-config |  |  | about: de |
| localized-contact | /:locale(en\|fr)/contact |  |  | contact: en, fr |
| localized-contact-de | /:locale(de)/kontakt-seite |  |  | contact: de |
| localized-team | /:locale(en\|fr)/team |  |  | team: en, fr |
| localized-team-de | /:locale(de)/team-config |  |  | team: de |
| localized-careers | /:locale(en)/careers |  |  | careers: en |
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
| /en | localized-index | en | index | index | English | en | en | null |
| /en/about | localized-about | en | about | about | English | en | en | null |
| /en/careers | localized-careers | en | careers | careers | English | en | en | null |
| /en/contact | localized-contact | en | contact | contact | English | en | en | null |
| /en/team | localized-team | en | team | team | English | en | en | null |
| /fr | localized-index | fr | index | index | Français | fr | fr | null |
| /fr/about | localized-about | fr | about | about | Français | fr | fr | null |
| /fr/contact | localized-contact | fr | contact | contact | Français | fr | fr | null |
| /fr/team | localized-team | fr | team | team | Français | fr | fr | null |
| /team | team | en | team | team | English | null | en | null |
| /en/ | localized-index | en | index | index | English | en | en | null |
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
| / | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | null | en,fr,de |
| /careers | /en/careers?q=1#top [localized-careers] |  | /en/careers?q=1#top [localized-careers] | /en/careers?q=1#top [localized-careers] | null | null | en,de |
| /contact | /en/contact?q=1#top [localized-contact] |  | /en/contact?q=1#top [localized-contact] | /en/contact?q=1#top [localized-contact] | null | null | en,fr,de |
| /de | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /de/jobs-seite | /en/careers?q=1#top [localized-careers] |  | /en/careers?q=1#top [localized-careers] | /en/careers?q=1#top [localized-careers] | null | /en/careers | en,de |
| /de/kontakt-seite | /en/contact?q=1#top [localized-contact] |  | /en/contact?q=1#top [localized-contact] | /en/contact?q=1#top [localized-contact] | null | /en/contact | en,fr,de |
| /de/team-config | /en/team?q=1#top [localized-team] |  | /en/team?q=1#top [localized-team] | /en/team?q=1#top [localized-team] | null | /en/team | en,fr,de |
| /de/von-config | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | /en/about | en,fr,de |
| /en | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /en/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | null | en,fr,de |
| /en/careers | /en/careers?q=1#top [localized-careers] |  | /en/careers?q=1#top [localized-careers] | /en/careers?q=1#top [localized-careers] | null | null | en,de |
| /en/contact | /en/contact?q=1#top [localized-contact] |  | /en/contact?q=1#top [localized-contact] | /en/contact?q=1#top [localized-contact] | null | null | en,fr,de |
| /en/team | /en/team?q=1#top [localized-team] |  | /en/team?q=1#top [localized-team] | /en/team?q=1#top [localized-team] | null | null | en,fr,de |
| /fr | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /fr/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | /en/about | en,fr,de |
| /fr/contact | /en/contact?q=1#top [localized-contact] |  | /en/contact?q=1#top [localized-contact] | /en/contact?q=1#top [localized-contact] | null | /en/contact | en,fr,de |
| /fr/team | /en/team?q=1#top [localized-team] |  | /en/team?q=1#top [localized-team] | /en/team?q=1#top [localized-team] | null | /en/team | en,fr,de |
| /team | /en/team?q=1#top [localized-team] |  | /en/team?q=1#top [localized-team] | /en/team?q=1#top [localized-team] | null | null | en,fr,de |
| /en/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | null | en,de,fr |
| /de/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | null | /en | en,de,fr |
| /about/ | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | null | en,fr,de |
| /de/about/ | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | null | /en/about | en,fr,de |
| /missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | null | null | null |
| /de/missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | null | null | null |
| /xx/about | /en/xx/about?q=1#top [—] |  | /en/xx/about?q=1#top [null] | /en/xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /en/de/about?q=1#top [—] |  | /en/de/about?q=1#top [null] | /en/de/about?q=1#top [null] | null | null | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /about | /de/von-config?q=1#top [localized-about-de] |  | /de/von-config?q=1#top [localized-about-de] | /de/von-config?q=1#top [localized-about-de] | null | null | en,fr,de |
| /careers | /de/jobs-seite?q=1#top [localized-careers-de] |  | /de/jobs-seite?q=1#top [localized-careers-de] | /de/jobs-seite?q=1#top [localized-careers-de] | null | null | en,de |
| /contact | /de/kontakt-seite?q=1#top [localized-contact-de] |  | /de/kontakt-seite?q=1#top [localized-contact-de] | /de/kontakt-seite?q=1#top [localized-contact-de] | null | null | en,fr,de |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /de/jobs-seite | /de/jobs-seite?q=1#top [localized-careers-de] |  | /de/jobs-seite?q=1#top [localized-careers-de] | /de/jobs-seite?q=1#top [localized-careers-de] | null | null | en,de |
| /de/kontakt-seite | /de/kontakt-seite?q=1#top [localized-contact-de] |  | /de/kontakt-seite?q=1#top [localized-contact-de] | /de/kontakt-seite?q=1#top [localized-contact-de] | null | null | en,fr,de |
| /de/team-config | /de/team-config?q=1#top [localized-team-de] |  | /de/team-config?q=1#top [localized-team-de] | /de/team-config?q=1#top [localized-team-de] | null | null | en,fr,de |
| /de/von-config | /de/von-config?q=1#top [localized-about-de] |  | /de/von-config?q=1#top [localized-about-de] | /de/von-config?q=1#top [localized-about-de] | null | null | en,fr,de |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /en/about | /de/von-config?q=1#top [localized-about-de] |  | /de/von-config?q=1#top [localized-about-de] | /de/von-config?q=1#top [localized-about-de] | null | /de/von-config | en,fr,de |
| /en/careers | /de/jobs-seite?q=1#top [localized-careers-de] |  | /de/jobs-seite?q=1#top [localized-careers-de] | /de/jobs-seite?q=1#top [localized-careers-de] | null | /de/jobs-seite | en,de |
| /en/contact | /de/kontakt-seite?q=1#top [localized-contact-de] |  | /de/kontakt-seite?q=1#top [localized-contact-de] | /de/kontakt-seite?q=1#top [localized-contact-de] | null | /de/kontakt-seite | en,fr,de |
| /en/team | /de/team-config?q=1#top [localized-team-de] |  | /de/team-config?q=1#top [localized-team-de] | /de/team-config?q=1#top [localized-team-de] | null | /de/team-config | en,fr,de |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /fr/about | /de/von-config?q=1#top [localized-about-de] |  | /de/von-config?q=1#top [localized-about-de] | /de/von-config?q=1#top [localized-about-de] | null | /de/von-config | en,fr,de |
| /fr/contact | /de/kontakt-seite?q=1#top [localized-contact-de] |  | /de/kontakt-seite?q=1#top [localized-contact-de] | /de/kontakt-seite?q=1#top [localized-contact-de] | null | /de/kontakt-seite | en,fr,de |
| /fr/team | /de/team-config?q=1#top [localized-team-de] |  | /de/team-config?q=1#top [localized-team-de] | /de/team-config?q=1#top [localized-team-de] | null | /de/team-config | en,fr,de |
| /team | /de/team-config?q=1#top [localized-team-de] |  | /de/team-config?q=1#top [localized-team-de] | /de/team-config?q=1#top [localized-team-de] | null | null | en,fr,de |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /about/ | /de/von-config?q=1#top [localized-about-de] |  | /de/von-config?q=1#top [localized-about-de] | /de/von-config?q=1#top [localized-about-de] | null | null | en,fr,de |
| /de/about/ | /de/von-config?q=1#top [localized-about-de] |  | /de/von-config?q=1#top [localized-about-de] | /de/von-config?q=1#top [localized-about-de] | null | null | en,fr,de |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | null | null |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | null | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/de/about?q=1#top [null] | /de/de/about?q=1#top [null] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,fr |
| /about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | null | en,fr,de |
| /careers | /fr [localized-index] |  | /fr [localized-index] | /fr [localized-index] | null | null | en,de |
| /contact | /fr/contact?q=1#top [localized-contact] |  | /fr/contact?q=1#top [localized-contact] | /fr/contact?q=1#top [localized-contact] | null | null | en,fr,de |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/jobs-seite | /fr [localized-index] |  | /fr [localized-index] | /fr [localized-index] | null | null | en,de |
| /de/kontakt-seite | /fr/contact?q=1#top [localized-contact] |  | /fr/contact?q=1#top [localized-contact] | /fr/contact?q=1#top [localized-contact] | null | /fr/contact | en,fr,de |
| /de/team-config | /fr/team?q=1#top [localized-team] |  | /fr/team?q=1#top [localized-team] | /fr/team?q=1#top [localized-team] | null | /fr/team | en,fr,de |
| /de/von-config | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,fr,de |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /en/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,fr,de |
| /en/careers | /fr [localized-index] |  | /fr [localized-index] | /fr [localized-index] | null | null | en,de |
| /en/contact | /fr/contact?q=1#top [localized-contact] |  | /fr/contact?q=1#top [localized-contact] | /fr/contact?q=1#top [localized-contact] | null | /fr/contact | en,fr,de |
| /en/team | /fr/team?q=1#top [localized-team] |  | /fr/team?q=1#top [localized-team] | /fr/team?q=1#top [localized-team] | null | /fr/team | en,fr,de |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,fr |
| /fr/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | null | en,fr,de |
| /fr/contact | /fr/contact?q=1#top [localized-contact] |  | /fr/contact?q=1#top [localized-contact] | /fr/contact?q=1#top [localized-contact] | null | null | en,fr,de |
| /fr/team | /fr/team?q=1#top [localized-team] |  | /fr/team?q=1#top [localized-team] | /fr/team?q=1#top [localized-team] | null | null | en,fr,de |
| /team | /fr/team?q=1#top [localized-team] |  | /fr/team?q=1#top [localized-team] | /fr/team?q=1#top [localized-team] | null | null | en,fr,de |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | null | en,fr,de |
| /de/about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,fr,de |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | null | null |
| /de/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | null | null | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /fr/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | null | null | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /en/about [localized-about] | /de/von-config [localized-about-de] | /fr/about [localized-about] | /en/about [localized-about] | /de/von-config [localized-about-de] | /fr/about [localized-about] | /en/about [localized-about] | /de/von-config [localized-about-de] | /fr/about [localized-about] |
| careers | /en/careers [localized-careers] | /de/jobs-seite [localized-careers-de] | /fr [localized-index] | /en/careers [localized-careers] | /de/jobs-seite [localized-careers-de] | /fr [localized-index] | /en/careers [localized-careers] | /de/jobs-seite [localized-careers-de] | /fr [localized-index] |
| contact | /en/contact [localized-contact] | /de/kontakt-seite [localized-contact-de] | /fr/contact [localized-contact] | /en/contact [localized-contact] | /de/kontakt-seite [localized-contact-de] | /fr/contact [localized-contact] | /en/contact [localized-contact] | /de/kontakt-seite [localized-contact-de] | /fr/contact [localized-contact] |
| index | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] |
| team | /en/team [localized-team] | /de/team-config [localized-team-de] | /fr/team [localized-team] | /en/team [localized-team] | /de/team-config [localized-team-de] | /fr/team [localized-team] | /en/team [localized-team] | /de/team-config [localized-team-de] | /fr/team [localized-team] |

## Invariant breaks (0)

none
