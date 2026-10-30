# lint-json

`i18n-micro lint --rules no-trailing-spaces --json` -> exit 1

## Output

```
{
  "rulesChecked": [
    "no-trailing-spaces"
  ],
  "issueCount": 1,
  "fixedCount": 0,
  "fixApplied": false,
  "issues": [
    {
      "file": "en.json",
      "locale": "en",
      "scope": "",
      "key": "spaced",
      "value": "Trailing space ",
      "rule": "no-trailing-spaces"
    }
  ]
}
Found 1 issues that need to be fixed
  Review the issues above, or run with --json for machine-readable output.
  Apply automatic fixes where available: i18n-micro lint --fix
```

## Files

(no files changed)
