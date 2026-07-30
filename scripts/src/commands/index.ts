import { apiSurfaceCommand } from './api-surface'
import { changelogFromRefCommand } from './changelog-from-ref'
import { checkVersionsCommand } from './check-versions'
import { comparePublishedCommand } from './compare-published'
import { depsAuditCommand } from './deps-audit'
import { docsAuditCommand } from './docs-audit'
import { docsGenerateCommand } from './docs-generate'
import { ensureNpmAuthCommand } from './ensure-npm-auth'
import { fixturesAuditCommand } from './fixtures-audit'
import { payloadBudgetCommand } from './payload-budget'
import { preflightCommand } from './preflight'
import { releaseCommand } from './release'
import { smokeBrowserCommand } from './smoke-browser'
import { smokePackCommand } from './smoke-pack'
import { smokeVerifyCommand } from './smoke-verify'
import { verifyPackagesCommand } from './verify-packages'

export const commands = {
  'api-surface': apiSurfaceCommand,
  'changelog-from-ref': changelogFromRefCommand,
  'check-versions': checkVersionsCommand,
  'compare-published': comparePublishedCommand,
  'deps-audit': depsAuditCommand,
  'docs-audit': docsAuditCommand,
  'docs-generate': docsGenerateCommand,
  'ensure-npm-auth': ensureNpmAuthCommand,
  'fixtures-audit': fixturesAuditCommand,
  'payload-budget': payloadBudgetCommand,
  preflight: preflightCommand,
  release: releaseCommand,
  'smoke-pack': smokePackCommand,
  'smoke-verify': smokeVerifyCommand,
  'smoke-browser': smokeBrowserCommand,
  'verify-packages': verifyPackagesCommand,
}
