---
name: azure-ai-search-kb-api
description: Locked Azure AI Search knowledge base retrieval API contract — endpoint, request shape, response shape, free-tier verdict, and all schema discoveries from spike stage 4
metadata:
  type: reference
---

## Locked API Contract (confirmed 2026-06-10, spike stage 4 PASS)

**API version:** `2026-05-01-preview`  
**Endpoint:** `POST https://{service}.search.windows.net/knowledgebases/{kb-name}/retrieve?api-version=2026-05-01-preview`  
**Auth:** `api-key: {SEARCH_ADMIN_KEY}` header

### Winning request shape: `intents`

```json
{
  "intents": [{ "type": "semantic", "search": "<user query>" }]
}
```

The `messages` shape is **NOT** supported when `retrievalReasoningEffort.kind` is `"minimal"`. Always use `intents` for the LLM-free path.

### Response shape (`outputMode: extractiveData`, `effort.kind: minimal`)

```json
{
  "@odata.context": "...",
  "response": [
    {
      "content": [
        { "type": "text", "text": "[{\"ref_id\":0,\"title\":\"...\",\"content\":\"...\"}]" }
      ]
    }
  ],
  "activity": [
    {
      "type": "searchIndex",
      "count": 1,
      "knowledgeSourceName": "evidence-ks",
      "semanticConfigurationName": "evidence-semantic",
      "elapsedMs": 0
    },
    {
      "type": "agenticReasoning",
      "reasoningTokens": 280,
      "retrievalReasoningEffort": { "kind": "minimal" }
    }
  ],
  "references": [
    {
      "type": "searchIndex",
      "id": "0",
      "rerankerScore": 3.9889374,
      "docKey": "case-001",
      "title": "AI-Assisted Development Tools Reduce Bug Density by 23%"
    }
  ]
}
```

### PASS assertion

- HTTP 200
- `response.references.length > 0` AND `references[0].docKey` is present

### Fail-closed calibration

Out-of-corpus query returns:
- HTTP 200
- `references: []` (empty)
- `reasoningTokens: 0`

Threshold for "no evidence": `references.length === 0`.

---

## Free Tier Verdict ✅

Azure AI Search free tier **works** for this retrieval path. Key insight: the free tier blocks the traditional semantic ranker on `/indexes/{name}/search`, but the knowledge base `/retrieve` endpoint with `minimal` agentic reasoning succeeds and returns `rerankerScore`. The agentic reasoning layer provides ranking without consuming the semantic ranker quota.

**No upgrade to Basic tier required.** Cost: $0/month.

---

## Resource Names

| Resource | Name | Region |
|----------|------|--------|
| Resource group | `evidence-engine-rg` | eastus |
| Azure AI Search | `evidence-engine-search` | free SKU |
| Search index | `evidence` | semantic config: `evidence-semantic` |
| Knowledge source | `evidence-ks` | kind: `searchIndex` |
| Knowledge base | `evidence-kb` | outputMode: `extractiveData` |

Credentials in `.env` (gitignored). Never commit.

---

## Schema Discovery Log (what was wrong before PASS)

| Attempt | Shape used | Error | Fix |
|---------|-----------|-------|-----|
| 1 | `messages[].content` as string | "A 'PrimitiveValue' node… StartArray expected" | `content` must be a collection |
| 2 | `intents[].text` | "property 'text' does not exist on AgentRetrievalIntent" | Use `search` property, not `text` |
| 3 | `intents[].type: "search"` | "Valid types are: semantic" | Use `type: "semantic"` |
| 4 | `messages` at `minimal` effort | "Messages input not supported when 'minimal' reasoning effort is requested" | Use `intents` for LLM-free path |

### Correct `messages` shape (for future reference — requires effort > minimal + LLM model)

```json
{
  "messages": [
    {
      "role": "user",
      "content": [{ "type": "text", "text": "<query>" }]
    }
  ]
}
```

---

## OData Type Map (from `$metadata`)

| Type | Key fields |
|------|-----------|
| `AgentRetrievalIntent` | `type` (required, Edm.String), `search` (Edm.String) |
| `AgentRetrievalMessage` | `role` (Edm.String), `content` (Collection of AgentRetrievalMessageContent) |
| `AgentRetrievalMessageContent` | `type` (required, Edm.String), `text` (Edm.String), `image` (ImageUrl) |
| `AgentRetrievalResponse` | `response` (Collection of AgentRetrievalMessage), `activity` (Collection), `references` (Collection) |

`knowledgebases` EntitySet maps to `Agent` OData type — the `/retrieve` Action is bound to `Agent`.

---

## Evidence

Full in-corpus response JSON: `creative-apps/spike/evidence-of-pass.json`  
Script: `creative-apps/spike/04-retrieve.sh`  
Full decision record: `creative-apps/spike/SPIKE_LOG.md` → "Decision Record" section
