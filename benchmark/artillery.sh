#!/bin/bash
# Deprecated: Artillery load is configured programmatically in
# scripts/src/perf/load.ts and run via `pnpm test:performance`.
set -euo pipefail
echo "artillery.sh is deprecated."
echo "Use:  pnpm test:performance"
echo "Paths/phases live in scripts/src/perf/load.ts (no YAML)."
exit 1
