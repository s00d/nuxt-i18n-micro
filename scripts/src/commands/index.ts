import { apiSurfaceCommand } from './api-surface'
import { bumpCommand } from './bump'
import { changelogFromRefCommand } from './changelog-from-ref'
import { checkVersionsCommand } from './check-versions'
import { ciPrReportCommand } from './ci-pr-report'
import { comparePublishedCommand } from './compare-published'
import { consumerTypesCommand } from './consumer-types'
import { depsAuditCommand } from './deps-audit'
import { docsAuditCommand } from './docs-audit'
import { docsGenerateCommand } from './docs-generate'
import { ensureNpmAuthCommand } from './ensure-npm-auth'
import { ensureReleaseSourceCommand } from './ensure-release-source'
import { fixturesAuditCommand } from './fixtures-audit'
import { httpFuzzCommand } from './http-fuzz'
import { oldestVersionsCommand } from './oldest-versions'
import { payloadBudgetCommand } from './payload-budget'
import { performanceCommand } from './performance'
import { preflightCommand } from './preflight'
import { publishCommand } from './publish'
import { prDiffAuditCommand } from './pr-diff-audit'
import { releaseCommand } from './release'
import { presetSmokeCommand } from './preset-smoke'
import { smokeBrowserCommand } from './smoke-browser'
import { smokePackCommand } from './smoke-pack'
import { smokeVerifyCommand } from './smoke-verify'
import { verifyPackagesCommand } from './verify-packages'

export const commands = {
  'api-surface': apiSurfaceCommand,
  bump: bumpCommand,
  'changelog-from-ref': changelogFromRefCommand,
  'check-versions': checkVersionsCommand,
  'ci-pr-report': ciPrReportCommand,
  'compare-published': comparePublishedCommand,
  'consumer-types': consumerTypesCommand,
  'deps-audit': depsAuditCommand,
  'docs-audit': docsAuditCommand,
  'docs-generate': docsGenerateCommand,
  'ensure-npm-auth': ensureNpmAuthCommand,
  'ensure-release-source': ensureReleaseSourceCommand,
  'fixtures-audit': fixturesAuditCommand,
  'http-fuzz': httpFuzzCommand,
  'oldest-versions': oldestVersionsCommand,
  'payload-budget': payloadBudgetCommand,
  performance: performanceCommand,
  'pr-diff-audit': prDiffAuditCommand,
  'preset-smoke': presetSmokeCommand,
  preflight: preflightCommand,
  publish: publishCommand,
  release: releaseCommand,
  'smoke-pack': smokePackCommand,
  'smoke-verify': smokeVerifyCommand,
  'smoke-browser': smokeBrowserCommand,
  'verify-packages': verifyPackagesCommand,
}
