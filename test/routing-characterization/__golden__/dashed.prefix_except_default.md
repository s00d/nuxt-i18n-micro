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
| /about-team | /about-team?q=1#top [about-team] |  | /about-team?q=1#top [about-team] | /about-team?q=1#top [about-team] | null | null | en,de,fr |
| /de | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /de/docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | null | /docs | en,de,fr |
| /de/dokumente/einstieg | /docs/start?q=1#top [docs-getting-started] |  | /docs/start?q=1#top [docs-getting-started] | /docs/start?q=1#top [docs-getting-started] | null | /docs/start | en,fr,de |
| /de/foo-bar/baz | /foo-bar/baz?q=1#top [foo-bar-baz] |  | /foo-bar/baz?q=1#top [foo-bar-baz] | /foo-bar/baz?q=1#top [foo-bar-baz] | null | /foo-bar/baz | en,de,fr |
| /de/mannschaft | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | null | /team | en,fr,de |
| /de/mannschaft/mitglieder | /team/members?q=1#top [team-members] |  | /team/members?q=1#top [team-members] | /team/members?q=1#top [team-members] | null | /team/members | en,fr,de |
| /de/team-seite | /about-team?q=1#top [about-team] |  | /about-team?q=1#top [about-team] | /about-team?q=1#top [about-team] | null | /about-team | en,de,fr |
| /de/ueber-uns | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,fr,de |
| /docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | null | null | en,de,fr |
| /docs/getting-started | /docs/start?q=1#top [docs-getting-started] |  | /docs/start?q=1#top [docs-getting-started] | /docs/start?q=1#top [docs-getting-started] | /docs/start | /docs/start | en,fr,de |
| /docs/start | /docs/start?q=1#top [docs-getting-started] |  | /docs/start?q=1#top [docs-getting-started] | /docs/start?q=1#top [docs-getting-started] | null | null | en,fr,de |
| /foo-bar/baz | /foo-bar/baz?q=1#top [foo-bar-baz] |  | /foo-bar/baz?q=1#top [foo-bar-baz] | /foo-bar/baz?q=1#top [foo-bar-baz] | null | null | en,de,fr |
| /fr | /?q=1#top [index] |  | /?q=1#top [index] | /?q=1#top [index] | null | / | en,de,fr |
| /fr/about | /about?q=1#top [about] |  | /about?q=1#top [about] | /about?q=1#top [about] | null | /about | en,fr,de |
| /fr/docs | /docs?q=1#top [docs] |  | /docs?q=1#top [docs] | /docs?q=1#top [docs] | null | /docs | en,de,fr |
| /fr/docs/getting-started | /docs/start?q=1#top [docs-getting-started] |  | /docs/start?q=1#top [docs-getting-started] | /docs/start?q=1#top [docs-getting-started] | null | /docs/start | en,fr,de |
| /fr/equipe | /about-team?q=1#top [about-team] |  | /about-team?q=1#top [about-team] | /about-team?q=1#top [about-team] | null | /about-team | en,de,fr |
| /fr/foo-bar/baz | /foo-bar/baz?q=1#top [foo-bar-baz] |  | /foo-bar/baz?q=1#top [foo-bar-baz] | /foo-bar/baz?q=1#top [foo-bar-baz] | null | /foo-bar/baz | en,de,fr |
| /fr/team | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | null | /team | en,fr,de |
| /fr/team/members | /team/members?q=1#top [team-members] |  | /team/members?q=1#top [team-members] | /team/members?q=1#top [team-members] | null | /team/members | en,fr,de |
| /team | /team?q=1#top [team] |  | /team?q=1#top [team] | /team?q=1#top [team] | null | null | en,fr,de |
| /team/members | /team/members?q=1#top [team-members] |  | /team/members?q=1#top [team-members] | /team/members?q=1#top [team-members] | null | null | en,fr,de |
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
| /about | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns | /de/ueber-uns | en,fr,de |
| /about-team | /de/team-seite?q=1#top [localized-about-team-de] |  | /de/team-seite?q=1#top [localized-about-team-de] | /de/team-seite?q=1#top [localized-about-team-de] | /de/team-seite | /de/team-seite | en,de,fr |
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /de/docs | /de/docs?q=1#top [localized-docs] |  | /de/docs?q=1#top [localized-docs] | /de/docs?q=1#top [localized-docs] | null | null | en,de,fr |
| /de/dokumente/einstieg | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] |  | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | null | null | en,fr,de |
| /de/foo-bar/baz | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] | null | null | en,de,fr |
| /de/mannschaft | /de/mannschaft?q=1#top [localized-team-de] |  | /de/mannschaft?q=1#top [localized-team-de] | /de/mannschaft?q=1#top [localized-team-de] | null | null | en,fr,de |
| /de/mannschaft/mitglieder | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] |  | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] | null | null | en,fr,de |
| /de/team-seite | /de/team-seite?q=1#top [localized-about-team-de] |  | /de/team-seite?q=1#top [localized-about-team-de] | /de/team-seite?q=1#top [localized-about-team-de] | null | null | en,de,fr |
| /de/ueber-uns | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | null | en,fr,de |
| /docs | /de/docs?q=1#top [localized-docs] |  | /de/docs?q=1#top [localized-docs] | /de/docs?q=1#top [localized-docs] | /de/docs | /de/docs | en,de,fr |
| /docs/getting-started | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] |  | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /de/dokumente/einstieg | /de/dokumente/einstieg | en,fr,de |
| /docs/start | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] |  | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /de/dokumente/einstieg | /de/dokumente/einstieg | en,fr,de |
| /foo-bar/baz | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /de/foo-bar/baz | /de/foo-bar/baz | en,de,fr |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /fr/about | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | /de/ueber-uns | en,fr,de |
| /fr/docs | /de/docs?q=1#top [localized-docs] |  | /de/docs?q=1#top [localized-docs] | /de/docs?q=1#top [localized-docs] | null | /de/docs | en,de,fr |
| /fr/docs/getting-started | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] |  | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | null | /de/dokumente/einstieg | en,fr,de |
| /fr/equipe | /de/team-seite?q=1#top [localized-about-team-de] |  | /de/team-seite?q=1#top [localized-about-team-de] | /de/team-seite?q=1#top [localized-about-team-de] | null | /de/team-seite | en,de,fr |
| /fr/foo-bar/baz | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] | null | /de/foo-bar/baz | en,de,fr |
| /fr/team | /de/mannschaft?q=1#top [localized-team-de] |  | /de/mannschaft?q=1#top [localized-team-de] | /de/mannschaft?q=1#top [localized-team-de] | null | /de/mannschaft | en,fr,de |
| /fr/team/members | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] |  | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] | null | /de/mannschaft/mitglieder | en,fr,de |
| /team | /de/mannschaft?q=1#top [localized-team-de] |  | /de/mannschaft?q=1#top [localized-team-de] | /de/mannschaft?q=1#top [localized-team-de] | /de/mannschaft | /de/mannschaft | en,fr,de |
| /team/members | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] |  | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] | /de/mannschaft/mitglieder | /de/mannschaft/mitglieder | en,fr,de |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | /de | en,de,fr |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | null | null | en,de,fr |
| /about/ | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns | /de/ueber-uns | en,fr,de |
| /de/about/ | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | null | null | en,fr,de |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | /de/missing | null |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | null | null | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /de/xx/about | /de/xx/about | null |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/de/about?q=1#top [null] | /de/de/about?q=1#top [null] | null | null | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | getClientRedirect | getClientRedirect('*') | pageLocales |
|---|---|---|---|---|---|---|---|
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | /fr | en,de,fr |
| /about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/about | /fr/about | en,fr,de |
| /about-team | /fr/equipe?q=1#top [localized-about-team-fr] |  | /fr/equipe?q=1#top [localized-about-team-fr] | /fr/equipe?q=1#top [localized-about-team-fr] | /fr/equipe | /fr/equipe | en,de,fr |
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | /fr | en,de,fr |
| /de/docs | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | null | /fr/docs | en,de,fr |
| /de/dokumente/einstieg | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] |  | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | null | /fr/docs/getting-started | en,fr,de |
| /de/foo-bar/baz | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] | null | /fr/foo-bar/baz | en,de,fr |
| /de/mannschaft | /fr/team?q=1#top [localized-team] |  | /fr/team?q=1#top [localized-team] | /fr/team?q=1#top [localized-team] | null | /fr/team | en,fr,de |
| /de/mannschaft/mitglieder | /fr/team/members?q=1#top [localized-team-members] |  | /fr/team/members?q=1#top [localized-team-members] | /fr/team/members?q=1#top [localized-team-members] | null | /fr/team/members | en,fr,de |
| /de/team-seite | /fr/equipe?q=1#top [localized-about-team-fr] |  | /fr/equipe?q=1#top [localized-about-team-fr] | /fr/equipe?q=1#top [localized-about-team-fr] | null | /fr/equipe | en,de,fr |
| /de/ueber-uns | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | /fr/about | en,fr,de |
| /docs | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | /fr/docs | /fr/docs | en,de,fr |
| /docs/getting-started | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] |  | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /fr/docs/getting-started | /fr/docs/getting-started | en,fr,de |
| /docs/start | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] |  | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /fr/docs/getting-started | /fr/docs/getting-started | en,fr,de |
| /foo-bar/baz | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /fr/foo-bar/baz | /fr/foo-bar/baz | en,de,fr |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | null | null | en,de,fr |
| /fr/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | null | null | en,fr,de |
| /fr/docs | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | null | null | en,de,fr |
| /fr/docs/getting-started | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] |  | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | null | null | en,fr,de |
| /fr/equipe | /fr/equipe?q=1#top [localized-about-team-fr] |  | /fr/equipe?q=1#top [localized-about-team-fr] | /fr/equipe?q=1#top [localized-about-team-fr] | null | null | en,de,fr |
| /fr/foo-bar/baz | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] | null | null | en,de,fr |
| /fr/team | /fr/team?q=1#top [localized-team] |  | /fr/team?q=1#top [localized-team] | /fr/team?q=1#top [localized-team] | null | null | en,fr,de |
| /fr/team/members | /fr/team/members?q=1#top [localized-team-members] |  | /fr/team/members?q=1#top [localized-team-members] | /fr/team/members?q=1#top [localized-team-members] | null | null | en,fr,de |
| /team | /fr/team?q=1#top [localized-team] |  | /fr/team?q=1#top [localized-team] | /fr/team?q=1#top [localized-team] | /fr/team | /fr/team | en,fr,de |
| /team/members | /fr/team/members?q=1#top [localized-team-members] |  | /fr/team/members?q=1#top [localized-team-members] | /fr/team/members?q=1#top [localized-team-members] | /fr/team/members | /fr/team/members | en,fr,de |
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
