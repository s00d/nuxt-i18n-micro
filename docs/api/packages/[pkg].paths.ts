/**
 * One page per workspace package, from the same generated data the index reads.
 *
 * A dynamic route rather than fifteen committed Markdown files: adding a package to the
 * workspace adds its page, and removing one removes it, with nothing to regenerate.
 */
import { type ApiPackage, loadPackages } from '../packages.data'

/** The route param has to be named after the `[pkg]` in the filename, or every page collides. */
type PackageParams = ApiPackage & { pkg: string }

export default {
  paths(): { params: PackageParams }[] {
    return loadPackages().map((pkg) => ({ params: { ...pkg, pkg: pkg.slug } }))
  },
}
