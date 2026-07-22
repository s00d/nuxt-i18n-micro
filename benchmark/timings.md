# Test infrastructure baseline timings

Recorded after Playwright shared-host + Vitest workspace migration (2026-07-07).

Environment: local macOS, Node from project toolchain.

| Command                              | Duration (wall)                           | Notes                                                                              |
| ------------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------- |
| `pnpm test:workspaces`               | ~9s                                       | 77 files, 921 tests (1 pre-existing react characterization flake fixed separately) |
| `pnpm test`                            | pending                                   | Root vitest projects (unit + e2e + packages)                                         |
| `pnpm test:unit`                       | pending                                   | Unit/build tests (`*.test.ts`, excluding `*.e2e.test.ts` and `performance.test.ts`) |
| `pnpm test:e2e`                        | pending                                   | Browser specs with shared prebuilt fixtures                                        |
| `pnpm exec vitest run --project e2e`   | pending                                   | Same as `test:e2e`                                                                 |

## Targets (from migration plan)

| Suite                   | Before (est.)        | Target                           |
| ----------------------- | -------------------- | -------------------------------- |
| CI e2e (full)           | 45–80 min sequential | ~6–10 min per shard (warm cache) |
| Local Playwright (full) | 40+ min              | ~8–12 min                        |
| Package unit tests      | 3–4 min (14× Jest)   | ~20–40 s                         |

Re-run this table after CI sharding lands and compare.
