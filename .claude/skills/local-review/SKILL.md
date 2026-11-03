---
name: local-review
description: Local stand-in for the cubic PR review of this repo. A team of reviewers reads a diff with the repo's learnings, a verifier drops what does not hold, and the findings come back ranked. Use when asked for a local review, "как кубик", or before pushing a large change. Args, in any order, all optional: base ref (default `main`), sensitivity `low`, `medium` (default) or `high`, a path to limit the diff.
---

# Local review

The same job as cubic, on this machine. It costs tokens, not CI, and edits nothing.

## 1. The diff

- Base: the ref in the args, or `main`. Review `git diff <base>...HEAD`, plus uncommitted changes.
- Leave out of the review, as cubic does: `**/__tests__/**`, `**/*.spec.*`, `**/*.test.*`. Also `dist/`, `pnpm-lock.yaml`, generated `docs/content/api/`, `scripts/api-surface/` and `test/routing-characterization/__golden__/`.
- The test agent in step 2 still reads test files.
- Empty diff: say so and stop.

Over 3000 changed lines: split the files by area (`src/`, each `packages/<name>`, `docs/`, `scripts/`) and give each reviewer one area at a time, largest risk first. Name what was left out instead of skimming it.

## 2. Checks with no agent

Run these yourself, once:

- **Merge conflicts:** search the changed files for lines that start with `<<<<<<<`, `=======` or `>>>>>>>`.
- **Tests:** for each function or type added, removed or changed in signature, is a test file changed in this diff? Report a gap only when no test reaches the changed code. Coverage from an older test counts: read it before calling it a gap.

## 3. The reviewers

Start them together with the Agent tool, `model: sonnet`. Each brief carries: the diff or the area, the path to `.claude/review/learnings.md`, `AGENTS.md`, `.claude/rules/*`, and these lines: do NOT use the Agent tool; read the code around the change, not only the hunks; report only what a real input breaks; no style or naming notes; change nothing.

| Reviewer | Looks for |
| --- | --- |
| logic | wrong branches, lost cases, state and ordering, races, async, hydration: server and client disagreeing |
| routing and locale | strategies (`prefix`, `prefix_except_default`, `prefix_and_default`, `no_prefix`), hash mode, domains, SPA, static, cookies, redirects |
| boundaries | untrusted input: `__proto__`, open redirects, path traversal, XSS in head and `<i18n-t>`, tokens in logs |
| performance | hot paths on the server, quadratic work, unbounded caches, bundle growth, an import that pulls `vue-router` into a main entry |
| contracts | public exports, types, `package.json` exports, peers, Windows paths, Edge runtimes, docs that no longer match the code |

`high` adds one reviewer that reads every changed file against `.claude/review/learnings.md` rule by rule.

Each one returns a list: file, line, severity (P1 breaks users, P2 a real but narrow bug, P3 minor), the claim, and a concrete failure: this input gives this wrong output.

## 4. Verify

Treat every finding as wrong until shown otherwise. Give the merged list to one agent, default model, with no conclusions from you. It reads the code, tries to refute each finding, and checks each against the `Do not apply when` of `learnings.md`. It marks CONFIRMED when it traced the failure through the code, PLAUSIBLE when it could not refute it and could not prove it, and drops the rest. Where a short command proves it, it runs it. It does not edit tracked files.

## 5. Report

Keep by sensitivity: `low` P1, `medium` P1 and P2, `high` all. Send the kept ones to `ReportFindings`, most severe first, with `level` set. Empty list when nothing holds. After it say in Russian, briefly: what was reviewed, what was left out, how many findings were dropped.

## Learnings

`.claude/review/learnings.md` is the repo's memory of what reviewers got wrong. When the owner rejects a finding and says why, add one entry there, in the same form. To bring in new ones from cubic, use `mcp__cubic__list_learnings` for `s00d/nuxt-i18n-micro`. A rule that no longer matches the code gets fixed or removed, not obeyed.
