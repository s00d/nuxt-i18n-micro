# replace-values

`i18n-micro replace-values --search Save --replace Store` -> exit 0

## Output

```
success Translation values have been updated. Changed keys: 2
```

## Files

changed locales/en.json

```
{
  "common": {
    "save": "Store",
    "cancel": "Cancel",
    "unused": "Unused value"
  },
  "home": {
    "title": "Welcome {name}",
    "tagline": "Fast i18n"
  },
  "greeting": {
    "hello": "Hello"
  },
  "plural": {
    "apples": "no apples | one apple | {count} apples"
  },
  "linked": "See @:common.save",
  "spaced": "Trailing space ",
  "limits": {
    "max": 10,
    "enabled": true,
    "list": [
      "a",
      "b"
    ]
  }
}
```

changed locales/pages/index/en.json

```
{
  "hero": {
    "cta": "Start now"
  },
  "footer": "Store"
}
```
