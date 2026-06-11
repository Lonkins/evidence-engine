#!/usr/bin/env bash
# Stage 6 — index 15-document gallery case corpus into live 'evidence' index.
# Converts evidence-engine/corpus/*.md into search documents with schema:
#   {id, case_id:"gallery", doc_title, doc_type, content}
# Titles extracted from first H1; types from filename slug; bodies → content.
# DECISION: Delete 3 existing spike docs (case-001/002/003) to keep index focused.
# COST: $0 — 15 markdown docs ≈ <100KB, well under free-tier 50MB cap.
# Writes responses to output/06-corpus-delete.json, output/06-corpus-upload.json.
# Verifies with $count and runs sanity semantic query.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/common.sh"

CORPUS_DIR="$SCRIPT_DIR/../evidence-engine/corpus"
INDEX_NAME="evidence"
API_VERSION="2026-05-01-preview"

echo "[stage-6] Indexing 15-document gallery case corpus..."
echo ""

# ── Step 1: Delete existing spike docs ────────────────────────────────────────
echo "[stage-6] DECISION: Deleting 3 existing spike docs (case-001/002/003) to focus index on gallery case."
SPIKE_IDS=("case-001" "case-002" "case-003")
for doc_id in "${SPIKE_IDS[@]}"; do
  DELETE_DOC=$(cat <<EOF
{
  "value": [
    {
      "@search.action": "delete",
      "id": "$doc_id"
    }
  ]
}
EOF
)
  DELETE_STATUS=$(echo "$DELETE_DOC" | curl -s \
    -X POST \
    "${SEARCH_URL}/indexes/${INDEX_NAME}/docs/index?api-version=${API_VERSION}" \
    -H "Content-Type: application/json" \
    -H "api-key: ${SEARCH_ADMIN_KEY}" \
    -d @- \
    -w "%{http_code}" \
    -o /dev/null)
  echo "  [delete] $doc_id : HTTP ${DELETE_STATUS}"
done
echo ""

# ── Step 2: Build documents from corpus/*.md ──────────────────────────────────
echo "[stage-6] Building documents from corpus/*.md..."

# Create temporary file for upload payload
TEMP_PAYLOAD=$(mktemp)
trap "rm -f $TEMP_PAYLOAD" EXIT

# Start JSON array
echo '{"value": [' > "$TEMP_PAYLOAD"

FIRST=true
FILE_COUNT=0

# Process each markdown file in order
for filepath in $(find "$CORPUS_DIR" -maxdepth 1 -name '[0-9][0-9]-*.md' -type f | sort); do
  filename=$(basename "$filepath")

  # Extract number and slug from filename (e.g., 01-case-overview.md → 01, case-overview)
  number="${filename%%-*}"
  slug="${filename#[0-9][0-9]-}"
  slug="${slug%.md}"

  # Extract title from first H1 heading
  title=$(grep -m1 '^# ' "$filepath" | sed 's/^# //' || echo "Document $number")

  # Read entire file content
  content=$(cat "$filepath")

  # Build document object
  doc_id="gallery-$(printf '%03d' "${number//[^0-9]/}")"

  # Append to JSON (with comma handling)
  if [[ "$FIRST" == true ]]; then
    FIRST=false
  else
    echo "," >> "$TEMP_PAYLOAD"
  fi

  cat >> "$TEMP_PAYLOAD" <<EOF
{
  "@search.action": "mergeOrUpload",
  "id": "$doc_id",
  "case_id": "gallery",
  "doc_title": $(echo -n "$title" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'),
  "doc_type": "$(echo "$slug" | tr '-' '_')",
  "content": $(echo -n "$content" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')
}
EOF

  FILE_COUNT=$((FILE_COUNT + 1))
  echo "  [$FILE_COUNT/15] $filename → $doc_id"
done

# Close JSON array
echo "" >> "$TEMP_PAYLOAD"
echo "]}
" >> "$TEMP_PAYLOAD"

echo ""
echo "[stage-6] Uploading $FILE_COUNT documents via mergeOrUpload..."

UPLOAD_STATUS=$(curl -s \
  -X POST \
  "${SEARCH_URL}/indexes/${INDEX_NAME}/docs/index?api-version=${API_VERSION}" \
  -H "Content-Type: application/json" \
  -H "api-key: ${SEARCH_ADMIN_KEY}" \
  --data-binary @"$TEMP_PAYLOAD" \
  -o "${OUT_DIR}/06-corpus-upload.json" \
  -w "%{http_code}")

echo "[stage-6] Upload HTTP status: ${UPLOAD_STATUS}"

if [[ ! "${UPLOAD_STATUS}" =~ ^2 ]]; then
  echo "FAIL: stage 6 — upload returned HTTP ${UPLOAD_STATUS}"
  echo "--- response ---"
  cat "${OUT_DIR}/06-corpus-upload.json"
  exit 1
fi

# Pretty-print response
echo "Upload response (first 50 lines):"
cat "${OUT_DIR}/06-corpus-upload.json" | python3 -m json.tool 2>/dev/null | head -50 || cat "${OUT_DIR}/06-corpus-upload.json" | head -50

echo ""

# ── Step 3: Verify with $count ─────────────────────────────────────────────────
echo "[stage-6] Verifying doc count..."

COUNT_RESULT=$(curl -s \
  -X GET \
  "${SEARCH_URL}/indexes/${INDEX_NAME}/docs/\$count?api-version=${API_VERSION}" \
  -H "api-key: ${SEARCH_ADMIN_KEY}" \
  -w "\n%{http_code}")

COUNT_STATUS="${COUNT_RESULT##*$'\n'}"
COUNT_BODY="${COUNT_RESULT%$'\n'*}"

echo "[stage-6] Count HTTP status: ${COUNT_STATUS}"
echo "Total docs in index: ${COUNT_BODY}"

if [[ ! "${COUNT_STATUS}" =~ ^2 ]]; then
  echo "WARN: stage 6 — count query returned HTTP ${COUNT_STATUS}"
fi

echo ""

# ── Step 4: Sanity semantic query (gallery case, first doc) ───────────────────
echo "[stage-6] Running sanity semantic query (gallery case)..."

SANITY_QUERY=$(cat <<'EOF'
{
  "search": "Victor Holt gallery death investigation",
  "select": "id,doc_title,case_id",
  "top": 3,
  "semanticConfiguration": "evidence-semantic",
  "semantic": {
    "answers": {
      "answerType": "extractive",
      "count": 1
    },
    "captions": {
      "captionType": "extractive"
    },
    "rankingRerankThreshold": 1
  }
}
EOF
)

QUERY_STATUS=$(echo "$SANITY_QUERY" | curl -s \
  -X POST \
  "${SEARCH_URL}/indexes/${INDEX_NAME}/docs/search?api-version=${API_VERSION}" \
  -H "Content-Type: application/json" \
  -H "api-key: ${SEARCH_ADMIN_KEY}" \
  -d @- \
  -o "${OUT_DIR}/06-sanity-query.json" \
  -w "%{http_code}")

echo "[stage-6] Query HTTP status: ${QUERY_STATUS}"
echo "Query response (first 60 lines):"
cat "${OUT_DIR}/06-sanity-query.json" | python3 -m json.tool 2>/dev/null | head -60 || cat "${OUT_DIR}/06-sanity-query.json" | head -60

echo ""

# ── Summary ────────────────────────────────────────────────────────────────────
echo "PASS: stage 6 — 15-document gallery case corpus indexed"
echo "  Spike docs deleted: 3 (case-001/002/003)"
echo "  Gallery docs uploaded: ${FILE_COUNT}"
echo "  Current index size: ${COUNT_BODY} documents"
echo "  Sanity query status: HTTP ${QUERY_STATUS}"
echo "  Outputs:"
echo "    output/06-corpus-upload.json (upload response)"
echo "    output/06-sanity-query.json (semantic query result)"
echo ""
echo "NEXT: Use the live KB endpoint for game building"
echo "  KB path: https://${SEARCH_SERVICE_NAME}.search.windows.net/knowledgebases/evidence-kb"
echo "  MCP endpoint: https://${SEARCH_SERVICE_NAME}.search.windows.net/knowledgebases/evidence-kb/mcp"
