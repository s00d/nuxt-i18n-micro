# lint

`i18n-micro lint --rules no-trailing-spaces,no-empty-translation` -> exit 1

## Output

```
info
== Lint Summary ==
info ℹ Starting translation check
info Active rules: no-trailing-spaces, no-empty-translation
info Rules Checked: 2
info Issues Found: 3
info Review issues listed above or run with --json for machine-readable output.
info Apply automatic fixes where available: i18n-micro lint --fix
warn ⚠ Found 3 issues
warn [no-trailing-spaces] Found trailing spaces in file locales/en.json for key spaced (en)
warn [no-empty-translation] Empty translation in file locales/de.json for key common.cancel (de)
warn [no-empty-translation] Empty translation in file locales/pages/about/de.json for key about.more (de)
error Found 3 issues that need to be fixed
```

## Files

(no files changed)
