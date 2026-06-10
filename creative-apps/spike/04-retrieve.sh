#!/usr/bin/env bash
# Stage 4 — verify agentic retrieval (knowledge base) on free tier.
#
# Tests two request shapes in order:
#   Shape A — preview 'messages' format:  {"messages":[{"role":"user","content":"..."}]}
#   Shape B — GA 'intents' format:        {"intents":[{"text":"..."}]}
#
# PASS criteria: HTTP 200 + response.references[] contains at least one object with "docKey".
# COST: $0 — consumes free-tier monthly token allowance only.
#        DO NOT enable standard-plan billing.
#
# Writes:
#   output/04-retrieve-incorpus.json      — in-corpus response (winning shape)
#   output/04-retrieve-outcorpus.json     — out-of-corpus response (winning shape)
#   output/04-retrieve-incorpus-alt.json  — in-corpus with the other shape (for record)
#   output/04-retrieve-shape-a-incorpus.json  — raw shape A response
#   output/04-retrieve-shape-b-incorpus.json  — raw shape B response (if tried)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
OUTPUT_DIR="$SCRIPT_DIR/output"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "FAIL: stage 4 — $ENV_FILE not found. Run stage 1 first."
  exit 1
fi
set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

mkdir -p "$OUTPUT_DIR"

SEARCH_URL="https://${SEARCH_SERVICE_NAME}.search.windows.net"
API_VERSION="2026-05-01-preview"
KB_NAME="evidence-kb"

# In-corpus: matches content in all 3 indexed documents (bug density from case-001)
IN_CORPUS_Q="What percentage reduction in bug density was found from AI-assisted development tools?"
# Out-of-corpus: unrelated to anything indexed
OUT_CORPUS_Q="What is the recommended daily intake of vitamin C for adults?"

echo "[stage-4] KB: ${KB_NAME}  API: ${API_VERSION}"
echo "[stage-4] Endpoint: ${SEARCH_URL}/knowledgebases/${KB_NAME}/retrieve"
echo "[stage-4] In-corpus query : ${IN_CORPUS_Q}"
echo ""

# ── Helper: does the response JSON have references[].docKey? ──────────────────
has_references_with_doc_key() {
  local file="$1"
  if command -v jq &>/dev/null; then
    local count
    count=$(jq '(.references // []) | map(select(has("docKey"))) | length' "$file" 2>/dev/null || echo 0)
    [[ "$count" -gt 0 ]]
  else
    # fallback if jq not installed
    grep -q '"references"' "$file" && grep -q '"docKey"' "$file"
  fi
}

count_doc_keys() {
  local file="$1"
  if command -v jq &>/dev/null; then
    jq '(.references // []) | map(select(has("docKey"))) | length' "$file" 2>/dev/null || echo "unknown"
  else
    echo "unknown (jq not installed)"
  fi
}

# ── Shape A: messages (preview conversational format) ─────────────────────────
# Per $metadata: AgentRetrievalMessage.content is Collection(AgentRetrievalMessageContent)
# AgentRetrievalMessageContent has: type (required), text, image
echo "[stage-4] Shape A (messages) — in-corpus..."
SHAPE_A_HTTP=$(curl -s \
  -X POST \
  "${SEARCH_URL}/knowledgebases/${KB_NAME}/retrieve?api-version=${API_VERSION}" \
  -H "Content-Type: application/json" \
  -H "api-key: ${SEARCH_ADMIN_KEY}" \
  -d "{\"messages\":[{\"role\":\"user\",\"content\":[{\"type\":\"text\",\"text\":\"${IN_CORPUS_Q}\"}]}]}" \
  -o "${OUTPUT_DIR}/04-retrieve-shape-a-incorpus.json" \
  -w "%{http_code}")
echo "[stage-4] Shape A HTTP: ${SHAPE_A_HTTP}"

WINNING_SHAPE=""

if [[ "${SHAPE_A_HTTP}" == "200" ]] && has_references_with_doc_key "${OUTPUT_DIR}/04-retrieve-shape-a-incorpus.json"; then
  echo "[stage-4] Shape A PASS — references[].docKey found"
  WINNING_SHAPE="messages"
  cp "${OUTPUT_DIR}/04-retrieve-shape-a-incorpus.json" "${OUTPUT_DIR}/04-retrieve-incorpus.json"
else
  echo "[stage-4] Shape A did not satisfy PASS. Response:"
  cat "${OUTPUT_DIR}/04-retrieve-shape-a-incorpus.json"
  echo ""

  # ── Shape B: intents (GA / structured format) ───────────────────────────────
  # Per $metadata: AgentRetrievalIntent has "type" (required) + "search" (not "text")
  echo "[stage-4] Shape B (intents) — in-corpus..."
  SHAPE_B_HTTP=$(curl -s \
    -X POST \
    "${SEARCH_URL}/knowledgebases/${KB_NAME}/retrieve?api-version=${API_VERSION}" \
    -H "Content-Type: application/json" \
    -H "api-key: ${SEARCH_ADMIN_KEY}" \
    -d "{\"intents\":[{\"type\":\"semantic\",\"search\":\"${IN_CORPUS_Q}\"}]}" \
    -o "${OUTPUT_DIR}/04-retrieve-shape-b-incorpus.json" \
    -w "%{http_code}")
  echo "[stage-4] Shape B HTTP: ${SHAPE_B_HTTP}"

  if [[ "${SHAPE_B_HTTP}" == "200" ]] && has_references_with_doc_key "${OUTPUT_DIR}/04-retrieve-shape-b-incorpus.json"; then
    echo "[stage-4] Shape B PASS — references[].docKey found"
    WINNING_SHAPE="intents"
    cp "${OUTPUT_DIR}/04-retrieve-shape-b-incorpus.json" "${OUTPUT_DIR}/04-retrieve-incorpus.json"
    cp "${OUTPUT_DIR}/04-retrieve-shape-a-incorpus.json" "${OUTPUT_DIR}/04-retrieve-incorpus-alt.json"
  else
    echo "[stage-4] Shape B did not satisfy PASS. Response:"
    cat "${OUTPUT_DIR}/04-retrieve-shape-b-incorpus.json"
    echo ""
    echo "FAIL: stage 4 — neither shape returned HTTP 200 with references[].docKey"
    echo "  Shape A (messages) HTTP: ${SHAPE_A_HTTP}"
    echo "  Shape B (intents)  HTTP: ${SHAPE_B_HTTP}"
    echo "  If the error indicates a tier limit (semantic ranker / IQ feature not available"
    echo "  on free tier), this is the expected FAIL — mark ❌ in HANDOFF.md and escalate."
    echo "  Raw responses saved to output/04-retrieve-shape-*.json"
    exit 1
  fi
fi

# ── Out-of-corpus query (winning shape) ──────────────────────────────────────
echo ""
echo "[stage-4] Out-of-corpus query: ${OUT_CORPUS_Q}"

if [[ "${WINNING_SHAPE}" == "messages" ]]; then
  OOC_BODY="{\"messages\":[{\"role\":\"user\",\"content\":[{\"type\":\"text\",\"text\":\"${OUT_CORPUS_Q}\"}]}]}"
else
  OOC_BODY="{\"intents\":[{\"type\":\"semantic\",\"search\":\"${OUT_CORPUS_Q}\"}]}"
fi

OOC_HTTP=$(curl -s \
  -X POST \
  "${SEARCH_URL}/knowledgebases/${KB_NAME}/retrieve?api-version=${API_VERSION}" \
  -H "Content-Type: application/json" \
  -H "api-key: ${SEARCH_ADMIN_KEY}" \
  -d "${OOC_BODY}" \
  -o "${OUTPUT_DIR}/04-retrieve-outcorpus.json" \
  -w "%{http_code}")

echo "[stage-4] Out-of-corpus HTTP: ${OOC_HTTP}"

OOC_REF_COUNT=$(count_doc_keys "${OUTPUT_DIR}/04-retrieve-outcorpus.json")
echo "[stage-4] Out-of-corpus docKey count: ${OOC_REF_COUNT}"

IN_CORPUS_COUNT=$(count_doc_keys "${OUTPUT_DIR}/04-retrieve-incorpus.json")

echo ""
echo "────────────────────────────────────────────────────────────────"
echo "PASS: stage 4 — agentic retrieval working on free tier"
echo "  Winning shape         : ${WINNING_SHAPE}"
echo "  API version           : ${API_VERSION}"
echo "  In-corpus docKey count: ${IN_CORPUS_COUNT}"
echo "  Out-corpus docKey cnt : ${OOC_REF_COUNT}"
echo "  In-corpus output      : output/04-retrieve-incorpus.json  [HTTP 200]"
echo "  Out-corpus output     : output/04-retrieve-outcorpus.json [HTTP ${OOC_HTTP}]"
echo "────────────────────────────────────────────────────────────────"
