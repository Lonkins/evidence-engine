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
| 1 | 5 | KB native MCP endpoint probe | 2026-06-10 | PASS | <1s | KB-scoped /knowledgebases/evidence-kb/mcp: HTTP 200, SSE transport, protocolVersion 2024-11-05, capabilities.tools.listChanged=true. Service-level /mcp: HTTP 405. Auth: api-key header. |
| 2 | 8 | Answer-synthesis: bind model + IQ-produced verdict (roadmap B0) | 2026-06-13 | PASS | ~5s | Bound gpt-4.1-mini (AIServices `agents-league-hub-resource`) to evidence-kb; PUT outputMode=answerSynthesis + models[] + effort medium (HTTP 204). /retrieve with `messages` verdict prompt → HTTP 200, synthesised `VERDICT: CONTRADICTED` + verbatim badge-log PASSAGE in `response[0].content[0].text`, 12 references[], agenticReasoning 10155 tok. The IQ brain produces the verdict. Shape notes below. |

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
| KB native MCP endpoint | ✅ LIVE — `/knowledgebases/evidence-kb/mcp`, HTTP 200, SSE, `tools.listChanged=true` |
| MCP auth variant | api-key header |
| Copilot mcp.json block | See output-notes section |

Spike is COMPLETE. Build phase can proceed on free tier. KB MCP endpoint confirmed live — zero-glue Copilot integration is possible.

---

## Stage 5 MCP Endpoint Notes (2026-05-01-preview)

### Live endpoint: KB-scoped

```
POST https://evidence-engine-search.search.windows.net/knowledgebases/evidence-kb/mcp?api-version=2026-05-01-preview
```

- **HTTP status**: 200
- **Transport**: Server-Sent Events (SSE) — `event: message\ndata: {...}`
- **Auth variant**: `api-key` header

### MCP initialize response

```json
{
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "logging": {},
      "tools": { "listChanged": true }
    },
    "serverInfo": {
      "name": "SearchWebRole.AspNetCore",
      "version": "1.0.0.0"
    }
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

Key discovery: `capabilities.tools.listChanged: true` means the endpoint exposes tools the client can enumerate.

### Service-level path (/mcp): HTTP 405 — Method Not Allowed

The service-level `/mcp` path is not exposed. Only the KB-scoped path responds.

---

## output-notes — Suggested Copilot mcp.json Block

This block wires the Azure AI Search knowledge base directly into GitHub Copilot in VS Code with zero glue code. The endpoint is the native KB MCP server; no custom MCP server is required for basic retrieval.

```json
{
  "servers": {
    "evidence-engine": {
      "url": "https://evidence-engine-search.search.windows.net/knowledgebases/evidence-kb/mcp",
      "type": "http",
      "headers": {
        "api-key": "${AZURE_SEARCH_ADMIN_KEY}"
      }
    }
  }
}
```

**Save to:** `.vscode/mcp.json` (project-scoped) or `~/.config/mcp.json` (user-scoped)  
**Set env var:** `AZURE_SEARCH_ADMIN_KEY=<your-admin-key>`

This is a headline submission feature: **Foundry IQ (Azure AI Search KB) → GitHub Copilot with zero glue code**. The MCP server is built into the search service.

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

---

## Stage 8 API Shape Notes (2026-05-01-preview) — Answer Synthesis / IQ-brain verdict

Script: `08-answer-synthesis.sh`. Proof: `output/08-retrieve-verdict.json`. This is
the build that makes "Foundry IQ is the verdict brain" true.

### Model binding — Knowledge Base (PUT /knowledgebases/evidence-kb)

Confirmed body (IQ-brain). Schemas from `$metadata` (`output/08-metadata.xml`):
`Agent.models` is `Collection(AgentModelConfiguration)`;
`AgentModelConfiguration = { kind, azureOpenAIParameters }`;
`AzureOpenAIParameters = { resourceUri, deploymentId, apiKey, modelName, authIdentity }`.

```json
{
  "name": "evidence-kb",
  "outputMode": "answerSynthesis",
  "retrievalReasoningEffort": { "kind": "medium" },
  "models": [
    {
      "kind": "azureOpenAI",
      "azureOpenAIParameters": {
        "resourceUri": "https://<aiservices>.cognitiveservices.azure.com",
        "deploymentId": "gpt-4.1-mini",
        "modelName": "gpt-4.1-mini",
        "apiKey": "<key — .env only, never commit>"
      }
    }
  ],
  "knowledgeSources": [{ "name": "evidence-ks" }]
}
```

- `kind: "azureOpenAI"` is the accepted discriminator. PUT returns **HTTP 204**.
- `Agent` also exposes `retrievalInstructions` / `answerInstructions` (KB-level prompt
  shaping) — unused so far; verdict shaping is done per-request instead.
- `gpt-4o-mini 2024-07-18` is **deprecated** (since 2026-03-31). Use `gpt-4.1-mini`.
- GlobalStandard quota was 0 in this subscription; **Standard** `gpt-4o-mini`/`gpt-4.1-mini`
  had 200k TPM. Deploy to Standard.

### Verdict retrieve — POST /knowledgebases/evidence-kb/retrieve

`messages` input is accepted now that effort > minimal and a model is bound:

```json
{
  "messages": [{ "role": "user", "content": [{ "type": "text", "text": "<verdict instruction>" }] }],
  "retrievalReasoningEffort": { "kind": "medium" },
  "knowledgeSourceParams": [
    { "kind": "searchIndex", "knowledgeSourceName": "evidence-ks", "filterAddOn": "doc_type eq 'evidence'" }
  ]
}
```

### Response shape (answerSynthesis, medium effort) — the reconcile

- Synthesised prose answer at **`response[0].content[0].text`** (same field as extractive,
  but prose instead of the ref_id JSON array). `content[].role` is null.
- The model **honours the leading `VERDICT:/PASSAGE:/WHY:` shape verbatim** (no structured-
  output/tool-call fallback needed). PASSAGE comes wrapped in quotes; WHY trails inline
  `[ref_id:N]` tags — `parseIqAnswer` strips both.
- `references[]` carry `{ type, id, activitySource, sourceData, rerankerScore, docKey, title }`
  — the grounding set the synthesis used (12 returned for the Helena claim).
- `activity[]` is richer than the minimal path: `modelQueryPlanning`, `searchIndex`
  (count + searchIndexArguments.search/filter), `modelAnswerSynthesis` (input/outputTokens),
  `agenticReasoning` (reasoningTokens, effort). Fuel for the full wiretap stream (roadmap A4).

### PASS assertion

- KB GET shows `outputMode=answerSynthesis`, `models` length 1, effort `medium`.
- Retrieve HTTP 200; synthesised answer carries a parseable `VERDICT`; `references.length > 0`.
