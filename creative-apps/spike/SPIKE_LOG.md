# Evidence Engine — Spike Run Log

## Overview

Each row records one stage execution. Result is PASS / FAIL / SKIP. Notes capture any
quota errors, timing, or follow-up actions.

## Run Results

| Run | Stage | Description | Date | Result | Duration | Notes |
|-----|-------|-------------|------|--------|----------|-------|
| 1 | 0 | Azure CLI login check | 2026-06-10 | PASS | <1s | subscription: Azure subscription 1, user: thomas1311@hotmail.co.uk |
| 1 | 1 | Provision free-tier Azure AI Search | 2026-06-10 | PASS | ~3 min | sku=free, status=running; Microsoft.Search provider auto-registered; admin key written to .env |
| 1 | 2 | Create evidence index + upload 3 case docs | 2026-06-10 | PASS | <5s | Index create HTTP 201; docs upload HTTP 200; $count=3; schema fix required: `semantic` not `semanticSearch`, `prioritizedContentFields` not `contentFields` for 2026-05-01-preview; no warnings in output |
| 1 | 3 | Create knowledge source + knowledge base | 2026-06-10 | PASS | <5s | KS create HTTP 201/204; KB create HTTP 204; GET /knowledgebases lists evidence-kb; API version 2026-05-01-preview. Shape fixes required (see notes below). |

## Stage 3 API Shape Notes (2026-05-01-preview)

### Knowledge Source (PUT /knowledgesources/{name})

Correct body for `kind: "searchIndex"`:
```json
{
  "name": "evidence-ks",
  "kind": "searchIndex",
  "searchIndexParameters": {
    "searchIndexName": "evidence"
  }
}
```

Rejected shapes discovered by probing:
- `"indexName": "evidence"` at root → property does not exist on KnowledgeSource
- `"parameters": { "indexName": "evidence" }` → nested property not found
- `"searchIndex": { "indexName": "evidence" }` → nested property not found
- Correct discriminator field: `searchIndexParameters` (polymorphic discriminator on `kind`)

### Knowledge Base (PUT /knowledgebases/{name})

Correct body (LLM-free):
```json
{
  "name": "evidence-kb",
  "outputMode": "extractiveData",
  "retrievalReasoningEffort": { "kind": "minimal" },
  "knowledgeSources": [{ "name": "evidence-ks" }]
}
```

Key discoveries from `$metadata` (AgentOutputModality enum):
- Valid `outputMode` values: `"extractiveData"` (0), `"answerSynthesis"` (1)
  — `"extractedData"` does NOT exist in this API version
- `retrievalReasoningEffort` is `AgentRetrievalReasoningEffort` complex type: `{ "kind": "minimal" | "low" | "medium" }`
  — bare string form `"minimal"` rejected; must be object
  — `"low"` and `"medium"` require a model to be specified; `"minimal"` is the only LLM-free option
- `knowledgeSources[].name` references the knowledge source by name (not `sourceId`)
- No `models` array needed for LLM-free retrieval
