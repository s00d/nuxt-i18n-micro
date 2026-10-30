# lint-fix

`i18n-micro lint --rules no-trailing-spaces --fix` -> exit 0

## Output

```
Active rules: no-trailing-spaces
Fixed 1 issues; originals kept as .bak
Check completed. No issues remain.
[no-trailing-spaces] Found trailing spaces in file <project>/locales/en.json for key spaced (en)
```

## Files

changed locales/en.json

```
{
  "common": {
    "save": "Save",
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
  "spaced": "Trailing space",
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

added locales/en.json.bak

```
{
  "common": {
    "save": "Save",
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
    "list": ["a", "b"]
  }
}
```
