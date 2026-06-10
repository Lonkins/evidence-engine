#!/usr/bin/env bash
# Read-only sanity check: confirm $count == 3 after docs upload.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
set -a; source "$SCRIPT_DIR/.env"; set +a
SEARCH_URL="https://${SEARCH_SERVICE_NAME}.search.windows.net"
API_VERSION="2026-05-01-preview"
COUNT=$(curl -s \
  -H "api-key: ${SEARCH_ADMIN_KEY}" \
  "${SEARCH_URL}/indexes/evidence/docs/\$count?api-version=${API_VERSION}")
echo "Document count: ${COUNT}"
if [[ "$COUNT" == "3" ]]; then
  echo "PASS: sanity count == 3"
else
  echo "FAIL: expected 3, got ${COUNT}"
  exit 1
fi
