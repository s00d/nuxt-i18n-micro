import { defineCommand } from 'citty'
import { resolveFromTag } from '../utils/release-tag'

export const changelogFromRefCommand = defineCommand({
  meta: {
    name: 'changelog-from-ref',
    description: [
      'Print the tag changelogen should generate from: the highest v3+ tag on the',
      'ancestry of HEAD.',
      '',
      'The repo carries hundreds of legacy v1.x tags, and both `git describe` and',
      "changelogen's own default happily bind to one of them — which produces a",
      'changelog thousands of lines long.',
      '',
      'Example:',
      '  pnpm -C scripts cli changelog-from-ref',
    ].join('\n'),
  },
  setup() {
    process.stdout.write(resolveFromTag('changelog-from-ref'))
  },
})
