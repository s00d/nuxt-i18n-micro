# dashed · no_prefix

pages that share a Nuxt route name (about-team) and dashed folders, keyed by name and by file path

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect | meta.i18n |
|---|---|---|---|---|
| index | / |  |  | index: en, de, fr |
| about | /about |  |  | about: en, fr |
| about-team | /about-team |  |  | about-team: en |
| team | /team |  |  | team: en, fr |
| · team-members | members |  |  | team-members: en, fr |
| docs | /docs |  |  | docs: en, de, fr |
| docs-getting-started | /docs/getting-started |  |  | docs-getting-started: fr |
| foo-bar-baz | /foo-bar/baz |  |  | foo-bar-baz: en, de, fr |
| localized-about-de | /ueber-uns |  |  | about: de |
| localized-about-team-de | /team-seite |  |  | about-team: de |
| localized-about-team-fr | /equipe |  |  | about-team: fr |
| localized-team-de | /mannschaft |  |  | team: de |
| · localized-team-members-de | mitglieder |  |  | team-members: de |
| localized-docs-getting-started-en | /docs/start |  |  | docs-getting-started: en |
| localized-docs-getting-started-de | /dokumente/einstieg |  |  | docs-getting-started: de |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | null | null |
| /about | about | en | about | about | English | null | null | null |
| /about-team | about-team | en | about-team | about-team | English | null | null | null |
| /docs | docs | en | docs | docs | English | null | null | null |
| /docs/getting-started | docs-getting-started | en | docs-getting-started | docs-getting-started | English | null | null | null |
| /docs/start | localized-docs-getting-started-en | en | docs-getting-started | docs-getting-started | English | null | null | null |
| /dokumente/einstieg | localized-docs-getting-started-de | de | docs-getting-started | docs-getting-started | Deutsch | null | null | null |
| /equipe | localized-about-team-fr | fr | about-team | about-team | Français | null | null | null |
| /foo-bar/baz | foo-bar-baz | en | foo-bar-baz | foo-bar-baz | English | null | null | null |
| /mannschaft | localized-team-de | de | team | team | Deutsch | null | null | null |
| /mannschaft/mitglieder | localized-team-members-de | de | team-members | team-members | Deutsch | null | null | null |
| /team | team | en | team | team | English | null | null | null |
| /team-seite | localized-about-team-de | de | about-team | about-team | Deutsch | null | null | null |
| /team/members | team-members | en | team-members | team-members | English | null | null | null |
| /ueber-uns | localized-about-de | de | about | about | Deutsch | null | null | null |
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
| /about-team | /about-team?q=1#top [about-team] |  | /about-team?q=1#top [about-team] | /about-team?q=1#top [about-team] | null | null | en,de,fr |
| /docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | null | null | en,de,fr |
| /docs/getting-started | /docs/start?q=1#top [localized-docs-getting-started-en] |  | /docs/start?q=1#top [localized-docs-getting-started-en] | /docs/start?q=1#top [localized-docs-getting-started-en] | null | null | fr,en,de |
| /docs/start | /docs/start?q=1#top [localized-docs-getting-started-en] |  | /docs/start?q=1#top [localized-docs-getting-started-en] | /docs/start?q=1#top [localized-docs-getting-started-en] | null | null | fr,en,de |
| /dokumente/einstieg | /docs/start?q=1#top [localized-docs-getting-started-en] |  | /docs/start?q=1#top [localized-docs-getting-started-en] | /docs/start?q=1#top [localized-docs-getting-started-en] | null | null | fr,en,de |
| /equipe | /about-team?q=1#top [about-team] |  | /about-team?q=1#top [about-team] | /about-team?q=1#top [about-team] | null | null | en,de,fr |
| /foo-bar/baz | /foo-bar/baz?q=1#top [foo-bar-baz] |  | /foo-bar/baz?q=1#top [foo-bar-baz] | /foo-bar/baz?q=1#top [foo-bar-baz] | null | null | en,de,fr |
| /mannschaft | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | null | null | en,fr,de |
| /mannschaft/mitglieder | /team/members?q=1#top [team-members] |  | /team/members?q=1#top [team-members] | /team/members?q=1#top [team-members] | null | null | en,fr,de |
| /team | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | null | null | en,fr,de |
| /team-seite | /about-team?q=1#top [about-team] |  | /about-team?q=1#top [about-team] | /about-team?q=1#top [about-team] | null | null | en,de,fr |
| /team/members | /team/members?q=1#top [team-members] |  | /team/members?q=1#top [team-members] | /team/members?q=1#top [team-members] | null | null | en,fr,de |
| /ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,fr,de |
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
| /about | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | null | null | en,fr,de |
| /about-team | /team-seite?q=1#top [localized-about-team-de] |  | /team-seite?q=1#top [localized-about-team-de] | /team-seite?q=1#top [localized-about-team-de] | null | null | en,de,fr |
| /docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | null | null | en,de,fr |
| /docs/getting-started | /dokumente/einstieg?q=1#top [localized-docs-getting-started-de] |  | /dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | null | null | fr,en,de |
| /docs/start | /dokumente/einstieg?q=1#top [localized-docs-getting-started-de] |  | /dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | null | null | fr,en,de |
| /dokumente/einstieg | /dokumente/einstieg?q=1#top [localized-docs-getting-started-de] |  | /dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | null | null | fr,en,de |
| /equipe | /team-seite?q=1#top [localized-about-team-de] |  | /team-seite?q=1#top [localized-about-team-de] | /team-seite?q=1#top [localized-about-team-de] | null | null | en,de,fr |
| /foo-bar/baz | /foo-bar/baz?q=1#top [foo-bar-baz] |  | /foo-bar/baz?q=1#top [foo-bar-baz] | /foo-bar/baz?q=1#top [foo-bar-baz] | null | null | en,de,fr |
| /mannschaft | /mannschaft?q=1#top [localized-team-de] |  | /mannschaft?q=1#top [localized-team-de] | /mannschaft?q=1#top [localized-team-de] | null | null | en,fr,de |
| /mannschaft/mitglieder | /mannschaft/mitglieder?q=1#top [localized-team-members-de] |  | /mannschaft/mitglieder?q=1#top [localized-team-members-de] | /mannschaft/mitglieder?q=1#top [localized-team-members-de] | null | null | en,fr,de |
| /team | /mannschaft?q=1#top [localized-team-de] |  | /mannschaft?q=1#top [localized-team-de] | /mannschaft?q=1#top [localized-team-de] | null | null | en,fr,de |
| /team-seite | /team-seite?q=1#top [localized-about-team-de] |  | /team-seite?q=1#top [localized-about-team-de] | /team-seite?q=1#top [localized-about-team-de] | null | null | en,de,fr |
| /team/members | /mannschaft/mitglieder?q=1#top [localized-team-members-de] |  | /mannschaft/mitglieder?q=1#top [localized-team-members-de] | /mannschaft/mitglieder?q=1#top [localized-team-members-de] | null | null | en,fr,de |
| /ueber-uns | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | null | null | en,fr,de |
| /en | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /en/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about/ | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | null | null | en,fr,de |
| /de/about/ | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | null | null | en,fr,de |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /de/missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | null | null | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | null | null | null |
| /de/de/about | /de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | null | en,de,fr |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,fr,de |
| /about-team | /equipe?q=1#top [localized-about-team-fr] |  | /equipe?q=1#top [localized-about-team-fr] | /equipe?q=1#top [localized-about-team-fr] | null | null | en,de,fr |
| /docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | null | null | en,de,fr |
| /docs/getting-started | /docs/getting-started?q=1#top [docs-getting-started] |  | /docs/getting-started?q=1#top [docs-getting-started] | /docs/getting-started?q=1#top [docs-getting-started] | null | null | fr,en,de |
| /docs/start | /docs/getting-started?q=1#top [docs-getting-started] |  | /docs/getting-started?q=1#top [docs-getting-started] | /docs/getting-started?q=1#top [docs-getting-started] | null | null | fr,en,de |
| /dokumente/einstieg | /docs/getting-started?q=1#top [docs-getting-started] |  | /docs/getting-started?q=1#top [docs-getting-started] | /docs/getting-started?q=1#top [docs-getting-started] | null | null | fr,en,de |
| /equipe | /equipe?q=1#top [localized-about-team-fr] |  | /equipe?q=1#top [localized-about-team-fr] | /equipe?q=1#top [localized-about-team-fr] | null | null | en,de,fr |
| /foo-bar/baz | /foo-bar/baz?q=1#top [foo-bar-baz] |  | /foo-bar/baz?q=1#top [foo-bar-baz] | /foo-bar/baz?q=1#top [foo-bar-baz] | null | null | en,de,fr |
| /mannschaft | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | null | null | en,fr,de |
| /mannschaft/mitglieder | /team/members?q=1#top [team-members] |  | /team/members?q=1#top [team-members] | /team/members?q=1#top [team-members] | null | null | en,fr,de |
| /team | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | null | null | en,fr,de |
| /team-seite | /equipe?q=1#top [localized-about-team-fr] |  | /equipe?q=1#top [localized-about-team-fr] | /equipe?q=1#top [localized-about-team-fr] | null | null | en,de,fr |
| /team/members | /team/members?q=1#top [team-members] |  | /team/members?q=1#top [team-members] | /team/members?q=1#top [team-members] | null | null | en,fr,de |
| /ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | null | en,fr,de |
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
| about | /about [about] | /ueber-uns [localized-about-de] | /about [about] |
| about-team | /about-team [about-team] | /team-seite [localized-about-team-de] | /equipe [localized-about-team-fr] |
| docs | /docs [docs] | /docs [docs] | /docs [docs] |
| docs-getting-started | /docs/start [localized-docs-getting-started-en] | /dokumente/einstieg [localized-docs-getting-started-de] | /docs/getting-started [docs-getting-started] |
| foo-bar-baz | /foo-bar/baz [foo-bar-baz] | /foo-bar/baz [foo-bar-baz] | /foo-bar/baz [foo-bar-baz] |
| index | / [index] | / [index] | / [index] |
| team | /team [team] | /mannschaft [localized-team-de] | /team [team] |
| team-members | /team/members [team-members] | /mannschaft/mitglieder [localized-team-members-de] | /team/members [team-members] |

## Invariant breaks (0)

none
