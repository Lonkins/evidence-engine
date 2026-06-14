#!/usr/bin/env bash
# Stage 7 — Live Interrogation index migration.
# Adds partition fields to the existing 'evidence' index (additive, $0, no rebuild):
#   doc_type   Edm.String  filterable   — 'evidence' | 'testimony'
#   case_id    Edm.String  filterable   — 'gallery'
#   session_id Edm.String  filterable   — live session UUID (testimony only)
#   speaker    Edm.String  filterable   — suspect name (testimony only)
#   turn_no    Edm.Int32   filterable   — chat turn number (testimony only)
# Then backfills doc_type='evidence', case_id='gallery' on the 15 corpus docs
# via mergeOrUpload (existing fields untouched).
#
# COST: $0 — additive schema update + 15 tiny merges, free tier.
# TEARDOWN: testimony docs are deleted per-session by the live-server /api/reset
#   (filter: doc_type eq 'testimony' and session_id eq '<id>'). The added fields
#   are inert if live mode is abandoned; full teardown remains
#   `az group delete --name evidence-engine-rg`.
# Writes responses to output/07-schema-update.json, output/07-backfill.json.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
OUT_DIR="$SCRIPT_DIR/output"
mkdir -p "$OUT_DIR"

set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

SEARCH_URL="https://${SEARCH_SERVICE_NAME}.search.windows.net"
API_VERSION="2026-05-01-preview"
INDEX_NAME="evidence"

# ── Step 1: fetch current schema, append new fields if missing ────────────────
echo "[stage-7] Fetching current index schema..."
curl -sf "${SEARCH_URL}/indexes/${INDEX_NAME}?api-version=${API_VERSION}" \
  -H "api-key: ${SEARCH_ADMIN_KEY}" > "${OUT_DIR}/07-schema-current.json"

python3 - "$OUT_DIR/07-schema-current.json" "$OUT_DIR/07-schema-new.json" <<'PY'
import json, sys

with open(sys.argv[1]) as f:
    index = json.load(f)

# Strip read-only / odata noise that PUT rejects
for key in list(index.keys()):
    if key.startswith("@odata"):
        del index[key]

existing = {f["name"] for f in index["fields"]}
new_fields = [
    {"name": "doc_type",   "type": "Edm.String", "searchable": False, "filterable": True,  "sortable": False, "facetable": True},
    {"name": "case_id",    "type": "Edm.String", "searchable": False, "filterable": True,  "sortable": False, "facetable": True},
    {"name": "session_id", "type": "Edm.String", "searchable": False, "filterable": True,  "sortable": False, "facetable": False},
    {"name": "speaker",    "type": "Edm.String", "searchable": False, "filterable": True,  "sortable": False, "facetable": True},
    {"name": "turn_no",    "type": "Edm.Int32",  "searchable": False, "filterable": True,  "sortable": True,  "facetable": False},
]
added = [f["name"] for f in new_fields if f["name"] not in existing]
index["fields"].extend(f for f in new_fields if f["name"] not in existing)

with open(sys.argv[2], "w") as f:
    json.dump(index, f)

print(f"  fields to add: {added or 'none (already present)'}")
PY

echo "[stage-7] Updating index schema (additive)..."
STATUS=$(curl -s -X PUT \
  "${SEARCH_URL}/indexes/${INDEX_NAME}?api-version=${API_VERSION}" \
  -H "Content-Type: application/json" \
  -H "api-key: ${SEARCH_ADMIN_KEY}" \
  -d @"${OUT_DIR}/07-schema-new.json" \
  -o "${OUT_DIR}/07-schema-update.json" \
  -w "%{http_code}")
echo "[stage-7] Schema update HTTP status: ${STATUS}"
if [[ ! "${STATUS}" =~ ^2 ]]; then
  echo "FAIL: stage 7 — schema update returned HTTP ${STATUS}"
  cat "${OUT_DIR}/07-schema-update.json"
  exit 1
fi

# ── Step 2: backfill doc_type/case_id on the 15 evidence docs ─────────────────
echo "[stage-7] Backfilling doc_type='evidence' on gallery-01..gallery-15..."
PAYLOAD='{"value":['
for i in $(seq -w 1 15); do
  [[ "$i" != "01" ]] && PAYLOAD+=','
  PAYLOAD+="{\"@search.action\":\"mergeOrUpload\",\"id\":\"gallery-${i}\",\"doc_type\":\"evidence\",\"case_id\":\"gallery\"}"
done
PAYLOAD+=']}'

STATUS=$(echo "$PAYLOAD" | curl -s -X POST \
  "${SEARCH_URL}/indexes/${INDEX_NAME}/docs/index?api-version=${API_VERSION}" \
  -H "Content-Type: application/json" \
  -H "api-key: ${SEARCH_ADMIN_KEY}" \
  -d @- \
  -o "${OUT_DIR}/07-backfill.json" \
  -w "%{http_code}")
echo "[stage-7] Backfill HTTP status: ${STATUS}"
if [[ ! "${STATUS}" =~ ^2 ]]; then
  echo "FAIL: stage 7 — backfill returned HTTP ${STATUS}"
  cat "${OUT_DIR}/07-backfill.json"
  exit 1
fi

# ── Step 3: verify partition filter works ─────────────────────────────────────
echo "[stage-7] Verifying doc_type filter..."
COUNT=$(curl -sf \
  "${SEARCH_URL}/indexes/${INDEX_NAME}/docs/search?api-version=${API_VERSION}" \
  -H "Content-Type: application/json" \
  -H "api-key: ${SEARCH_ADMIN_KEY}" \
  -d '{"search":"*","filter":"doc_type eq '\''evidence'\''","count":true,"top":0}' \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['@odata.count'])")
echo "  docs with doc_type='evidence': ${COUNT}"

if [[ "$COUNT" != "15" ]]; then
  echo "FAIL: stage 7 — expected 15 evidence docs, got ${COUNT}"
  exit 1
fi

echo ""
echo "PASS: stage 7 — partition fields live, 15 evidence docs backfilled"
