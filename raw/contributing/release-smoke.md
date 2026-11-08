# Release smoke checks

The test suites run against the source; these checks install the module the way a user does and test the running app. Run them before a release (packed from the checkout) and after one (from npm), and whenever you touch payload output for serverless or Edge presets. The app is [`test/deploy-smoke`](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/deploy-smoke).

## Sources

<table>
<thead>
  <tr>
    <th>
      Source
    </th>
    
    <th>
      Installs
    </th>
    
    <th>
      Catches
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        git
      </code>
    </td>
    
    <td>
      Tarballs packed from the checkout
    </td>
    
    <td>
      Packaging problems before publishing: missing files, unresolved <code>
        workspace:
      </code>
      
       / <code>
        catalog:
      </code>
      
      , undeclared dependencies
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        npm
      </code>
    </td>
    
    <td>
      <code>
        nuxt-i18n-micro@latest
      </code>
      
       or a named version
    </td>
    
    <td>
      A bad or missing publish, version mismatch between the module and <code>
        @i18n-micro/*
      </code>
    </td>
  </tr>
</tbody>
</table>

`smoke-pack` packs every workspace package with `pnpm pack` (only pnpm rewrites `workspace:` and `catalog:`) and points each tarball's `@i18n-micro/*` dependencies at its siblings, because the local versions are not on npm yet.

## What is checked

`smoke-verify --url <base>` (HTTP, so it runs against a local server or a deployment):

- `/`, `/de`, `/fr`, `/de/about` render their own translations; plurals resolve; no raw keys in the HTML;
- `/_locales/index/de/data.json` returns the chunk and is cacheable (not `no-store`);
- `hreflang` alternates with `x-default`, `canonical`, `og:locale`, and `<html lang>` matching the locale.

`smoke-browser --url <base>` (Playwright) adds hydration, client navigation between pages and locales with no raw key visible mid-transition, and no uncaught page errors.

## Run locally

```bash
pnpm run prepack
pnpm -C scripts cli smoke-pack --app test/deploy-smoke
cd test/deploy-smoke
printf 'packages:\n  - .\n' > pnpm-workspace.yaml
pnpm install --no-frozen-lockfile
pnpm exec nuxt build
PORT=3000 node .output/server/index.mjs &
cd ../..
pnpm -C scripts cli smoke-verify --url http://127.0.0.1:3000
pnpm -C scripts cli smoke-browser --url http://127.0.0.1:3000
```

For a published version, skip `smoke-pack` and set the dependency to `nuxt-i18n-micro@<version>` before installing.

## Serverless presets locally

The unit tests and the `node-server` fixtures do not catch SSR that cannot read `public/` on a function or Edge preset. `preset-smoke` packs, installs, builds `test/deploy-smoke` with a real preset, runs it with the runner that matches the artifact, and calls `smoke-verify`:

```bash
pnpm run prepack                       # once
pnpm run test:presets                  # vercel, cloudflare_pages, netlify
pnpm -C scripts cli preset-smoke --preset vercel                         # one preset
pnpm -C scripts cli preset-smoke --preset vercel --public-assets false   # SSR from serverAssets only
pnpm -C scripts cli preset-smoke --preset vercel --skip-pack --skip-install   # faster reruns
```

`--browser` also runs `smoke-browser`; `--skip-build` reuses the preset output.

<table>
<thead>
  <tr>
    <th>
      Preset
    </th>
    
    <th>
      Runner
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        vercel
      </code>
    </td>
    
    <td>
      Imports <code>
        .vercel/output/functions/__fallback.func/index.mjs
      </code>
      
       as a Node listener (as Nitro's own preset tests do; nitropack 2 has no <code>
        preview
      </code>
      
       for it)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        cloudflare_pages
      </code>
    </td>
    
    <td>
      <code>
        wrangler pages dev dist
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        netlify
      </code>
    </td>
    
    <td>
      Imports <code>
        .netlify/functions-internal/server/main.mjs
      </code>
      
       behind a local HTTP server
    </td>
  </tr>
</tbody>
</table>

`vercel dev`, emulators and swapping to a Node adapter are not used: they run a different artifact.

## CI workflow

`.github/workflows/release-smoke.yml` runs **manually** (Actions → *release smoke* → *Run workflow*), after a publish has reached npm. Inputs: `source` (`both`, `git`, `npm`), `version` (default `latest`), `deploy`.

With `deploy` it deploys the **published** package to Cloudflare Pages and Vercel, waits for the deployment, and runs `smoke-verify` and `smoke-browser` against the live URL. Use dedicated projects: every run replaces the deployment.

<table>
<thead>
  <tr>
    <th>
      Name
    </th>
    
    <th>
      Kind
    </th>
    
    <th>
      Where to get it
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        CLOUDFLARE_PROJECT_NAME
      </code>
    </td>
    
    <td>
      variable
    </td>
    
    <td>
      A direct-upload Pages project (<em>
        Workers & Pages
      </em>
      
       → <em>
        Create
      </em>
      
       → <em>
        Pages
      </em>
      
       → <em>
        Upload assets
      </em>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        CLOUDFLARE_ACCOUNT_ID
      </code>
    </td>
    
    <td>
      secret
    </td>
    
    <td>
      The ID in the dashboard URL, or <em>
        Account details
      </em>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        CLOUDFLARE_API_TOKEN
      </code>
    </td>
    
    <td>
      secret
    </td>
    
    <td>
      Custom token with one permission: Account · Cloudflare Pages · Edit; no IP filter
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        VERCEL_ORG_ID
      </code>
      
      , <code>
        VERCEL_PROJECT_ID
      </code>
    </td>
    
    <td>
      secret
    </td>
    
    <td>
      <code>
        pnpm dlx vercel link
      </code>
      
       in <code>
        test/deploy-smoke
      </code>
      
       writes them to <code>
        .vercel/project.json
      </code>
      
       (do not commit it)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        VERCEL_TOKEN
      </code>
    </td>
    
    <td>
      secret
    </td>
    
    <td>
      A token scoped to the account or team that owns the project
    </td>
  </tr>
</tbody>
</table>

## Related

<card-group>
<card icon="i-lucide-git-pull-request" title="Maintenance commands" to="/contributing/maintenance-commands">



</card>

<card icon="i-lucide-book-open" title="Deployment" to="/guide/deployment">



</card>

<card icon="i-lucide-git-pull-request" title="Contributing" to="/contributing/">



</card>
</card-group>
