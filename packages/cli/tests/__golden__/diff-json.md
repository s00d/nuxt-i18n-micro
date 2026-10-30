# diff-json

`i18n-micro diff --json` -> exit 0

## Output

```
[
  {
    "file": "en.json",
    "missingInLocale": [
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
    "file": "pages/index/en.json",
    "missingInLocale": [
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
