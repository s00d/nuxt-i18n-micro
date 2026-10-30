# check

`i18n-micro check` -> exit 1

## Output

```
empty (2):
  - de common.cancel [de.json]: Cancel
  - de about.more [pages/about/de.json]: Read more

missing (6):
  - de common.unused [de.json]: Unused value
  - de home.tagline [de.json]: Fast i18n
  - de greeting.hello [de.json]: Hello
  - de plural.apples [de.json]: no apples | one apple | {count} apples
  - de spaced [de.json]: Trailing space
  - de footer [pages/index/de.json]: Save

extra (1):
  - de common.extra [de.json]

undefined (3):
  - header.brand [components/SiteHeader.vue:2]
  - footer.copyright [layouts/default.vue:2]
  - post.heading [pages/blog/[slug].vue:2]

unused (22):
  - en common.cancel [en.json]
  - en common.unused [en.json]
  - en plural.apples [en.json]
  - en spaced [en.json]
  - en limits.max [en.json]
  - en limits.enabled [en.json]
  - en limits.list [en.json]
  - en hero.cta [pages/index/en.json]
  - de common.cancel [de.json]
  - de common.extra [de.json]
  - de limits.max [de.json]
  - de limits.enabled [de.json]
  - de limits.list [de.json]
  - de hero.cta [pages/index/de.json]
  - ru common.cancel [ru.json]
  - ru common.unused [ru.json]
  - ru plural.apples [ru.json]
  - ru spaced [ru.json]
  - ru limits.max [ru.json]
  - ru limits.enabled [ru.json]
  - ru limits.list [ru.json]
  - ru hero.cta [pages/index/ru.json]
Check failed: 6 missing, 2 empty, 1 extra, 3 undefined, 22 unused.
  Translate what is missing: i18n-micro translate.
  Remove extra keys: i18n-micro sync.
  Add the listed keys to the default locale.
  Remove unused keys: i18n-micro clean.
```

## Files

(no files changed)
