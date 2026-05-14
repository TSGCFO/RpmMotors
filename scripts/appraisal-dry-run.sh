#!/usr/bin/env bash
#
# Discoverable entrypoint for the offline appraisal dry-run.
#
# Editing package.json is forbidden in this project, so this shell wrapper
# stands in for `pnpm run appraisal:dry-run`. Usage:
#
#   scripts/appraisal-dry-run.sh path/to/input.json
#   cat input.json | scripts/appraisal-dry-run.sh
#
# Requires ANTHROPIC_API_KEY. Honours FIRECRAWL_API_KEY when set.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec npx tsx "$DIR/scripts/appraisal-dry-run.ts" "$@"
