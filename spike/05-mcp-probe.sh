#!/usr/bin/env bash
# Stage 5 — probe the knowledge base's built-in MCP endpoint.
#
# Sends an MCP initialize request (JSON-RPC 2.0) to the Azure AI Search
# native MCP endpoint, authenticated via api-key header.
#
# Two candidate paths are tried in order:
#   1. /mcp                           — service-level MCP endpoint
#   2. /knowledgebases/{name}/mcp     — KB-scoped MCP endpoint
#
# PASS: any 2xx response on either path.
# Non-2xx: recorded verbatim; NOT fatal (project ships its own MCP server).
#
# On PASS, prints the suggested mcp.json block for Copilot.
# COST: $0 — read-only endpoint probe.
#
# Writes:
#   output/05-mcp-service-level.json   — response from /mcp
#   output/05-mcp-kb-scoped.json       — response from /knowledgebases/{name}/mcp
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
OUTPUT_DIR="$SCRIPT_DIR/output"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "FAIL: stage 5 — $ENV_FILE not found. Run stage 1 first."
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

# Standard MCP initialize request (JSON-RPC 2.0, MCP spec 2024-11-05)
MCP_INIT_BODY='{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {
      "name": "evidence-engine-spike",
      "version": "0.1.0"
    }
  }
}'

echo "[stage-5] Service: ${SEARCH_SERVICE_NAME}"
echo "[stage-5] Probing built-in MCP endpoint with api-key auth"
echo ""

# ── Probe 1: service-level /mcp ───────────────────────────────────────────────
PROBE1_URL="${SEARCH_URL}/mcp?api-version=${API_VERSION}"
echo "[stage-5] Probe 1 — service-level: ${PROBE1_URL}"

PROBE1_HTTP=$(curl -s \
  -X POST \
  "$PROBE1_URL" \
  -H "Content-Type: application/json" \
  -H "api-key: ${SEARCH_ADMIN_KEY}" \
  -d "$MCP_INIT_BODY" \
  -o "${OUTPUT_DIR}/05-mcp-service-level.json" \
  -w "%{http_code}")

echo "[stage-5] Probe 1 HTTP: ${PROBE1_HTTP}"

# ── Probe 2: KB-scoped /knowledgebases/{name}/mcp ─────────────────────────────
PROBE2_URL="${SEARCH_URL}/knowledgebases/${KB_NAME}/mcp?api-version=${API_VERSION}"
echo "[stage-5] Probe 2 — KB-scoped: ${PROBE2_URL}"

PROBE2_HTTP=$(curl -s \
  -X POST \
  "$PROBE2_URL" \
  -H "Content-Type: application/json" \
  -H "api-key: ${SEARCH_ADMIN_KEY}" \
  -d "$MCP_INIT_BODY" \
  -o "${OUTPUT_DIR}/05-mcp-kb-scoped.json" \
  -w "%{http_code}")

echo "[stage-5] Probe 2 HTTP: ${PROBE2_HTTP}"
echo ""

# ── Suggested mcp.json block for Copilot ─────────────────────────────────────
MCP_JSON_BLOCK=$(cat <<EOF
{
  "servers": {
    "evidence-engine": {
      "url": "https://${SEARCH_SERVICE_NAME}.search.windows.net/mcp",
      "type": "http",
      "headers": {
        "api-key": "\${AZURE_SEARCH_ADMIN_KEY}"
      }
    }
  }
}
EOF
)

# ── Evaluate results ──────────────────────────────────────────────────────────
echo "────────────────────────────────────────────────────────────────"

LIVE_PATH=""
LIVE_HTTP=""

if [[ "${PROBE1_HTTP}" =~ ^2 ]]; then
  LIVE_PATH="/mcp (service-level)"
  LIVE_HTTP="${PROBE1_HTTP}"
elif [[ "${PROBE2_HTTP}" =~ ^2 ]]; then
  LIVE_PATH="/knowledgebases/${KB_NAME}/mcp (KB-scoped)"
  LIVE_HTTP="${PROBE2_HTTP}"
fi

if [[ -n "$LIVE_PATH" ]]; then
  echo "PASS: stage 5 — KB native MCP endpoint is LIVE"
  echo "  Live path    : ${LIVE_PATH}"
  echo "  HTTP status  : ${LIVE_HTTP}"
  echo "  Auth variant : api-key header"
  echo ""
  echo "  Suggested mcp.json block for Copilot:"
  echo ""
  echo "$MCP_JSON_BLOCK"
  echo ""
  echo "  Save the above block to .vscode/mcp.json (or ~/.config/mcp.json)"
  echo "  and set AZURE_SEARCH_ADMIN_KEY in your environment."
else
  echo "INFO: stage 5 — MCP endpoint not 2xx on either path (NOT fatal)"
  echo "  Probe 1 (/mcp)                           HTTP: ${PROBE1_HTTP}"
  echo "  Probe 2 (/knowledgebases/{name}/mcp)     HTTP: ${PROBE2_HTTP}"
  echo ""
  echo "  Probe 1 response body:"
  cat "${OUTPUT_DIR}/05-mcp-service-level.json" 2>/dev/null || echo "  (no body)"
  echo ""
  echo "  Probe 2 response body:"
  cat "${OUTPUT_DIR}/05-mcp-kb-scoped.json" 2>/dev/null || echo "  (no body)"
  echo ""
  echo "  The project ships its own MCP server — this path is not required."
  echo "  Auth variant tried: api-key header"
fi
echo "────────────────────────────────────────────────────────────────"
