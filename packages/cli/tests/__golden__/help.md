# help

`i18n-micro --help` -> exit 0

## Output

```
Command-line tools for nuxt-i18n-micro (i18n-micro v1.0.0)

USAGE i18n-micro info|check|stats|lint|search|extract|translate|sync|clean|text-to-i18n|rename|pseudo|format|export|import|sync-remote

COMMANDS

          info    Print the resolved i18n configuration of the project
         check    The CI gate: fail on missing, empty, extra, undefined or unused keys and broken placeholders
         stats    Show translation completion per locale
          lint    Check the text of translations; fails when issues remain
        search    Search keys and values, and show where each key is used
       extract    List the keys source files use that have no text yet, and add those with a default text to the default locale
     translate    Fill missing translations from the default locale through a translation service
          sync    Remove keys the default locale does not have. Missing keys stay missing, for fallbackLocale and `check`
         clean    Remove keys nothing in the project uses; stops when that cannot be proven
  text-to-i18n    Replace hardcoded text in Vue templates with translation calls, and report hardcoded text in code
        rename    Rename a key or a namespace in every locale and in source files
        pseudo    Fill a locale with pseudo-translations to find layout and hardcoded-text issues
        format    Rewrite locale files with sorted keys and uniform indentation
        export    Export locale files to PO or CSV, with the default-locale text as the source
        import    Merge PO or CSV files into the locale files
   sync-remote    Pull global translations from, or push them to, the HTTP endpoint in .i18n-remote.json

Use i18n-micro <command> --help for more information about a command.
```

## Files

(no files changed)
