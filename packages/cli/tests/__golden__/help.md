# help

`i18n-micro --help` -> exit 0

## Output

```
⚡️ nuxt-i18n-micro-cli CLI Experience (nuxt-i18n-micro-cli v2.1.2)

USAGE nuxt-i18n-micro-cli init|info|format|split|import|export|extract|sync|sync-remote|validate|stats|clean|translate|export-csv|import-csv|diff|check-duplicates|replace-values|optimize|text-to-i18n|search|rename|pseudo|estimate|glossary|backup|restore|lint

COMMANDS

              init    Initialize a new Nuxt 3 project with nuxt-i18n-micro
              info    Display detailed information about the CLI, project configuration, and system environment
            format    Format translation files by sorting keys and applying consistent indentation
             split    Split large translation files into smaller ones based on specified criteria
            import    Convert PO files back to JSON format and save in translationDir
            export    Export translations to PO files for external translation management
           extract    Extract translations and organize them by scope
              sync    Synchronize translation files across locales
       sync-remote    Synchronize translations with remote storage
          validate    Validate translation files for missing or extra keys
             stats    Display translation statistics for each locale
             clean    Remove unused and empty translation keys from translation files
         translate    Automatically translate missing keys using external translation services
        export-csv    Export translations to CSV files, including from subdirectories
        import-csv    Import translations from CSV files, including from subdirectories
              diff    Compares translation files between the default locale and other locales in the same directory, including subdirectories, showing missing keys and their values in the default locale.
  check-duplicates    Check for duplicate translation values within each language across all files (global and pages)
    replace-values    Bulk replace translation values across all locales
          optimize    Optimize translation files structure
      text-to-i18n    Replace text in files with translation references
            search    Search translation keys, values, usages, and hardcoded text
            rename    Safely rename translation key in locales and source files
            pseudo    Generate pseudo-locale from a source locale
          estimate    Estimate translation tokens and cost before running translate
          glossary    Manage glossary terms used by translation workflows
            backup    Create a backup of translation files
           restore    Restore translation files from a backup
              lint    Check translation quality

Use nuxt-i18n-micro-cli <command> --help for more information about a command.
```

## Files

(no files changed)
