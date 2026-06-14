#!/usr/bin/env bash
# One-shot verification: confirm sku=free, status=running
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
set -a; source "$SCRIPT_DIR/.env"; set +a
az search service show \
  --name "${SEARCH_SERVICE_NAME:-evidence-engine-search}" \
  --resource-group "${SEARCH_RESOURCE_GROUP:-evidence-engine-rg}" \
  --query "{sku:sku.name,status:status}" \
  -o json
