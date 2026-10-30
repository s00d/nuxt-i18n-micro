# check-json

`i18n-micro check --json` -> exit 1

## Output

```
{
  "ok": false,
  "summary": {
    "missing": 6,
    "empty": 2,
    "extra": 1,
    "placeholders": 0,
    "undefined": 3,
    "unused": 22
  },
  "findings": [
    {
      "type": "empty",
      "locale": "de",
      "file": "de.json",
      "key": "common.cancel",
      "detail": "Cancel"
    },
    {
      "type": "missing",
      "locale": "de",
      "file": "de.json",
      "key": "common.unused",
      "detail": "Unused value"
    },
    {
      "type": "missing",
      "locale": "de",
      "file": "de.json",
      "key": "home.tagline",
      "detail": "Fast i18n"
    },
    {
      "type": "missing",
      "locale": "de",
      "file": "de.json",
      "key": "greeting.hello",
      "detail": "Hello"
    },
    {
      "type": "missing",
      "locale": "de",
      "file": "de.json",
      "key": "plural.apples",
      "detail": "no apples | one apple | {count} apples"
    },
    {
      "type": "missing",
      "locale": "de",
      "file": "de.json",
      "key": "spaced",
      "detail": "Trailing space "
    },
    {
      "type": "empty",
      "locale": "de",
      "file": "pages/about/de.json",
      "key": "about.more",
      "detail": "Read more"
    },
    {
      "type": "missing",
      "locale": "de",
      "file": "pages/index/de.json",
      "key": "footer",
      "detail": "Save"
    },
    {
      "type": "extra",
      "locale": "de",
      "file": "de.json",
      "key": "common.extra"
    },
    {
      "type": "undefined",
      "file": "components/SiteHeader.vue:2",
      "key": "header.brand"
    },
    {
      "type": "undefined",
      "file": "layouts/default.vue:2",
      "key": "footer.copyright"
    },
    {
      "type": "undefined",
      "file": "pages/blog/[slug].vue:2",
      "key": "post.heading"
    },
    {
      "type": "unused",
      "locale": "en",
      "file": "en.json",
      "key": "common.cancel"
    },
    {
      "type": "unused",
      "locale": "en",
      "file": "en.json",
      "key": "common.unused"
    },
    {
      "type": "unused",
      "locale": "en",
      "file": "en.json",
      "key": "plural.apples"
    },
    {
      "type": "unused",
      "locale": "en",
      "file": "en.json",
      "key": "spaced"
    },
    {
      "type": "unused",
      "locale": "en",
      "file": "en.json",
      "key": "limits.max"
    },
    {
      "type": "unused",
      "locale": "en",
      "file": "en.json",
      "key": "limits.enabled"
    },
    {
      "type": "unused",
      "locale": "en",
      "file": "en.json",
      "key": "limits.list"
    },
    {
      "type": "unused",
      "locale": "en",
      "file": "pages/index/en.json",
      "key": "hero.cta"
    },
    {
      "type": "unused",
      "locale": "de",
      "file": "de.json",
      "key": "common.cancel"
    },
    {
      "type": "unused",
      "locale": "de",
      "file": "de.json",
      "key": "common.extra"
    },
    {
      "type": "unused",
      "locale": "de",
      "file": "de.json",
      "key": "limits.max"
    },
    {
      "type": "unused",
      "locale": "de",
      "file": "de.json",
      "key": "limits.enabled"
    },
    {
      "type": "unused",
      "locale": "de",
      "file": "de.json",
      "key": "limits.list"
    },
    {
      "type": "unused",
      "locale": "de",
      "file": "pages/index/de.json",
      "key": "hero.cta"
    },
    {
      "type": "unused",
      "locale": "ru",
      "file": "ru.json",
      "key": "common.cancel"
    },
    {
      "type": "unused",
      "locale": "ru",
      "file": "ru.json",
      "key": "common.unused"
    },
    {
      "type": "unused",
      "locale": "ru",
      "file": "ru.json",
      "key": "plural.apples"
    },
    {
      "type": "unused",
      "locale": "ru",
      "file": "ru.json",
      "key": "spaced"
    },
    {
      "type": "unused",
      "locale": "ru",
      "file": "ru.json",
      "key": "limits.max"
    },
    {
      "type": "unused",
      "locale": "ru",
      "file": "ru.json",
      "key": "limits.enabled"
    },
    {
      "type": "unused",
      "locale": "ru",
      "file": "ru.json",
      "key": "limits.list"
    },
    {
      "type": "unused",
      "locale": "ru",
      "file": "pages/index/ru.json",
      "key": "hero.cta"
    }
  ]
}
Check failed: 6 missing, 2 empty, 1 extra, 3 undefined, 22 unused.
```

## Files

(no files changed)
