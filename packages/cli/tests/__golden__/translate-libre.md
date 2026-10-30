# translate-libre

`i18n-micro translate --service libretranslate --token k --options baseUrl:<mock>` -> exit 0

## Output

```
Translating locale: de
Translating locale: ru
Translated 9 strings.
```

## Files

changed locales/de.json

```
{
  "common": {
    "save": "Speichern",
    "cancel": "de Cancel",
    "extra": "Nur auf Deutsch",
    "unused": "de Unused value"
  },
  "home": {
    "title": "Willkommen {name}",
    "tagline": "de Fast i18n"
  },
  "limits": {
    "max": 20,
    "enabled": false,
    "list": [
      "x"
    ]
  },
  "greeting": {
    "hello": "de Hello"
  },
  "plural": {
    "apples": "de no apples | de one apple | de {count} apples"
  },
  "linked": "de See @:common.save",
  "spaced": "de Trailing space "
}
```

changed locales/pages/about/de.json

```
{
  "about": {
    "title": "Über uns",
    "more": "de Read more"
  }
}
```

changed locales/pages/index/de.json

```
{
  "hero": {
    "cta": "Jetzt starten"
  },
  "footer": "de Save"
}
```

## Requests

```
POST /translate {"q":["Cancel","Unused value","Fast i18n","Hello","no apples","one apple","<v0/> apples","See <v0/>","Trailing space "],"source":"en","target":"de","format":"html","api_key":"k"}
POST /translate {"q":["Read more"],"source":"en","target":"de","format":"html","api_key":"k"}
POST /translate {"q":["Save"],"source":"en","target":"de","format":"html","api_key":"k"}
```
