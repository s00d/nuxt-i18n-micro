# help

`i18n-micro --help` -> exit 0

## Output

```
Command-line tools for nuxt-i18n-micro (i18n-micro v1.0.0)

USAGE i18n-micro init|info|extract|translate|sync|sync-remote|validate|stats|lint|clean|search|text-to-i18n|rename|replace-values|pseudo|optimize|format|split|export|import|export-csv|import-csv|diff|check-duplicates|backup|restore|estimate|glossary

COMMANDS

              init    Create a new Nuxt project wired to nuxt-i18n-micro
              info    Print the CLI version, the resolved project configuration and the environment
           extract    Add the translation keys used in source files to the locale files
         translate    Fill missing translations from the default locale through a translation service
              sync    Give every locale the key structure of the default locale, removing extra keys
       sync-remote    Pull translations from, or push them to, the remote described in .i18n-remote.json
          validate    Fail when a locale misses keys of the default locale or has extra ones
             stats    Show translation completion per locale
              lint    Check translation quality; fails when issues remain
             clean    Remove keys no source file uses
            search    Search keys, values, source usages and hardcoded text across all layers
      text-to-i18n    Replace hardcoded text in templates and code with translation calls
            rename    Rename a key in every locale, in linked messages and in source files
    replace-values    Replace text in the values of every locale
            pseudo    Fill a locale with pseudo-translations to find layout and hardcoded-text issues
          optimize    Report oversized files, deep nesting and duplicated values
            format    Rewrite locale files with sorted keys and uniform indentation
             split    Write each locale as smaller files grouped by top-level key, for review or hand-off
            export    Export locale files to PO
            import    Merge PO files into the locale files
        export-csv    Export every locale to one CSV file, page files included
        import-csv    Merge CSV files into the locale files
              diff    List keys each locale misses compared with the default locale
  check-duplicates    List identical values under different keys, per locale
            backup    Archive the translation directory
           restore    List backups, or restore one over the translation directory
          estimate    Estimate tokens and cost of a translate run
          glossary    Manage the glossary the `ai` translation service follows

Use i18n-micro <command> --help for more information about a command.
```

## Files

(no files changed)
