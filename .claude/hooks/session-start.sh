#!/bin/bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# No dependencies to install for this documentation-only repository.
# Add dependency installation commands here if the project adds code in the future.
