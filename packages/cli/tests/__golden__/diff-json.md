# diff-json

`i18n-micro diff --json` -> exit 0

## Output

```
[
  {
    "locale": "de",
    "file": "de.json",
    "missing": [
      {
        "key": "common.unused",
        "defaultValue": "Unused value"
      },
      {
        "key": "home.tagline",
        "defaultValue": "Fast i18n"
      },
      {
        "key": "greeting.hello",
        "defaultValue": "Hello"
      },
      {
        "key": "plural.apples",
        "defaultValue": "no apples | one apple | {count} apples"
      },
      {
        "key": "linked",
        "defaultValue": "See @:common.save"
      },
      {
        "key": "spaced",
        "defaultValue": "Trailing space "
      }
    ]
  },
  {
    "locale": "de",
    "file": "pages/index/de.json",
    "missing": [
      {
        "key": "footer",
        "defaultValue": "Save"
      }
    ]
  }
]
```

## Files

(no files changed)
