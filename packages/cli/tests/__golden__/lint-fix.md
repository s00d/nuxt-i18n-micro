# lint-fix

`i18n-micro lint --rules no-trailing-spaces --fix` -> exit 0

## Output

```
Active rules: no-trailing-spaces
Fixed 1 issues.
Check completed. No issues remain.
[no-trailing-spaces] spaced (en) in en.json
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
