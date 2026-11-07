# Terminal demo for /guide/cli, recorded with vhs (https://github.com/charmbracelet/vhs).
#
# Re-record:
#   1. pnpm --filter @i18n-micro/cli build
#   2. A small Nuxt app outside the repo with `nuxt` and `nuxt-i18n-micro` installed or linked into
#      node_modules: locales en + de, one key missing in de, one key used in code with only a default
#      text, two keys nothing uses. Commit it, so the run can be repeated after `git checkout .`.
#   3. From that app: env -u CI -u NO_COLOR I18N_MICRO_CLI=<repo>/packages/cli/bin/i18n-micro.mjs vhs <repo>/docs/public/cli/demo.tape
#      (with CI or NO_COLOR set the CLI prints without colors, as it should)
#   4. Copy demo.gif here (docs/public/cli/demo.gif).

Output demo.gif

Set Shell "bash"
Set FontSize 17
Set Width 1200
Set Height 640
Set Padding 24
Set LineHeight 1.3
Set TypingSpeed 45ms
Set Framerate 20
Set PlaybackSpeed 1
Set Theme { "name": "nuxt-i18n-micro", "background": "#18181b", "foreground": "#e4e4e7", "cursor": "#32ba8c", "selection": "#3f3f46", "black": "#27272a", "red": "#f87171", "green": "#32ba8c", "yellow": "#facc15", "blue": "#60a5fa", "magenta": "#c084fc", "cyan": "#22d3ee", "white": "#e4e4e7", "brightBlack": "#71717a", "brightRed": "#fca5a5", "brightGreen": "#6ee7b7", "brightYellow": "#fde047", "brightBlue": "#93c5fd", "brightMagenta": "#d8b4fe", "brightCyan": "#67e8f9", "brightWhite": "#fafafa" }

Hide
Type 'export PS1="\[\e[32m\]shop\[\e[0m\] $ " && alias i18n-micro="node $I18N_MICRO_CLI" && git checkout -q . && clear'
Enter
Show

Sleep 600ms
Type "i18n-micro check"
Sleep 300ms
Enter
Sleep 4s

Type "i18n-micro extract"
Sleep 300ms
Enter
Sleep 3s

Type "i18n-micro clean --dryRun"
Sleep 300ms
Enter
Sleep 4s

Hide
Type "git checkout -q ."
Enter
