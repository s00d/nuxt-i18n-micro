# dashed · no_prefix

pages that share a Nuxt route name (about-team) and dashed folders, keyed by name and by file path

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| index | / |  |  |
| about | /about |  |  |
| about-team | /about-team |  |  |
| team | /team |  |  |
| · team-members | members |  |  |
| docs | /docs |  |  |
| docs-getting-started | /docs/getting-started |  |  |
| foo-bar-baz | /foo-bar/baz |  |  |
| localized-about-de | /ueber-uns |  |  |
| localized-about-team-de | /team-seite |  |  |
| localized-about-team-fr | /equipe |  |  |
| localized-team-de | /mannschaft |  |  |
| · localized-team-members-de | mitglieder |  |  |
| localized-docs-getting-started-en | /docs/start |  |  |
| localized-docs-getting-started-de | /dokumente/einstieg |  |  |

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
| /dokumente/einstieg | localized-docs-getting-started-de | en | docs-getting-started | docs-getting-started | English | null | null | null |
| /equipe | localized-about-team-fr | en | about-team | about-team | English | null | null | null |
| /foo-bar/baz | foo-bar-baz | en | foo-bar-baz | foo-bar-baz | English | null | null | null |
| /mannschaft | localized-team-de | en | team | team | English | null | null | null |
| /mannschaft/mitglieder | localized-team-members-de | en | team-members | team-members | English | null | null | null |
| /team | team | en | team | team | English | null | null | null |
| /team-seite | localized-about-team-de | en | about-team | about-team | English | null | null | null |
| /team/members | team-members | en | team-members | team-members | English | null | null | null |
| /ueber-uns | localized-about-de | en | about | about | English | null | null | null |
| /en | null | en |  | null | English | en | null | null |
| /en/ | null | en |  | null | English | en | null | null |
| /de | null | en |  | null | English | de | null | null |
| /de/ | null | en |  | null | English | de | null | null |
| /about/ | about | en | about | about | English | null | null | null |
| /de/about/ | null | en |  | null | English | de | null | null |
| /missing | null | en |  | null | English | null | null | null |
| /de/missing | null | en |  | null | English | de | null | null |
| /xx/about | null | en |  | null | English | null | null | null |
| /de/de/about | null | en |  | null | English | de | null | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about | null |
| /about-team | /about-team?q=1#top [about-team] |  | /about-team?q=1#top [about-team] | /about-team?q=1#top [about-team] | /about-team | null |
| /docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | /docs | null |
| /docs/getting-started | /docs/start?q=1#top [localized-docs-getting-started-en] |  | /docs/start?q=1#top [localized-docs-getting-started-en] | /docs/start?q=1#top [localized-docs-getting-started-en] | /docs/getting-started | null |
| /docs/start | /docs/start?q=1#top [localized-docs-getting-started-en] |  | /docs/start?q=1#top [localized-docs-getting-started-en] | /docs/start?q=1#top [localized-docs-getting-started-en] | /docs/start | null |
| /dokumente/einstieg | /docs/start?q=1#top [localized-docs-getting-started-en] |  | /docs/start?q=1#top [localized-docs-getting-started-en] | /docs/start?q=1#top [localized-docs-getting-started-en] | /dokumente/einstieg | null |
| /equipe | /about-team?q=1#top [about-team] |  | /about-team?q=1#top [about-team] | /about-team?q=1#top [about-team] | /equipe | null |
| /foo-bar/baz | /foo-bar/baz?q=1#top [foo-bar-baz] |  | /foo-bar/baz?q=1#top [foo-bar-baz] | /foo-bar/baz?q=1#top [foo-bar-baz] | /foo-bar/baz | null |
| /mannschaft | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | /mannschaft | null |
| /mannschaft/mitglieder | /team/members?q=1#top [team-members] |  | /team/members?q=1#top [team-members] | /team/members?q=1#top [team-members] | /mannschaft/mitglieder | null |
| /team | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | /team | null |
| /team-seite | /about-team?q=1#top [about-team] |  | /about-team?q=1#top [about-team] | /about-team?q=1#top [about-team] | /team-seite | null |
| /team/members | /team/members?q=1#top [team-members] |  | /team/members?q=1#top [team-members] | /team/members?q=1#top [team-members] | /team/members | null |
| /ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /ueber-uns | null |
| /en | /en?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /en/?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de | /de?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/ | /de/?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about/ | null |
| /de/about/ | /de/about/?q=1#top [—] |  | /about/?q=1#top [about] | /about/?q=1#top [about] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /about | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | /about | null |
| /about-team | /team-seite?q=1#top [localized-about-team-de] |  | /team-seite?q=1#top [localized-about-team-de] | /team-seite?q=1#top [localized-about-team-de] | /about-team | null |
| /docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | /docs | null |
| /docs/getting-started | /dokumente/einstieg?q=1#top [localized-docs-getting-started-de] |  | /dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /docs/getting-started | null |
| /docs/start | /dokumente/einstieg?q=1#top [localized-docs-getting-started-de] |  | /dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /docs/start | null |
| /dokumente/einstieg | /dokumente/einstieg?q=1#top [localized-docs-getting-started-de] |  | /dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /dokumente/einstieg | null |
| /equipe | /team-seite?q=1#top [localized-about-team-de] |  | /team-seite?q=1#top [localized-about-team-de] | /team-seite?q=1#top [localized-about-team-de] | /equipe | null |
| /foo-bar/baz | /foo-bar/baz?q=1#top [foo-bar-baz] |  | /foo-bar/baz?q=1#top [foo-bar-baz] | /foo-bar/baz?q=1#top [foo-bar-baz] | /foo-bar/baz | null |
| /mannschaft | /mannschaft?q=1#top [localized-team-de] |  | /mannschaft?q=1#top [localized-team-de] | /mannschaft?q=1#top [localized-team-de] | /mannschaft | null |
| /mannschaft/mitglieder | /mannschaft/mitglieder?q=1#top [localized-team-members-de] |  | /mannschaft/mitglieder?q=1#top [localized-team-members-de] | /mannschaft/mitglieder?q=1#top [localized-team-members-de] | /mannschaft/mitglieder | null |
| /team | /mannschaft?q=1#top [localized-team-de] |  | /mannschaft?q=1#top [localized-team-de] | /mannschaft?q=1#top [localized-team-de] | /team | null |
| /team-seite | /team-seite?q=1#top [localized-about-team-de] |  | /team-seite?q=1#top [localized-about-team-de] | /team-seite?q=1#top [localized-about-team-de] | /team-seite | null |
| /team/members | /mannschaft/mitglieder?q=1#top [localized-team-members-de] |  | /mannschaft/mitglieder?q=1#top [localized-team-members-de] | /mannschaft/mitglieder?q=1#top [localized-team-members-de] | /team/members | null |
| /ueber-uns | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns | null |
| /en | /en?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /en/?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de | /de?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/ | /de/?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /ueber-uns?q=1#top [localized-about-de] |  | /ueber-uns?q=1#top [localized-about-de] | /ueber-uns?q=1#top [localized-about-de] | /about/ | null |
| /de/about/ | /de/about/?q=1#top [—] |  | /about/?q=1#top [about] | /about/?q=1#top [about] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about | null |
| /about-team | /equipe?q=1#top [localized-about-team-fr] |  | /equipe?q=1#top [localized-about-team-fr] | /equipe?q=1#top [localized-about-team-fr] | /about-team | null |
| /docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | /docs | null |
| /docs/getting-started | /docs/getting-started?q=1#top [docs-getting-started] |  | /docs/getting-started?q=1#top [docs-getting-started] | /docs/getting-started?q=1#top [docs-getting-started] | /docs/getting-started | null |
| /docs/start | /docs/getting-started?q=1#top [docs-getting-started] |  | /docs/getting-started?q=1#top [docs-getting-started] | /docs/getting-started?q=1#top [docs-getting-started] | /docs/start | null |
| /dokumente/einstieg | /docs/getting-started?q=1#top [docs-getting-started] |  | /docs/getting-started?q=1#top [docs-getting-started] | /docs/getting-started?q=1#top [docs-getting-started] | /dokumente/einstieg | null |
| /equipe | /equipe?q=1#top [localized-about-team-fr] |  | /equipe?q=1#top [localized-about-team-fr] | /equipe?q=1#top [localized-about-team-fr] | /equipe | null |
| /foo-bar/baz | /foo-bar/baz?q=1#top [foo-bar-baz] |  | /foo-bar/baz?q=1#top [foo-bar-baz] | /foo-bar/baz?q=1#top [foo-bar-baz] | /foo-bar/baz | null |
| /mannschaft | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | /mannschaft | null |
| /mannschaft/mitglieder | /team/members?q=1#top [team-members] |  | /team/members?q=1#top [team-members] | /team/members?q=1#top [team-members] | /mannschaft/mitglieder | null |
| /team | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | /team | null |
| /team-seite | /equipe?q=1#top [localized-about-team-fr] |  | /equipe?q=1#top [localized-about-team-fr] | /equipe?q=1#top [localized-about-team-fr] | /team-seite | null |
| /team/members | /team/members?q=1#top [team-members] |  | /team/members?q=1#top [team-members] | /team/members?q=1#top [team-members] | /team/members | null |
| /ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /ueber-uns | null |
| /en | /en?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /en/?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de | /de?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/ | /de/?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about/ | null |
| /de/about/ | /de/about/?q=1#top [—] |  | /about/?q=1#top [about] | /about/?q=1#top [about] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

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
