# dashed · prefix_except_default

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
| docs-getting-started | /docs/start | /docs/getting-started |  |
| foo-bar-baz | /foo-bar/baz |  |  |
| localized-index | /:locale(de\|fr) |  |  |
| localized-about | /:locale(fr)/about |  |  |
| localized-about-de | /:locale(de)/ueber-uns |  |  |
| localized-about-team-de | /:locale(de)/team-seite |  |  |
| localized-about-team-fr | /:locale(fr)/equipe |  |  |
| localized-team | /:locale(fr)/team |  |  |
| · localized-team-members | members |  |  |
| localized-team-de | /:locale(de)/mannschaft |  |  |
| · localized-team-members-de | mitglieder |  |  |
| localized-docs | /:locale(de\|fr)/docs |  |  |
| localized-docs-getting-started | /:locale(fr)/docs/getting-started |  |  |
| localized-docs-getting-started-de | /:locale(de)/dokumente/einstieg |  |  |
| localized-foo-bar-baz | /:locale(de\|fr)/foo-bar/baz |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| / | index | en | index | index | English | null | en | null |
| /about | about | en | about | about | English | null | en | null |
| /about-team | about-team | en | about-team | about-team | English | null | en | null |
| /de | localized-index | de | index | index | Deutsch | de | de | null |
| /de/docs | localized-docs | de | docs | docs | Deutsch | de | de | null |
| /de/dokumente/einstieg | localized-docs-getting-started-de | de | docs-getting-started | docs-getting-started | Deutsch | de | de | null |
| /de/foo-bar/baz | localized-foo-bar-baz | de | foo-bar-baz | foo-bar-baz | Deutsch | de | de | null |
| /de/mannschaft | localized-team-de | de | team | team | Deutsch | de | de | null |
| /de/mannschaft/mitglieder | localized-team-members-de | de | team-members | team-members | Deutsch | de | de | null |
| /de/team-seite | localized-about-team-de | de | about-team | about-team | Deutsch | de | de | null |
| /de/ueber-uns | localized-about-de | de | about | about | Deutsch | de | de | null |
| /docs | docs | en | docs | docs | English | null | en | null |
| /docs/getting-started | docs-getting-started | en | docs-getting-started | docs-getting-started | English | null | en | null |
| /docs/start | docs-getting-started | en | docs-getting-started | docs-getting-started | English | null | en | null |
| /foo-bar/baz | foo-bar-baz | en | foo-bar-baz | foo-bar-baz | English | null | en | null |
| /fr | localized-index | fr | index | index | Français | fr | fr | null |
| /fr/about | localized-about | fr | about | about | Français | fr | fr | null |
| /fr/docs | localized-docs | fr | docs | docs | Français | fr | fr | null |
| /fr/docs/getting-started | localized-docs-getting-started | fr | docs-getting-started | docs-getting-started | Français | fr | fr | null |
| /fr/equipe | localized-about-team-fr | fr | about-team | about-team | Français | fr | fr | null |
| /fr/foo-bar/baz | localized-foo-bar-baz | fr | foo-bar-baz | foo-bar-baz | Français | fr | fr | null |
| /fr/team | localized-team | fr | team | team | Français | fr | fr | null |
| /fr/team/members | localized-team-members | fr | team-members | team-members | Français | fr | fr | null |
| /team | team | en | team | team | English | null | en | null |
| /team/members | team-members | en | team-members | team-members | English | null | en | null |
| /en | null | en |  | null | English | en | en | Default locale should not have prefix |
| /en/ | null | en |  | null | English | en | en | Default locale should not have prefix |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | about | en | about | about | English | null | en | null |
| /de/about/ | null | de |  | null | Deutsch | de | de | null |
| /missing | null | en |  | null | English | null | en | null |
| /de/missing | null | de |  | null | Deutsch | de | de | null |
| /xx/about | null | en |  | null | English | null | en | null |
| /de/de/about | null | de |  | null | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | / | null |
| /about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about | null |
| /about-team | /about-team?q=1#top [about-team] |  | /about-team?q=1#top [about-team] | /about-team?q=1#top [about-team] | /about-team | null |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de | null |
| /de/docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | /de/docs | null |
| /de/dokumente/einstieg | /docs/start?q=1#top [docs-getting-started] |  | /docs/start?q=1#top [docs-getting-started] | /docs/start?q=1#top [docs-getting-started] | /de/dokumente/einstieg | null |
| /de/foo-bar/baz | /foo-bar/baz?q=1#top [foo-bar-baz] |  | /foo-bar/baz?q=1#top [foo-bar-baz] | /foo-bar/baz?q=1#top [foo-bar-baz] | /de/foo-bar/baz | null |
| /de/mannschaft | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | /de/mannschaft | null |
| /de/mannschaft/mitglieder | /team/members?q=1#top [team-members] |  | /team/members?q=1#top [team-members] | /team/members?q=1#top [team-members] | /de/mannschaft/mitglieder | null |
| /de/team-seite | /about-team?q=1#top [about-team] |  | /about-team?q=1#top [about-team] | /about-team?q=1#top [about-team] | /de/team-seite | null |
| /de/ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /de/ueber-uns | null |
| /docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | /docs | null |
| /docs/getting-started | /docs/start?q=1#top [docs-getting-started] |  | /docs/start?q=1#top [docs-getting-started] | /docs/start?q=1#top [docs-getting-started] | /docs/getting-started | /docs/start |
| /docs/start | /docs/start?q=1#top [docs-getting-started] |  | /docs/start?q=1#top [docs-getting-started] | /docs/start?q=1#top [docs-getting-started] | /docs/start | null |
| /foo-bar/baz | /foo-bar/baz?q=1#top [foo-bar-baz] |  | /foo-bar/baz?q=1#top [foo-bar-baz] | /foo-bar/baz?q=1#top [foo-bar-baz] | /foo-bar/baz | null |
| /fr | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /fr | null |
| /fr/about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /fr/about | null |
| /fr/docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | /fr/docs | null |
| /fr/docs/getting-started | /docs/start?q=1#top [docs-getting-started] |  | /docs/start?q=1#top [docs-getting-started] | /docs/start?q=1#top [docs-getting-started] | /fr/docs/getting-started | null |
| /fr/equipe | /about-team?q=1#top [about-team] |  | /about-team?q=1#top [about-team] | /about-team?q=1#top [about-team] | /fr/equipe | null |
| /fr/foo-bar/baz | /foo-bar/baz?q=1#top [foo-bar-baz] |  | /foo-bar/baz?q=1#top [foo-bar-baz] | /foo-bar/baz?q=1#top [foo-bar-baz] | /fr/foo-bar/baz | null |
| /fr/team | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | /fr/team | null |
| /fr/team/members | /team/members?q=1#top [team-members] |  | /team/members?q=1#top [team-members] | /team/members?q=1#top [team-members] | /fr/team/members | null |
| /team | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | /team | null |
| /team/members | /team/members?q=1#top [team-members] |  | /team/members?q=1#top [team-members] | /team/members?q=1#top [team-members] | /team/members | null |
| /en | /en?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en | null |
| /en/ | /en/?q=1#top [—] |  | /?q=1#top [index] | /?q=1#top [index] | /en/ | null |
| /de/ | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | /de/ | null |
| /about/ | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | /about/ | null |
| /de/about/ | /de/about/?q=1#top [—] |  | /about/?q=1#top [about] | /about/?q=1#top [about] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /missing?q=1#top [null] | /missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /xx/about?q=1#top [null] | /xx/about?q=1#top [null] | /xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/about?q=1#top [null] | /de/about?q=1#top [null] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | / | /de |
| /about | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /about | /de/ueber-uns |
| /about-team | /de/team-seite?q=1#top [localized-about-team-de] |  | /de/team-seite?q=1#top [localized-about-team-de] | /de/team-seite?q=1#top [localized-about-team-de] | /about-team | /de/team-seite |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | null |
| /de/docs | /de/docs?q=1#top [localized-docs] |  | /de/docs?q=1#top [localized-docs] | /de/docs?q=1#top [localized-docs] | /de/docs | null |
| /de/dokumente/einstieg | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] |  | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /de/dokumente/einstieg | null |
| /de/foo-bar/baz | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /de/foo-bar/baz | null |
| /de/mannschaft | /de/mannschaft?q=1#top [localized-team-de] |  | /de/mannschaft?q=1#top [localized-team-de] | /de/mannschaft?q=1#top [localized-team-de] | /de/mannschaft | null |
| /de/mannschaft/mitglieder | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] |  | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] | /de/mannschaft/mitglieder | null |
| /de/team-seite | /de/team-seite?q=1#top [localized-about-team-de] |  | /de/team-seite?q=1#top [localized-about-team-de] | /de/team-seite?q=1#top [localized-about-team-de] | /de/team-seite | null |
| /de/ueber-uns | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns | null |
| /docs | /de/docs?q=1#top [localized-docs] |  | /de/docs?q=1#top [localized-docs] | /de/docs?q=1#top [localized-docs] | /docs | /de/docs |
| /docs/getting-started | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] |  | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /docs/getting-started | /de/dokumente/einstieg |
| /docs/start | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] |  | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /docs/start | /de/dokumente/einstieg |
| /foo-bar/baz | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /foo-bar/baz | /de/foo-bar/baz |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /fr | null |
| /fr/about | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /fr/about | null |
| /fr/docs | /de/docs?q=1#top [localized-docs] |  | /de/docs?q=1#top [localized-docs] | /de/docs?q=1#top [localized-docs] | /fr/docs | null |
| /fr/docs/getting-started | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] |  | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /fr/docs/getting-started | null |
| /fr/equipe | /de/team-seite?q=1#top [localized-about-team-de] |  | /de/team-seite?q=1#top [localized-about-team-de] | /de/team-seite?q=1#top [localized-about-team-de] | /fr/equipe | null |
| /fr/foo-bar/baz | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /fr/foo-bar/baz | null |
| /fr/team | /de/mannschaft?q=1#top [localized-team-de] |  | /de/mannschaft?q=1#top [localized-team-de] | /de/mannschaft?q=1#top [localized-team-de] | /fr/team | null |
| /fr/team/members | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] |  | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] | /fr/team/members | null |
| /team | /de/mannschaft?q=1#top [localized-team-de] |  | /de/mannschaft?q=1#top [localized-team-de] | /de/mannschaft?q=1#top [localized-team-de] | /team | /de/mannschaft |
| /team/members | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] |  | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] | /team/members | /de/mannschaft/mitglieder |
| /en | /en?q=1#top [—] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en | null |
| /en/ | /en/?q=1#top [—] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en/ | null |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de/ | null |
| /about/ | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /about/ | /de/ueber-uns |
| /de/about/ | /de/about/?q=1#top [—] |  | /de/about/?q=1#top [null] | /de/about/?q=1#top [null] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /missing | /de/missing |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /xx/about | /de/xx/about |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/de/about?q=1#top [null] | /de/de/about?q=1#top [null] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | / | /fr |
| /about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /about | /fr/about |
| /about-team | /fr/equipe?q=1#top [localized-about-team-fr] |  | /fr/equipe?q=1#top [localized-about-team-fr] | /fr/equipe?q=1#top [localized-about-team-fr] | /about-team | /fr/equipe |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de | null |
| /de/docs | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | /de/docs | null |
| /de/dokumente/einstieg | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] |  | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /de/dokumente/einstieg | null |
| /de/foo-bar/baz | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /de/foo-bar/baz | null |
| /de/mannschaft | /fr/team?q=1#top [localized-team] |  | /fr/team?q=1#top [localized-team] | /fr/team?q=1#top [localized-team] | /de/mannschaft | null |
| /de/mannschaft/mitglieder | /fr/team/members?q=1#top [localized-team-members] |  | /fr/team/members?q=1#top [localized-team-members] | /fr/team/members?q=1#top [localized-team-members] | /de/mannschaft/mitglieder | null |
| /de/team-seite | /fr/equipe?q=1#top [localized-about-team-fr] |  | /fr/equipe?q=1#top [localized-about-team-fr] | /fr/equipe?q=1#top [localized-about-team-fr] | /de/team-seite | null |
| /de/ueber-uns | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /de/ueber-uns | null |
| /docs | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | /docs | /fr/docs |
| /docs/getting-started | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] |  | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /docs/getting-started | /fr/docs/getting-started |
| /docs/start | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] |  | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /docs/start | /fr/docs/getting-started |
| /foo-bar/baz | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /foo-bar/baz | /fr/foo-bar/baz |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | null |
| /fr/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/about | null |
| /fr/docs | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | /fr/docs | null |
| /fr/docs/getting-started | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] |  | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /fr/docs/getting-started | null |
| /fr/equipe | /fr/equipe?q=1#top [localized-about-team-fr] |  | /fr/equipe?q=1#top [localized-about-team-fr] | /fr/equipe?q=1#top [localized-about-team-fr] | /fr/equipe | null |
| /fr/foo-bar/baz | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /fr/foo-bar/baz | null |
| /fr/team | /fr/team?q=1#top [localized-team] |  | /fr/team?q=1#top [localized-team] | /fr/team?q=1#top [localized-team] | /fr/team | null |
| /fr/team/members | /fr/team/members?q=1#top [localized-team-members] |  | /fr/team/members?q=1#top [localized-team-members] | /fr/team/members?q=1#top [localized-team-members] | /fr/team/members | null |
| /team | /fr/team?q=1#top [localized-team] |  | /fr/team?q=1#top [localized-team] | /fr/team?q=1#top [localized-team] | /team | /fr/team |
| /team/members | /fr/team/members?q=1#top [localized-team-members] |  | /fr/team/members?q=1#top [localized-team-members] | /fr/team/members?q=1#top [localized-team-members] | /team/members | /fr/team/members |
| /en | /en?q=1#top [—] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en | null |
| /en/ | /en/?q=1#top [—] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en/ | null |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de/ | null |
| /about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /about/ | /fr/about |
| /de/about/ | /de/about/?q=1#top [—] |  | /fr/about/?q=1#top [localized-about] | /fr/about/?q=1#top [localized-about] | /de/about/ | null |
| /missing | /missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /missing | /fr/missing |
| /de/missing | /de/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | /xx/about | /fr/xx/about |
| /de/de/about | /de/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from / | de from / | fr from / | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /about [about] | /de/ueber-uns [localized-about-de] | /fr/about [localized-about] | /about [about] | /de/ueber-uns [localized-about-de] | /fr/about [localized-about] | /about [about] | /de/ueber-uns [localized-about-de] | /fr/about [localized-about] |
| about-team | /about-team [about-team] | /de/team-seite [localized-about-team-de] | /fr/equipe [localized-about-team-fr] | /about-team [about-team] | /de/team-seite [localized-about-team-de] | /fr/equipe [localized-about-team-fr] | /about-team [about-team] | /de/team-seite [localized-about-team-de] | /fr/equipe [localized-about-team-fr] |
| docs | /docs [docs] | /de/docs [localized-docs] | /fr/docs [localized-docs] | /docs [docs] | /de/docs [localized-docs] | /fr/docs [localized-docs] | /docs [docs] | /de/docs [localized-docs] | /fr/docs [localized-docs] |
| docs-getting-started | /docs/start [docs-getting-started] | /de/dokumente/einstieg [localized-docs-getting-started-de] | /fr/docs/getting-started [localized-docs-getting-started] | /docs/start [docs-getting-started] | /de/dokumente/einstieg [localized-docs-getting-started-de] | /fr/docs/getting-started [localized-docs-getting-started] | /docs/start [docs-getting-started] | /de/dokumente/einstieg [localized-docs-getting-started-de] | /fr/docs/getting-started [localized-docs-getting-started] |
| foo-bar-baz | /foo-bar/baz [foo-bar-baz] | /de/foo-bar/baz [localized-foo-bar-baz] | /fr/foo-bar/baz [localized-foo-bar-baz] | /foo-bar/baz [foo-bar-baz] | /de/foo-bar/baz [localized-foo-bar-baz] | /fr/foo-bar/baz [localized-foo-bar-baz] | /foo-bar/baz [foo-bar-baz] | /de/foo-bar/baz [localized-foo-bar-baz] | /fr/foo-bar/baz [localized-foo-bar-baz] |
| index | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] | / [index] | /de [localized-index] | /fr [localized-index] |
| team | /team [team] | /de/mannschaft [localized-team-de] | /fr/team [localized-team] | /team [team] | /de/mannschaft [localized-team-de] | /fr/team [localized-team] | /team [team] | /de/mannschaft [localized-team-de] | /fr/team [localized-team] |
| team-members | /team/members [team-members] | /de/mannschaft/mitglieder [localized-team-members-de] | /fr/team/members [localized-team-members] | /team/members [team-members] | /de/mannschaft/mitglieder [localized-team-members-de] | /fr/team/members [localized-team-members] | /team/members [team-members] | /de/mannschaft/mitglieder [localized-team-members-de] | /fr/team/members [localized-team-members] |

## Invariant breaks (0)

none
