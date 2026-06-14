#!/usr/bin/env bash
# Stage 3 — create knowledge source 'evidence-ks' (kind: searchIndex) and
# knowledge base 'evidence-kb' (outputMode: extractiveData, retrievalReasoningEffort.kind: minimal).
# NO models array — keeps this LLM-free, $0 cost, no Azure OpenAI dependency.
#
# API shapes confirmed against 2026-05-01-preview OData $metadata:
#   - KnowledgeSource: searchIndexParameters.searchIndexName (not indexName at root)
#   - KnowledgeBase.outputMode enum: "extractiveData" | "answerSynthesis"
#     (NOT "extractedData" — that value does not exist in this API version)
#   - KnowledgeBase.retrievalReasoningEffort: { "kind": "minimal" | "low" | "medium" }
#     (complex type, not a bare string; "low"/"medium" require a model — "minimal" is LLM-free)
#   - KnowledgeBase.knowledgeSources[].name references the knowledge source by name
#
# Writes API responses to output/03-ks-create.json, output/03-kb-create.json,
# and output/03-kb-list.json.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
OUTPUT_DIR="$SCRIPT_DIR/output"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "FAIL: stage 3 — $ENV_FILE not found. Run stage 1 first."
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
KS_NAME="evidence-ks"
KB_NAME="evidence-kb"

# ── Step 1: create / upsert knowledge source ──────────────────────────────────
echo "[stage-3] Creating knowledge source '${KS_NAME}' (kind: searchIndex → index: ${INDEX_NAME})..."

KS_STATUS=$(curl -s \
  -X PUT \
  "${SEARCH_URL}/knowledgesources/${KS_NAME}?api-version=${API_VERSION}" \
  -H "Content-Type: application/json" \
  -H "api-key: ${SEARCH_ADMIN_KEY}" \
  -d "{
    \"name\": \"${KS_NAME}\",
    \"kind\": \"searchIndex\",
    \"searchIndexParameters\": {
      \"searchIndexName\": \"${INDEX_NAME}\"
    }
  }" \
  -o "${OUTPUT_DIR}/03-ks-create.json" \
  -w "%{http_code}")

echo "[stage-3] Knowledge source create HTTP status: ${KS_STATUS}"

if [[ ! "${KS_STATUS}" =~ ^2 ]]; then
  echo "FAIL: stage 3 — knowledge source creation returned HTTP ${KS_STATUS}"
  echo "--- response (check output/03-ks-create.json) ---"
  cat "${OUTPUT_DIR}/03-ks-create.json"
  exit 1
fi

# ── Step 2: create / upsert knowledge base (LLM-free — no models array) ───────
# outputMode "extractiveData" returns raw indexed content without LLM synthesis.
# retrievalReasoningEffort kind "minimal" is the only level that works without a model.
echo "[stage-3] Creating knowledge base '${KB_NAME}' (outputMode: extractiveData, effort: minimal)..."

KB_STATUS=$(curl -s \
  -X PUT \
  "${SEARCH_URL}/knowledgebases/${KB_NAME}?api-version=${API_VERSION}" \
  -H "Content-Type: application/json" \
  -H "api-key: ${SEARCH_ADMIN_KEY}" \
  -d "{
    \"name\": \"${KB_NAME}\",
    \"outputMode\": \"extractiveData\",
    \"retrievalReasoningEffort\": { \"kind\": \"minimal\" },
    \"knowledgeSources\": [
      { \"name\": \"${KS_NAME}\" }
    ]
  }" \
  -o "${OUTPUT_DIR}/03-kb-create.json" \
  -w "%{http_code}")

echo "[stage-3] Knowledge base create HTTP status: ${KB_STATUS}"

if [[ ! "${KB_STATUS}" =~ ^2 ]]; then
  echo "FAIL: stage 3 — knowledge base creation returned HTTP ${KB_STATUS}"
  echo "--- response (check output/03-kb-create.json) ---"
  cat "${OUTPUT_DIR}/03-kb-create.json"
  exit 1
fi

# ── Step 3: verify knowledge base is listed ────────────────────────────────────
echo "[stage-3] Verifying '${KB_NAME}' appears in GET /knowledgebases..."

LIST_STATUS=$(curl -s \
  "${SEARCH_URL}/knowledgebases?api-version=${API_VERSION}&\$select=name" \
  -H "api-key: ${SEARCH_ADMIN_KEY}" \
  -o "${OUTPUT_DIR}/03-kb-list.json" \
  -w "%{http_code}")

echo "[stage-3] Knowledge bases list HTTP status: ${LIST_STATUS}"

if [[ ! "${LIST_STATUS}" =~ ^2 ]]; then
  echo "FAIL: stage 3 — GET /knowledgebases returned HTTP ${LIST_STATUS}"
  cat "${OUTPUT_DIR}/03-kb-list.json"
  exit 1
fi

if ! grep -q "\"${KB_NAME}\"" "${OUTPUT_DIR}/03-kb-list.json"; then
  echo "FAIL: stage 3 — '${KB_NAME}' not found in GET /knowledgebases response"
  cat "${OUTPUT_DIR}/03-kb-list.json"
  exit 1
fi

echo ""
echo "PASS: stage 3 — knowledge source + knowledge base created (LLM-free)"
echo "  Knowledge source : ${KS_NAME} (kind: searchIndex → ${INDEX_NAME})"
echo "  Knowledge base   : ${KB_NAME} (outputMode: extractiveData, effort.kind: minimal)"
echo "  KS output        : output/03-ks-create.json  [HTTP ${KS_STATUS}]"
echo "  KB output        : output/03-kb-create.json  [HTTP ${KB_STATUS}]"
echo "  List output      : output/03-kb-list.json    [HTTP ${LIST_STATUS}]"
echo ""
echo "API version used: ${API_VERSION}"
