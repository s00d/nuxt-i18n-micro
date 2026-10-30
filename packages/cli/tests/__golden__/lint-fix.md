# lint-fix

`i18n-micro lint --rules no-trailing-spaces --fix` -> exit 0

## Output

```
info
== Lint Summary ==
info ℹ Starting translation check
info Active rules: no-trailing-spaces
info Rules Checked: 1
info Issues Found: 1
info ℹ Starting automatic fixes
success ✔ Fixed 1 issues automatically
info Backup files were created with .bak extension
warn ⚠ Found 1 issues
warn [no-trailing-spaces] Found trailing spaces in file locales/en.json for key spaced (en)
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
    "list": [
      "a",
      "b"
    ]
  }
}
```
