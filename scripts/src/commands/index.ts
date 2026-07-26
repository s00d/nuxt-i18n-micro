import { changelogFromRefCommand } from './changelog-from-ref'
import { checkVersionsCommand } from './check-versions'
import { comparePublishedCommand } from './compare-published'
import { ensureNpmAuthCommand } from './ensure-npm-auth'
import { releaseCommand } from './release'
import { smokeBrowserCommand } from './smoke-browser'
import { smokePackCommand } from './smoke-pack'
import { smokeVerifyCommand } from './smoke-verify'
import { verifyPackagesCommand } from './verify-packages'

export const commands = {
  'changelog-from-ref': changelogFromRefCommand,
  'check-versions': checkVersionsCommand,
  'compare-published': comparePublishedCommand,
  'ensure-npm-auth': ensureNpmAuthCommand,
  release: releaseCommand,
  'smoke-pack': smokePackCommand,
  'smoke-verify': smokeVerifyCommand,
  'smoke-browser': smokeBrowserCommand,
  'verify-packages': verifyPackagesCommand,
}
