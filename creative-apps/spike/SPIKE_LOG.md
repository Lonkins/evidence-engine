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
| 1 | 4 | Verify agentic retrieval with citations | 2026-06-10 | PASS | <2s | Winning shape: intents. In-corpus: HTTP 200, docKey=case-001, rerankerScore=3.9889. Out-corpus: HTTP 200, references=[]. Free tier confirmed working. Shape discovery required (see notes below). |

## Stage 4 API Shape Notes (2026-05-01-preview)

### Locked API version: `2026-05-01-preview`

### Winning request shape: `intents`

The `messages` shape (preview conversational format) is **NOT** supported when `retrievalReasoningEffort.kind` is `"minimal"`. The service returns HTTP 400:
> "Messages input not supported when 'minimal' reasoning effort is requested. Use intents input instead."

The `intents` shape works with `minimal` effort (LLM-free, $0):
```json
{
  "intents": [
    { "type": "semantic", "search": "query text" }
  ]
}
```

Key discoveries from probing (confirmed via OData `$metadata`):
- `AgentRetrievalIntent.type` must be `"semantic"` (not `"search"` or `"text"`)
- `AgentRetrievalMessage.content` is `Collection(AgentRetrievalMessageContent)`, not a bare string
- `AgentRetrievalMessageContent` shape: `{"type":"text","text":"..."}` (or `"image"` type)
- `messages` input requires effort > `minimal`; `intents` is the LLM-free path
- `knowledgebases` EntitySet maps to `Agent` OData type — the `/retrieve` Action is on `Agent`

### In-corpus result shape

```json
{
  "response": [{"content":[{"type":"text","text":"[{\"ref_id\":0,...}]"}]}],
  "activity": [
    {"type":"searchIndex","count":1,"semanticConfigurationName":"evidence-semantic","elapsedMs":0},
    {"type":"agenticReasoning","reasoningTokens":280,"retrievalReasoningEffort":{"kind":"minimal"}}
  ],
  "references": [
    {"type":"searchIndex","id":"0","rerankerScore":3.9889374,"docKey":"case-001","title":"AI-Assisted Development Tools Reduce Bug Density by 23%"}
  ]
}
```

### Out-of-corpus calibration

- Query: "What is the recommended daily intake of vitamin C for adults?"
- References: `[]` (zero) — clean fail-closed
- `reasoningTokens: 0`
- This confirms threshold: `references.length === 0` → no relevant evidence in corpus

### Free tier verdict ✅

The semantic ranking used through the agentic retrieval path (`outputMode: extractiveData`, `effort.kind: minimal`) **does work on the free tier**. Azure AI Search free tier blocks the traditional semantic ranker on `/indexes/{name}/search`, but the knowledge base `/retrieve` endpoint with `minimal` agentic reasoning succeeds. `rerankerScore` is provided by the agentic reasoning layer, not the traditional semantic ranker.

---

## Decision Record

| Decision | Value |
|----------|-------|
| Free tier verdict | ✅ CONFIRMED WORKING — no paid tier upgrade needed |
| Locked API version | `2026-05-01-preview` |
| Locked request shape | `intents` (messages not supported at minimal effort) |
| Intent type value | `"semantic"` |
| In-corpus docKey count | 1 (docKey: case-001, rerankerScore: 3.9889374) |
| Out-of-corpus docKey count | 0 (clean fail-closed) |
| Evidence artifact | `spike/evidence-of-pass.json` |

Spike is COMPLETE. Build phase can proceed on free tier.

---

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
