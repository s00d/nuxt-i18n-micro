# lint

`i18n-micro lint --rules no-trailing-spaces,no-empty-translation` -> exit 1

## Output

```
Active rules: no-trailing-spaces, no-empty-translation
[no-trailing-spaces] Found trailing spaces in file <project>/locales/en.json for key spaced (en)
[no-empty-translation] Empty translation in file <project>/locales/de.json for key common.cancel (de)
[no-empty-translation] Empty translation in file <project>/locales/pages/about/de.json for key about.more (de)
Found 3 issues that need to be fixed
  Review the issues above, or run with --json for machine-readable output.
  Apply automatic fixes where available: i18n-micro lint --fix
```

## Files

(no files changed)
