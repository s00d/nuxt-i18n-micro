# text-to-i18n-dry

`i18n-micro text-to-i18n --dryRun` -> exit 0

## Output

```
● Found 7 files to process.

◇ Text in code, not rewritten: `$t` may not be in scope there (1)
  plugins/notify.ts:2  Saved successfully

● Found 3 new translations.

◇ Would add (3)
  pages.about.read-more               "Read more"               pages/about.vue:4
  pages.index.hardcoded-landing-text  "Hardcoded landing text"  pages/index.vue:6
  pages.index.company-logo            "Company logo"            pages/index.vue:8

● Dry run: no files were modified.
```

## Files

(no files changed)
