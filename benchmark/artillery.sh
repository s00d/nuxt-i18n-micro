#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG="${SCRIPT_DIR}/artillery-config.yml"
OUTPUT="${SCRIPT_DIR}/artillery-output.json"

# Check that Artillery is installed
if ! command -v artillery &> /dev/null; then
    echo "Artillery is not installed. Install it with: npm install -g artillery"
    exit 1
fi

# The Artillery Cloud key comes from the environment: export ARTILLERY_CLOUD_KEY=...
if [ -z "${ARTILLERY_CLOUD_KEY:-}" ]; then
    echo "ARTILLERY_CLOUD_KEY is not set. Running without recording to Artillery Cloud..."
    artillery run "$CONFIG" --output "$OUTPUT"
else
    echo "Running the Artillery test (recording to Artillery Cloud)..."
    # Pass the key via an environment variable so it does not leak into argv / the process list.
    ARTILLERY_CLOUD_API_KEY="$ARTILLERY_CLOUD_KEY" artillery run "$CONFIG" --record --output "$OUTPUT"
fi

# Process the results
echo "Test results:"
artillery report "$OUTPUT"
