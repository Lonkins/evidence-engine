#!/usr/bin/env bash
# Stage 8 — Answer-synthesis provisioning spike (design-log Entry 4, roadmap B0).
#
# THE hard dependency for "Best Use of IQ Tools": make Foundry IQ itself produce
# the verdict. Until now evidence-kb was LLM-free (outputMode: extractiveData,
# effort: minimal) so a deterministic cross-check had to decide. This stage:
#
#   1. Binds an Azure OpenAI chat deployment to evidence-kb (Agent.models[]) and
#      PUTs the KB with outputMode: answerSynthesis + retrievalReasoningEffort
#      medium — the IQ-brain configuration.
#   2. POSTs /retrieve with a `messages` verdict-shaped prompt (the same shape
#      live-server's kbReason() sends) against the doc_type eq 'evidence'
#      partition, at medium effort.
#   3. Captures the raw response and reports: does the synthesised answer carry a
#      parseable VERDICT / PASSAGE / WHY, and do references[] come back?
#
# Schemas confirmed against 2026-05-01-preview OData $metadata (output/08-metadata.xml):
#   - Agent.models: Collection(AgentModelConfiguration)
#   - AgentModelConfiguration: { kind, azureOpenAIParameters }
#   - AzureOpenAIParameters: { resourceUri, deploymentId, apiKey, modelName, authIdentity }
#   - Agent.outputMode: AgentOutputModality enum { extractiveData | answerSynthesis }
#   - Agent.retrievalReasoningEffort: { kind: minimal | low | medium }
#
# Idempotent: re-running re-PUTs the KB (upsert) and re-issues the retrieve.
# COST: a gpt-4.1-mini Standard deployment + medium-effort synthesis tokens.
# SECURETY: all secrets come from .env (gitignored). The KB PUT request body
# (which contains AOAI_KEY) is NEVER written to disk; saved JSON is scrubbed.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
OUTPUT_DIR="$SCRIPT_DIR/output"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "FAIL: stage 8 — $ENV_FILE not found. Run stage 1 (and recover keys) first."
  exit 1
fi
set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

mkdir -p "$OUTPUT_DIR"

: "${SEARCH_SERVICE_NAME:?missing in .env}"
: "${SEARCH_ADMIN_KEY:?missing in .env}"
: "${AOAI_ENDPOINT:?missing in .env (Azure OpenAI/AIServices resource URI)}"
: "${AOAI_DEPLOYMENT:?missing in .env (chat deployment id)}"
: "${AOAI_MODEL_NAME:?missing in .env (model name)}"
: "${AOAI_KEY:?missing in .env (AIServices api key)}"

SEARCH_URL="https://${SEARCH_SERVICE_NAME}.search.windows.net"
API_VERSION="2026-05-01-preview"
KS_NAME="${AZURE_KNOWLEDGE_SOURCE_NAME:-evidence-ks}"
KB_NAME="${AZURE_KNOWLEDGE_BASE_NAME:-evidence-kb}"
EFFORT="${KB_REASONING_EFFORT:-medium}"
EVIDENCE_FILTER="doc_type eq 'evidence'"

# The claim under test: Helena's planted alibi. The case file contradicts it —
# the security log records her main-door CARD_EXIT at 20:47, not 19:45.
SPEAKER="${SPIKE_SPEAKER:-Helena Voss}"
CLAIM="${SPIKE_CLAIM:-I left the gallery at 19:45.}"

# Verdict instruction — mirrors live-server buildVerdictInstruction(claim, speaker).
read -r -d '' INSTRUCTION <<EOF || true
You are the case-file evidence engine for a detective game.
Assess this claim by the witness ${SPEAKER} strictly against the retrieved case-file passages — never outside knowledge.
Claim: "${CLAIM}"

Answer in exactly this shape:
VERDICT: <SUPPORTED|CONTRADICTED|UNADDRESSED>
PASSAGE: <the single most decisive sentence, copied verbatim from a passage, or NONE>
WHY: <one sentence>

Rules: CONTRADICTED only if a passage states something incompatible with the claim.
SUPPORTED only if a passage affirms it. If the passages do not address the claim,
answer UNADDRESSED — do not guess. "Silent" is UNADDRESSED, not CONTRADICTED.
EOF

# Export everything the inline python helpers read via os.environ.
export OUTPUT_DIR EFFORT KS_NAME KB_NAME EVIDENCE_FILTER INSTRUCTION

echo "[stage-8] KB: ${KB_NAME}  API: ${API_VERSION}  effort: ${EFFORT}"
echo "[stage-8] Binding model: ${AOAI_DEPLOYMENT} (${AOAI_MODEL_NAME}) @ ${AOAI_ENDPOINT}"
echo "[stage-8] Test claim — ${SPEAKER}: \"${CLAIM}\""
echo ""

have_jq() { command -v jq &>/dev/null; }

# ── Step 1: PUT knowledge base with answerSynthesis + bound model ─────────────
# Build the request body with python so the multi-line instruction / secrets are
# encoded safely. Body is piped to curl via stdin and never persisted to disk.
echo "[stage-8] PUT ${KB_NAME} (outputMode: answerSynthesis, model bound)..."
KB_PUT_BODY=$(python3 - <<'PY'
import json, os
body = {
    "name": os.environ.get("AZURE_KNOWLEDGE_BASE_NAME", "evidence-kb"),
    "outputMode": "answerSynthesis",
    "retrievalReasoningEffort": {"kind": os.environ.get("KB_REASONING_EFFORT", "medium")},
    "models": [
        {
            "kind": "azureOpenAI",
            "azureOpenAIParameters": {
                "resourceUri": os.environ["AOAI_ENDPOINT"],
                "deploymentId": os.environ["AOAI_DEPLOYMENT"],
                "modelName": os.environ["AOAI_MODEL_NAME"],
                "apiKey": os.environ["AOAI_KEY"],
            },
        }
    ],
    "knowledgeSources": [{"name": os.environ.get("AZURE_KNOWLEDGE_SOURCE_NAME", "evidence-ks")}],
}
print(json.dumps(body))
PY
)

KB_PUT_STATUS=$(printf '%s' "$KB_PUT_BODY" | curl -s \
  -X PUT \
  "${SEARCH_URL}/knowledgebases/${KB_NAME}?api-version=${API_VERSION}" \
  -H "Content-Type: application/json" \
  -H "api-key: ${SEARCH_ADMIN_KEY}" \
  --data-binary @- \
  -o "${OUTPUT_DIR}/08-kb-put.json" \
  -w "%{http_code}")
unset KB_PUT_BODY
echo "[stage-8] KB PUT HTTP: ${KB_PUT_STATUS}"

if [[ ! "${KB_PUT_STATUS}" =~ ^2 ]]; then
  echo "FAIL: stage 8 — KB PUT returned HTTP ${KB_PUT_STATUS}"
  echo "--- response (output/08-kb-put.json) ---"
  cat "${OUTPUT_DIR}/08-kb-put.json"
  echo ""
  echo "If the error names an invalid model 'kind' or rejects answerSynthesis,"
  echo "read the message — it lists the valid discriminator values."
  exit 1
fi

# ── Step 2: GET the KB back; confirm answerSynthesis + a model is bound ────────
echo "[stage-8] GET ${KB_NAME} to confirm binding..."
curl -s \
  "${SEARCH_URL}/knowledgebases/${KB_NAME}?api-version=${API_VERSION}" \
  -H "api-key: ${SEARCH_ADMIN_KEY}" \
  -o "${OUTPUT_DIR}/08-kb-get.raw.json" \
  -w "" || true

# Scrub any apiKey before persisting (write-only field is normally null, but be safe).
python3 - <<'PY'
import json, os
out = os.path.join(os.environ["OUTPUT_DIR"], "08-kb-get.raw.json")
dst = os.path.join(os.environ["OUTPUT_DIR"], "08-kb-get.json")
try:
    data = json.load(open(out))
except Exception:
    os.replace(out, dst); raise SystemExit(0)
for m in (data.get("models") or []):
    p = m.get("azureOpenAIParameters") or {}
    if p.get("apiKey"):
        p["apiKey"] = "***REDACTED***"
json.dump(data, open(dst, "w"), indent=2)
os.remove(out)
mode = data.get("outputMode")
models = data.get("models") or []
print(f"[stage-8] outputMode={mode}  models bound={len(models)}  "
      f"effort={(data.get('retrievalReasoningEffort') or {}).get('kind')}")
PY

# ── Step 3: retrieve a synthesised verdict (messages shape, medium effort) ────
echo ""
echo "[stage-8] POST /retrieve — verdict synthesis over [${EVIDENCE_FILTER}]..."
RETRIEVE_BODY=$(python3 - <<PY
import json, os
body = {
    "messages": [
        {"role": "user", "content": [{"type": "text", "text": os.environ["INSTRUCTION"]}]}
    ],
    "retrievalReasoningEffort": {"kind": os.environ["EFFORT"]},
    "knowledgeSourceParams": [
        {
            "kind": "searchIndex",
            "knowledgeSourceName": os.environ["KS_NAME"],
            "filterAddOn": os.environ["EVIDENCE_FILTER"],
        }
    ],
}
print(json.dumps(body))
PY
)

RETRIEVE_STATUS=$(printf '%s' "$RETRIEVE_BODY" | curl -s \
  -X POST \
  "${SEARCH_URL}/knowledgebases/${KB_NAME}/retrieve?api-version=${API_VERSION}" \
  -H "Content-Type: application/json" \
  -H "api-key: ${SEARCH_ADMIN_KEY}" \
  --data-binary @- \
  -o "${OUTPUT_DIR}/08-retrieve-verdict.json" \
  -w "%{http_code}")
echo "[stage-8] Retrieve HTTP: ${RETRIEVE_STATUS}"

if [[ "${RETRIEVE_STATUS}" != "200" ]]; then
  echo "FAIL: stage 8 — retrieve returned HTTP ${RETRIEVE_STATUS}"
  echo "--- response (output/08-retrieve-verdict.json) ---"
  cat "${OUTPUT_DIR}/08-retrieve-verdict.json"
  exit 1
fi

# ── Step 4: analyse the synthesised answer ────────────────────────────────────
echo ""
echo "────────────────────────────────────────────────────────────────"
python3 - <<'PY'
import json, os, re, sys
f = os.path.join(os.environ["OUTPUT_DIR"], "08-retrieve-verdict.json")
data = json.load(open(f))

# Locate the synthesised answer text. Under answerSynthesis the prose should be
# in response[].content[].text; record exactly where it lands for the RECONCILE.
answer = ""
loc = None
for i, msg in enumerate(data.get("response") or []):
    for j, c in enumerate(msg.get("content") or []):
        if c.get("type") == "text" and c.get("text"):
            answer = c["text"]; loc = f"response[{i}].content[{j}].text"
            break
    if answer:
        break

refs = data.get("references") or []
acts = data.get("activity") or []
reasoning = next((a for a in acts if a.get("type") == "agenticReasoning"), {})

print("RAW SYNTHESISED ANSWER")
print("  location:", loc)
print("  ---")
for line in (answer or "(empty)").splitlines():
    print("   ", line)
print("  ---")

verdict = re.search(r"verdict\s*[:\-]\s*([A-Za-z_]+)", answer, re.I)
passage = re.search(r"passage\s*[:\-]\s*([\s\S]*?)(?:\n\s*why\s*[:\-]|\n{2,}|$)", answer, re.I)
why = re.search(r"why\s*[:\-]\s*([\s\S]*?)(?:\n{2,}|$)", answer, re.I)

print()
print("PARSE (vs live-server parseIqAnswer expectations)")
print("  VERDICT token :", verdict.group(1).upper() if verdict else "‹absent›")
print("  PASSAGE token :", (passage.group(1).strip()[:120] + "…") if passage and passage.group(1).strip() else "‹absent›")
print("  WHY token     :", (why.group(1).strip()[:120]) if why else "‹absent›")
print(f"  references[]  : {len(refs)}", "→", ", ".join(
    f"{r.get('docKey')} ({r.get('rerankerScore')})" for r in refs[:5]) or "none")
print(f"  agenticReasoning tokens:", reasoning.get("reasoningTokens", "‹none›"))

verdict_ok = bool(verdict)
refs_ok = len(refs) > 0
print()
print("B0 ASSERTIONS")
print(f"  [{'PASS' if verdict_ok else 'FAIL'}] synthesised answer carries a parseable VERDICT")
print(f"  [{'PASS' if refs_ok else 'WARN'}] references[] returned (grounding provable)")
print()
if verdict_ok and refs_ok:
    print("RESULT: B0 PASS — Foundry IQ produced the verdict and the grounding.")
    sys.exit(0)
elif verdict_ok:
    print("RESULT: B0 PARTIAL — verdict synthesised but no references[]. Inspect raw JSON;")
    print("        the synthesis may ground without echoing references in this mode.")
    sys.exit(0)
else:
    print("RESULT: B0 NEEDS RECONCILE — the verdict token did not survive. Inspect the raw")
    print("        answer above; the model may bury the verdict or use a different field.")
    print("        Adjust buildVerdictInstruction / parseIqAnswer to the real shape.")
    sys.exit(2)
PY
RESULT=$?
echo "────────────────────────────────────────────────────────────────"
echo "Artifacts:"
echo "  KB PUT response        : output/08-kb-put.json      [HTTP ${KB_PUT_STATUS}]"
echo "  KB GET (key-scrubbed)  : output/08-kb-get.json"
echo "  Verdict synthesis (raw): output/08-retrieve-verdict.json [HTTP ${RETRIEVE_STATUS}]"
echo "  OData metadata         : output/08-metadata.xml"
exit $RESULT
