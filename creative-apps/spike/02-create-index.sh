#!/usr/bin/env bash
# Stage 2 — create 'evidence' index (semantic config 'evidence-semantic') and
# upload 3 synthetic case documents from test-docs/documents.json.
# COST: $0 — stays within free-tier limits (3 indexes, 50 MB).
# Writes API responses to output/02-index-create.json and output/02-docs-upload.json.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
OUTPUT_DIR="$SCRIPT_DIR/output"

# Load .env
if [[ ! -f "$ENV_FILE" ]]; then
  echo "FAIL: stage 2 — $ENV_FILE not found. Run stage 1 first."
  exit 1
fi
set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

mkdir -p "$OUTPUT_DIR"

SEARCH_URL="https://${SEARCH_SERVICE_NAME}.search.windows.net"
API_VERSION="2026-05-01-preview"
INDEX_NAME="evidence"
SCHEMA_FILE="$SCRIPT_DIR/test-docs/index-schema.json"
DOCS_FILE="$SCRIPT_DIR/test-docs/documents.json"

# ── Step 1: create / replace the index ────────────────────────────────────────
echo "[stage-2] Creating index '${INDEX_NAME}' with semantic config 'evidence-semantic'..."

INDEX_STATUS=$(curl -s \
  -X PUT \
  "${SEARCH_URL}/indexes/${INDEX_NAME}?api-version=${API_VERSION}" \
  -H "Content-Type: application/json" \
  -H "api-key: ${SEARCH_ADMIN_KEY}" \
  -d @"${SCHEMA_FILE}" \
  -o "${OUTPUT_DIR}/02-index-create.json" \
  -w "%{http_code}")

echo "[stage-2] Index create HTTP status: ${INDEX_STATUS}"

if [[ ! "${INDEX_STATUS}" =~ ^2 ]]; then
  echo "FAIL: stage 2 — index creation returned HTTP ${INDEX_STATUS}"
  echo "--- response ---"
  cat "${OUTPUT_DIR}/02-index-create.json"
  exit 1
fi

# ── Step 2: upload 3 case documents ───────────────────────────────────────────
echo "[stage-2] Uploading documents from test-docs/documents.json..."

DOCS_STATUS=$(curl -s \
  -X POST \
  "${SEARCH_URL}/indexes/${INDEX_NAME}/docs/index?api-version=${API_VERSION}" \
  -H "Content-Type: application/json" \
  -H "api-key: ${SEARCH_ADMIN_KEY}" \
  -d @"${DOCS_FILE}" \
  -o "${OUTPUT_DIR}/02-docs-upload.json" \
  -w "%{http_code}")

echo "[stage-2] Docs upload HTTP status: ${DOCS_STATUS}"

if [[ ! "${DOCS_STATUS}" =~ ^2 ]]; then
  echo "FAIL: stage 2 — docs upload returned HTTP ${DOCS_STATUS}"
  echo "--- response ---"
  cat "${OUTPUT_DIR}/02-docs-upload.json"
  exit 1
fi

echo ""
echo "PASS: stage 2 — index '${INDEX_NAME}' created with semantic config 'evidence-semantic'"
echo "  Index create : HTTP ${INDEX_STATUS}"
echo "  Docs upload  : HTTP ${DOCS_STATUS}"
echo "  Schema output: output/02-index-create.json"
echo "  Upload output: output/02-docs-upload.json"
echo ""
echo "Sanity check (read-only, \$0):"
echo "  SEARCH_URL=${SEARCH_URL}"
echo "  curl -s -H 'api-key: \$SEARCH_ADMIN_KEY' \\"
echo "    \"${SEARCH_URL}/indexes/${INDEX_NAME}/docs/\\\$count?api-version=${API_VERSION}\""
