# dashed · prefix

pages that share a Nuxt route name (about-team) and dashed folders, keyed by name and by file path

locales: en, de, fr · default: en

## Generated routes

| name | path | alias | redirect |
|---|---|---|---|
| redirect-docs-getting-started | /docs/getting-started |  | /en/docs/start |
| localized-index | /:locale(en\|de\|fr) |  |  |
| localized-about | /:locale(en\|fr)/about |  |  |
| localized-about-de | /:locale(de)/ueber-uns |  |  |
| localized-about-team | /:locale(en)/about-team |  |  |
| localized-about-team-de | /:locale(de)/team-seite |  |  |
| localized-about-team-fr | /:locale(fr)/equipe |  |  |
| localized-team | /:locale(en\|fr)/team |  |  |
| · localized-team-members | members |  |  |
| localized-team-de | /:locale(de)/mannschaft |  |  |
| · localized-team-members-de | mitglieder |  |  |
| localized-docs | /:locale(en\|de\|fr)/docs |  |  |
| localized-docs-getting-started | /:locale(fr)/docs/getting-started |  |  |
| localized-docs-getting-started-en | /:locale(en)/docs/start |  |  |
| localized-docs-getting-started-de | /:locale(de)/dokumente/einstieg |  |  |
| localized-foo-bar-baz | /:locale(en\|de\|fr)/foo-bar/baz |  |  |

## Reading a URL

Every URL is resolved with `?q=1#top`.

| url | router name | getCurrentLocale | getPluginRouteName | getRouteBaseName | getCurrentLocaleName | getLocaleFromPath | resolveLocaleFromPath | shouldReturn404 |
|---|---|---|---|---|---|---|---|---|
| /de | localized-index | de | index | index | Deutsch | de | de | null |
| /de/docs | localized-docs | de | docs | docs | Deutsch | de | de | null |
| /de/dokumente/einstieg | localized-docs-getting-started-de | de | docs-getting-started | docs-getting-started | Deutsch | de | de | null |
| /de/foo-bar/baz | localized-foo-bar-baz | de | foo-bar-baz | foo-bar-baz | Deutsch | de | de | null |
| /de/mannschaft | localized-team-de | de | team | team | Deutsch | de | de | null |
| /de/mannschaft/mitglieder | localized-team-members-de | de | team-members | team-members | Deutsch | de | de | null |
| /de/team-seite | localized-about-team-de | de | about-team | about-team | Deutsch | de | de | null |
| /de/ueber-uns | localized-about-de | de | about | about | Deutsch | de | de | null |
| /en | localized-index | en | index | index | English | en | en | null |
| /en/about | localized-about | en | about | about | English | en | en | null |
| /en/about-team | localized-about-team | en | about-team | about-team | English | en | en | null |
| /en/docs | localized-docs | en | docs | docs | English | en | en | null |
| /en/docs/start | localized-docs-getting-started-en | en | docs-getting-started | docs-getting-started | English | en | en | null |
| /en/foo-bar/baz | localized-foo-bar-baz | en | foo-bar-baz | foo-bar-baz | English | en | en | null |
| /en/team | localized-team | en | team | team | English | en | en | null |
| /en/team/members | localized-team-members | en | team-members | team-members | English | en | en | null |
| /fr | localized-index | fr | index | index | Français | fr | fr | null |
| /fr/about | localized-about | fr | about | about | Français | fr | fr | null |
| /fr/docs | localized-docs | fr | docs | docs | Français | fr | fr | null |
| /fr/docs/getting-started | localized-docs-getting-started | fr | docs-getting-started | docs-getting-started | Français | fr | fr | null |
| /fr/equipe | localized-about-team-fr | fr | about-team | about-team | Français | fr | fr | null |
| /fr/foo-bar/baz | localized-foo-bar-baz | fr | foo-bar-baz | foo-bar-baz | Français | fr | fr | null |
| /fr/team | localized-team | fr | team | team | Français | fr | fr | null |
| /fr/team/members | localized-team-members | fr | team-members | team-members | Français | fr | fr | null |
| / | null | en |  | index | English | null | null | null |
| /en/ | localized-index | en | index | index | English | en | en | null |
| /de/ | localized-index | de | index | index | Deutsch | de | de | null |
| /about/ | null | en |  | about | English | null | null | null |
| /de/about/ | null | de |  | null | Deutsch | de | de | null |
| /missing | null | en |  | null | English | null | null | null |
| /de/missing | null | de |  | null | Deutsch | de | de | null |
| /xx/about | null | en |  | null | English | null | null | null |
| /de/de/about | null | de |  | null | Deutsch | de | de | null |

## To en

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| /de | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /de | null |
| /de/docs | /en/docs?q=1#top [localized-docs] |  | /en/docs?q=1#top [localized-docs] | /en/docs?q=1#top [localized-docs] | /de/docs | null |
| /de/dokumente/einstieg | /en/docs/start?q=1#top [localized-docs-getting-started-en] |  | /en/docs/start?q=1#top [localized-docs-getting-started-en] | /en/docs/start?q=1#top [localized-docs-getting-started-en] | /de/dokumente/einstieg | null |
| /de/foo-bar/baz | /en/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /en/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /en/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /de/foo-bar/baz | null |
| /de/mannschaft | /en/team?q=1#top [localized-team] |  | /en/team?q=1#top [localized-team] | /en/team?q=1#top [localized-team] | /de/mannschaft | null |
| /de/mannschaft/mitglieder | /en/team/members?q=1#top [localized-team-members] |  | /en/team/members?q=1#top [localized-team-members] | /en/team/members?q=1#top [localized-team-members] | /de/mannschaft/mitglieder | null |
| /de/team-seite | /en/about-team?q=1#top [localized-about-team] |  | /en/about-team?q=1#top [localized-about-team] | /en/about-team?q=1#top [localized-about-team] | /de/team-seite | null |
| /de/ueber-uns | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /de/ueber-uns | null |
| /en | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en | null |
| /en/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /en/about | null |
| /en/about-team | /en/about-team?q=1#top [localized-about-team] |  | /en/about-team?q=1#top [localized-about-team] | /en/about-team?q=1#top [localized-about-team] | /en/about-team | null |
| /en/docs | /en/docs?q=1#top [localized-docs] |  | /en/docs?q=1#top [localized-docs] | /en/docs?q=1#top [localized-docs] | /en/docs | null |
| /en/docs/start | /en/docs/start?q=1#top [localized-docs-getting-started-en] |  | /en/docs/start?q=1#top [localized-docs-getting-started-en] | /en/docs/start?q=1#top [localized-docs-getting-started-en] | /en/docs/start | null |
| /en/foo-bar/baz | /en/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /en/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /en/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /en/foo-bar/baz | null |
| /en/team | /en/team?q=1#top [localized-team] |  | /en/team?q=1#top [localized-team] | /en/team?q=1#top [localized-team] | /en/team | null |
| /en/team/members | /en/team/members?q=1#top [localized-team-members] |  | /en/team/members?q=1#top [localized-team-members] | /en/team/members?q=1#top [localized-team-members] | /en/team/members | null |
| /fr | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /fr | null |
| /fr/about | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /fr/about | null |
| /fr/docs | /en/docs?q=1#top [localized-docs] |  | /en/docs?q=1#top [localized-docs] | /en/docs?q=1#top [localized-docs] | /fr/docs | null |
| /fr/docs/getting-started | /en/docs/start?q=1#top [localized-docs-getting-started-en] |  | /en/docs/start?q=1#top [localized-docs-getting-started-en] | /en/docs/start?q=1#top [localized-docs-getting-started-en] | /fr/docs/getting-started | null |
| /fr/equipe | /en/about-team?q=1#top [localized-about-team] |  | /en/about-team?q=1#top [localized-about-team] | /en/about-team?q=1#top [localized-about-team] | /fr/equipe | null |
| /fr/foo-bar/baz | /en/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /en/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /en/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /fr/foo-bar/baz | null |
| /fr/team | /en/team?q=1#top [localized-team] |  | /en/team?q=1#top [localized-team] | /en/team?q=1#top [localized-team] | /fr/team | null |
| /fr/team/members | /en/team/members?q=1#top [localized-team-members] |  | /en/team/members?q=1#top [localized-team-members] | /en/team/members?q=1#top [localized-team-members] | /fr/team/members | null |
| / | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en | /en |
| /en/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /en/ | null |
| /de/ | /en?q=1#top [localized-index] |  | /en?q=1#top [localized-index] | /en?q=1#top [localized-index] | /de/ | null |
| /about/ | /en/about?q=1#top [localized-about] |  | /en/about?q=1#top [localized-about] | /en/about?q=1#top [localized-about] | /en/about/ | /en/about |
| /de/about/ | /en/about?q=1#top [localized-about] |  | /en/about/?q=1#top [localized-about] | /en/about/?q=1#top [localized-about] | /de/about/ | null |
| /missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | /en/missing | /en/missing |
| /de/missing | /en/missing?q=1#top [—] |  | /en/missing?q=1#top [null] | /en/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /en/xx/about?q=1#top [—] |  | /en/xx/about?q=1#top [null] | /en/xx/about?q=1#top [null] | /en/xx/about | /en/xx/about |
| /de/de/about | /en/de/about?q=1#top [—] |  | /en/de/about?q=1#top [null] | /en/de/about?q=1#top [null] | /de/de/about | null |

## To de

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| /de | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de | null |
| /de/docs | /de/docs?q=1#top [localized-docs] |  | /de/docs?q=1#top [localized-docs] | /de/docs?q=1#top [localized-docs] | /de/docs | null |
| /de/dokumente/einstieg | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] |  | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /de/dokumente/einstieg | null |
| /de/foo-bar/baz | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /de/foo-bar/baz | null |
| /de/mannschaft | /de/mannschaft?q=1#top [localized-team-de] |  | /de/mannschaft?q=1#top [localized-team-de] | /de/mannschaft?q=1#top [localized-team-de] | /de/mannschaft | null |
| /de/mannschaft/mitglieder | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] |  | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] | /de/mannschaft/mitglieder | null |
| /de/team-seite | /de/team-seite?q=1#top [localized-about-team-de] |  | /de/team-seite?q=1#top [localized-about-team-de] | /de/team-seite?q=1#top [localized-about-team-de] | /de/team-seite | null |
| /de/ueber-uns | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns | null |
| /en | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en | null |
| /en/about | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /en/about | null |
| /en/about-team | /de/team-seite?q=1#top [localized-about-team-de] |  | /de/team-seite?q=1#top [localized-about-team-de] | /de/team-seite?q=1#top [localized-about-team-de] | /en/about-team | null |
| /en/docs | /de/docs?q=1#top [localized-docs] |  | /de/docs?q=1#top [localized-docs] | /de/docs?q=1#top [localized-docs] | /en/docs | null |
| /en/docs/start | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] |  | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /en/docs/start | null |
| /en/foo-bar/baz | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /en/foo-bar/baz | null |
| /en/team | /de/mannschaft?q=1#top [localized-team-de] |  | /de/mannschaft?q=1#top [localized-team-de] | /de/mannschaft?q=1#top [localized-team-de] | /en/team | null |
| /en/team/members | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] |  | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] | /en/team/members | null |
| /fr | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /fr | null |
| /fr/about | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /fr/about | null |
| /fr/docs | /de/docs?q=1#top [localized-docs] |  | /de/docs?q=1#top [localized-docs] | /de/docs?q=1#top [localized-docs] | /fr/docs | null |
| /fr/docs/getting-started | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] |  | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /de/dokumente/einstieg?q=1#top [localized-docs-getting-started-de] | /fr/docs/getting-started | null |
| /fr/equipe | /de/team-seite?q=1#top [localized-about-team-de] |  | /de/team-seite?q=1#top [localized-about-team-de] | /de/team-seite?q=1#top [localized-about-team-de] | /fr/equipe | null |
| /fr/foo-bar/baz | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /de/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /fr/foo-bar/baz | null |
| /fr/team | /de/mannschaft?q=1#top [localized-team-de] |  | /de/mannschaft?q=1#top [localized-team-de] | /de/mannschaft?q=1#top [localized-team-de] | /fr/team | null |
| /fr/team/members | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] |  | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] | /de/mannschaft/mitglieder?q=1#top [localized-team-members-de] | /fr/team/members | null |
| / | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en | /de |
| /en/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /en/ | null |
| /de/ | /de?q=1#top [localized-index] |  | /de?q=1#top [localized-index] | /de?q=1#top [localized-index] | /de/ | null |
| /about/ | /de/ueber-uns?q=1#top [localized-about-de] |  | /de/ueber-uns?q=1#top [localized-about-de] | /de/ueber-uns?q=1#top [localized-about-de] | /en/about/ | /de/ueber-uns |
| /de/about/ | /de/about/?q=1#top [—] |  | /de/about/?q=1#top [null] | /de/about/?q=1#top [null] | /de/about/ | null |
| /missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /en/missing | /de/missing |
| /de/missing | /de/missing?q=1#top [—] |  | /de/missing?q=1#top [null] | /de/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /de/xx/about?q=1#top [—] |  | /de/xx/about?q=1#top [null] | /de/xx/about?q=1#top [null] | /en/xx/about | /de/xx/about |
| /de/de/about | /de/de/about?q=1#top [—] |  | /de/de/about?q=1#top [null] | /de/de/about?q=1#top [null] | /de/de/about | null |

## To fr

| url | switchLocaleRoute | switch + i18nRouteParams | localeRoute(route) | localeRoute(url) | formatPathForResolve | getClientRedirect |
|---|---|---|---|---|---|---|
| /de | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de | null |
| /de/docs | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | /de/docs | null |
| /de/dokumente/einstieg | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] |  | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /de/dokumente/einstieg | null |
| /de/foo-bar/baz | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /de/foo-bar/baz | null |
| /de/mannschaft | /fr/team?q=1#top [localized-team] |  | /fr/team?q=1#top [localized-team] | /fr/team?q=1#top [localized-team] | /de/mannschaft | null |
| /de/mannschaft/mitglieder | /fr/team/members?q=1#top [localized-team-members] |  | /fr/team/members?q=1#top [localized-team-members] | /fr/team/members?q=1#top [localized-team-members] | /de/mannschaft/mitglieder | null |
| /de/team-seite | /fr/equipe?q=1#top [localized-about-team-fr] |  | /fr/equipe?q=1#top [localized-about-team-fr] | /fr/equipe?q=1#top [localized-about-team-fr] | /de/team-seite | null |
| /de/ueber-uns | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /de/ueber-uns | null |
| /en | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en | null |
| /en/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /en/about | null |
| /en/about-team | /fr/equipe?q=1#top [localized-about-team-fr] |  | /fr/equipe?q=1#top [localized-about-team-fr] | /fr/equipe?q=1#top [localized-about-team-fr] | /en/about-team | null |
| /en/docs | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | /en/docs | null |
| /en/docs/start | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] |  | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /en/docs/start | null |
| /en/foo-bar/baz | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /en/foo-bar/baz | null |
| /en/team | /fr/team?q=1#top [localized-team] |  | /fr/team?q=1#top [localized-team] | /fr/team?q=1#top [localized-team] | /en/team | null |
| /en/team/members | /fr/team/members?q=1#top [localized-team-members] |  | /fr/team/members?q=1#top [localized-team-members] | /fr/team/members?q=1#top [localized-team-members] | /en/team/members | null |
| /fr | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /fr | null |
| /fr/about | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /fr/about | null |
| /fr/docs | /fr/docs?q=1#top [localized-docs] |  | /fr/docs?q=1#top [localized-docs] | /fr/docs?q=1#top [localized-docs] | /fr/docs | null |
| /fr/docs/getting-started | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] |  | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /fr/docs/getting-started?q=1#top [localized-docs-getting-started] | /fr/docs/getting-started | null |
| /fr/equipe | /fr/equipe?q=1#top [localized-about-team-fr] |  | /fr/equipe?q=1#top [localized-about-team-fr] | /fr/equipe?q=1#top [localized-about-team-fr] | /fr/equipe | null |
| /fr/foo-bar/baz | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] |  | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /fr/foo-bar/baz?q=1#top [localized-foo-bar-baz] | /fr/foo-bar/baz | null |
| /fr/team | /fr/team?q=1#top [localized-team] |  | /fr/team?q=1#top [localized-team] | /fr/team?q=1#top [localized-team] | /fr/team | null |
| /fr/team/members | /fr/team/members?q=1#top [localized-team-members] |  | /fr/team/members?q=1#top [localized-team-members] | /fr/team/members?q=1#top [localized-team-members] | /fr/team/members | null |
| / | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en | /fr |
| /en/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /en/ | null |
| /de/ | /fr?q=1#top [localized-index] |  | /fr?q=1#top [localized-index] | /fr?q=1#top [localized-index] | /de/ | null |
| /about/ | /fr/about?q=1#top [localized-about] |  | /fr/about?q=1#top [localized-about] | /fr/about?q=1#top [localized-about] | /en/about/ | /fr/about |
| /de/about/ | /fr/about?q=1#top [localized-about] |  | /fr/about/?q=1#top [localized-about] | /fr/about/?q=1#top [localized-about] | /de/about/ | null |
| /missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /en/missing | /fr/missing |
| /de/missing | /fr/missing?q=1#top [—] |  | /fr/missing?q=1#top [null] | /fr/missing?q=1#top [null] | /de/missing | null |
| /xx/about | /fr/xx/about?q=1#top [—] |  | /fr/xx/about?q=1#top [null] | /fr/xx/about?q=1#top [null] | /en/xx/about | /fr/xx/about |
| /de/de/about | /fr/de/about?q=1#top [—] |  | /fr/de/about?q=1#top [null] | /fr/de/about?q=1#top [null] | /de/de/about | null |

## localeRoute({ name, params }) from each home page

params: the PARAMS keys the route's records use.

| name | en from /en | de from /en | fr from /en | en from /de | de from /de | fr from /de | en from /fr | de from /fr | fr from /fr |
|---|---|---|---|---|---|---|---|---|---|
| about | /en/about [localized-about] | /de/ueber-uns [localized-about-de] | /fr/about [localized-about] | /en/about [localized-about] | /de/ueber-uns [localized-about-de] | /fr/about [localized-about] | /en/about [localized-about] | /de/ueber-uns [localized-about-de] | /fr/about [localized-about] |
| about-team | /en/about-team [localized-about-team] | /de/team-seite [localized-about-team-de] | /fr/equipe [localized-about-team-fr] | /en/about-team [localized-about-team] | /de/team-seite [localized-about-team-de] | /fr/equipe [localized-about-team-fr] | /en/about-team [localized-about-team] | /de/team-seite [localized-about-team-de] | /fr/equipe [localized-about-team-fr] |
| docs | /en/docs [localized-docs] | /de/docs [localized-docs] | /fr/docs [localized-docs] | /en/docs [localized-docs] | /de/docs [localized-docs] | /fr/docs [localized-docs] | /en/docs [localized-docs] | /de/docs [localized-docs] | /fr/docs [localized-docs] |
| docs-getting-started | /en/docs/start [localized-docs-getting-started-en] | /de/dokumente/einstieg [localized-docs-getting-started-de] | /fr/docs/getting-started [localized-docs-getting-started] | /en/docs/start [localized-docs-getting-started-en] | /de/dokumente/einstieg [localized-docs-getting-started-de] | /fr/docs/getting-started [localized-docs-getting-started] | /en/docs/start [localized-docs-getting-started-en] | /de/dokumente/einstieg [localized-docs-getting-started-de] | /fr/docs/getting-started [localized-docs-getting-started] |
| foo-bar-baz | /en/foo-bar/baz [localized-foo-bar-baz] | /de/foo-bar/baz [localized-foo-bar-baz] | /fr/foo-bar/baz [localized-foo-bar-baz] | /en/foo-bar/baz [localized-foo-bar-baz] | /de/foo-bar/baz [localized-foo-bar-baz] | /fr/foo-bar/baz [localized-foo-bar-baz] | /en/foo-bar/baz [localized-foo-bar-baz] | /de/foo-bar/baz [localized-foo-bar-baz] | /fr/foo-bar/baz [localized-foo-bar-baz] |
| index | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] | /en [localized-index] | /de [localized-index] | /fr [localized-index] |
| team | /en/team [localized-team] | /de/mannschaft [localized-team-de] | /fr/team [localized-team] | /en/team [localized-team] | /de/mannschaft [localized-team-de] | /fr/team [localized-team] | /en/team [localized-team] | /de/mannschaft [localized-team-de] | /fr/team [localized-team] |
| team-members | /en/team/members [localized-team-members] | /de/mannschaft/mitglieder [localized-team-members-de] | /fr/team/members [localized-team-members] | /en/team/members [localized-team-members] | /de/mannschaft/mitglieder [localized-team-members-de] | /fr/team/members [localized-team-members] | /en/team/members [localized-team-members] | /de/mannschaft/mitglieder [localized-team-members-de] | /fr/team/members [localized-team-members] |

## Invariant breaks (0)

none
