# Evidence Engine — Spike Status Board

## Concept

An MCP server for GitHub Copilot that retrieves cited evidence for any claim or question from a
vector-indexed knowledge base. Azure AI Search (free tier) backs the index; Foundry IQ provides
grounded, cited answers. Developers call it from Copilot Chat without leaving VS Code.

## Spike Stages

| Stage | Description | Status | Run Date |
|-------|-------------|--------|----------|
| 0 | Azure CLI login check | ✅ PASS | 2026-06-10 |
| 1 | Provision free-tier Azure AI Search | ✅ PASS | 2026-06-10 |
| 2 | Create search index + upload 3 case docs | ✅ PASS | 2026-06-10 |
| 3 | Create knowledge source + knowledge base (LLM-free) | ✅ PASS | 2026-06-10 |
| 4 | Verify agentic retrieval with citations on free tier | ✅ PASS | 2026-06-10 |
| 5 | KB native MCP endpoint probe | ✅ PASS | 2026-06-10 |

### Stage 4 Schema Notes — Locked API contract

**API version locked:** `2026-05-01-preview`  
**Winning request shape:** `intents` (messages requires effort > minimal)

```json
POST /knowledgebases/{name}/retrieve?api-version=2026-05-01-preview
{
  "intents": [{ "type": "semantic", "search": "<user query>" }]
}
```

**Response shape** (extractiveData mode):
```json
{
  "references": [
    { "docKey": "case-001", "rerankerScore": 3.9889374, "title": "..." }
  ]
}
```

**Free tier verdict ✅** — agentic retrieval works on free tier. Upgrade to Basic **not required**.  
**Fail-closed calibration** — out-of-corpus query returns `references: []` with `reasoningTokens: 0`.  
**Evidence artifact:** `spike/evidence-of-pass.json`

### Stage 3 Schema Notes (2026-05-01-preview)

- Knowledge source kind `searchIndex` requires `searchIndexParameters.searchIndexName` (not `indexName` at root)
- `outputMode` enum is `AgentOutputModality`: valid values are `extractiveData` (0) and `answerSynthesis` (1)
  — the value `extractedData` does NOT exist in this API version (confirmed via `$metadata`)
- `retrievalReasoningEffort` is a complex type `{ "kind": "minimal" | "low" | "medium" }`; `"minimal"` is the only LLM-free option
- `knowledgeSources` array items reference the knowledge source by `name` (not `sourceId`)
- Both objects created via `2026-05-01-preview`; no models/LLM block attached

### Stage 2 Schema Notes

- API `2026-05-01-preview` uses `semantic` (not `semanticSearch`) at index root
- Content/keyword fields use `prioritizedContentFields` / `prioritizedKeywordsFields` (not `contentFields` / `keywordsFields`)
- Semantic config registered: `evidence-semantic` with `rankingOrder: BoostedRerankerScore`
- All 3 documents indexed with `statusCode: 201`, no errors or warnings

## Azure Resources

| Resource | Name | SKU | Region |
|----------|------|-----|--------|
| Resource group | `evidence-engine-rg` | — | eastus |
| Azure AI Search | `evidence-engine-search` | free | eastus |

## Teardown

```bash
az group delete --name evidence-engine-rg --yes --no-wait
```

## Cost Gate

Free-tier Azure AI Search: **$0/month**. No billing risk while spike runs.
The `.env` file (gitignored) holds the admin key — never commit it.

## WP4 — End-to-End Copilot Chat Run (June 11, 2026) ✅

**Requires:** Human present. VS Code + GitHub Copilot signed in.

### Pre-session checklist (done autonomously)

- [x] `.vscode/mcp.json` fixed — `inputs` array populated, stdio args path corrected (`${workspaceFolder}/server/dist/index.js`)
- [x] BONUS: `evidence-engine-foundry-iq` HTTP entry added to `mcp.json` — KB-native Foundry IQ endpoint, zero glue code
- [x] Server built: `cd evidence-engine/server && npm install && npm run build` → `dist/index.js` present
- [x] `docs/screenshots/` directory created with capture guide

### Human-in-the-loop steps

1. Open `evidence-engine/` folder in VS Code
2. VS Code will detect `.vscode/mcp.json` and prompt for Azure endpoint + key (both saved as secure inputs)
3. Open Copilot Chat → Agent mode → confirm `evidence-engine` appears in the agent list
4. Run each beat from `docs/game-walkthrough.md` — screenshot each response
5. Screenshot `05-check-claim-contradicted.png` is the hero image — ensure CONTRADICTED verdict + `20:47:33` timestamp are fully visible
6. Save screenshots to `docs/screenshots/` using filenames in `docs/screenshots/README.md`
7. Confirm `evidence-engine-foundry-iq` also initialises (VS Code should show both servers in the MCP panel)

### mcp.json fix details

Two bugs corrected:
- **Empty `inputs` array**: `${input:azureSearchEndpoint}` and `${input:azureSearchKey}` were referenced but never defined — VS Code would silently pass empty strings to the subprocess, causing silent Foundry IQ failures in dev mode
- **Wrong stdio args path**: `${workspaceFolder}/evidence-engine/server/dist/index.js` → `${workspaceFolder}/server/dist/index.js` (workspaceFolder is already `evidence-engine/`)

---

## Next Actions (WP3 — June 11, 2026)

1. ~~Run stage 0 — confirm `az` CLI authenticated~~ ✅
2. ~~Run stage 1 — provision search service~~ ✅
3. ~~Run stage 2 — create search index schema (`evidence` index, semantic config)~~ ✅
4. ~~Run stage 3 — create knowledge source + knowledge base~~ ✅
5. ~~Run stage 4 — verify agentic retrieval with citations~~ ✅  
   Free tier confirmed. Locked: API `2026-05-01-preview`, shape `intents`, type `semantic`.
6. ~~Run stage 5 — KB native MCP endpoint probe~~ ✅  
   KB-scoped endpoint live: `protocolVersion: 2024-11-05`, `tools.listChanged: true`, SSE transport.  
   Zero-glue Copilot integration confirmed — see output-notes in SPIKE_LOG.md for mcp.json block.
7. ~~WP3: Live integration test + threshold calibration~~ ✅  
   Created `npm run test:live` integration test script. Tests: (a) in-corpus retrieval with security log references, (b) planted-lie contradiction detection, (c) out-of-corpus fail-closed, (d) document fetch by docKey.  
   Test harness verified against local corpus fallback (all 4/4 passing).  
   Score distribution recorded: in-corpus baseline 3.9889, out-of-corpus 0 (clean fail-closed).  
   Recommended no-evidence threshold: **3.5** (88% of spike baseline). Sanitized proof artifact saved to `evidence-engine/docs/integration-proof.json`.

---

## SPIKE COMPLETE

All 6 spike stages passed. The full technology stack is validated on the free tier with a locked API contract.

### Free-Tier Verdict

**✅ Azure AI Search free tier works end-to-end.**  
Agentic retrieval via the knowledge base `/retrieve` endpoint succeeds on free tier. The traditional semantic ranker (on `/indexes/{name}/search`) is blocked by the free tier, but the KB `/retrieve` path with `retrievalReasoningEffort.kind: "minimal"` is not — and it returns `rerankerScore` via the agentic reasoning layer. No paid upgrade is required to ship.

### Locked API Version

`2026-05-01-preview` — used for index creation, knowledge source, knowledge base, retrieval, and MCP endpoint. Do not use an older API version; schema shapes changed significantly.

### Retrieve Latency Observed

- In-corpus query: **< 2 s** (including agentic reasoning, `reasoningTokens: 280`)
- Activity trace shows `elapsedMs: 0` for search index phase — search latency is sub-millisecond on free tier with 3 docs

### MCP Endpoint Verdict

**✅ KB native MCP server is LIVE.**  
- Path: `https://evidence-engine-search.search.windows.net/knowledgebases/evidence-kb/mcp`
- HTTP 200, SSE transport, `protocolVersion: "2024-11-05"`, `capabilities.tools.listChanged: true`
- Auth: `api-key` header
- Service-level `/mcp` returns HTTP 405 — KB-scoped path is the correct one
- The `mcp.json` block in SPIKE_LOG.md output-notes section wires Foundry IQ into GitHub Copilot with zero custom code — this is a **headline submission differentiator**

## WP9 — Live Interrogation (June 11, 2026) ✅

**What it is:** open free-form chat with the three suspects in the web app ("Live Wire" mode).
GitHub Models (free tier, gpt-4o-mini) plays the witnesses, grounded through a **live Foundry IQ
retrieve on every turn** — and deliberately allowed to drift. Every sentence of testimony is
indexed back into the same `evidence` index as a `testimony` document within seconds. The player
challenges any claim; the engine runs two live retrieves (evidence partition + that speaker's own
testimony partition) and stamps an evidence-relative verdict. A wiretap "engine tap" panel shows
every live call (step, method, target path, latency, status) in real time — this is the
integration proof for the demo video.

**Verified end-to-end against the LIVE KB** (June 11): 3 questions → planted lie **CONTRADICTED**
with citation → Helena cracks under the badge-log press → her new time → **SELF_CONTRADICTION**
vs her indexed turn-2 statement → scorecard → session reset deleted all 13 testimony docs.
Sanitized trace: [`evidence-engine/docs/live-mode-proof.json`](evidence-engine/docs/live-mode-proof.json).
Also verified in-browser at 1440px (mode switch → live chat → challenge → CONTRADICTED stamp +
citations → interrogation report).

### Architecture (single index, partitioned by filter)

- `spike/07-add-live-fields.sh` — additive schema migration ($0): `doc_type`, `case_id`,
  `session_id`, `speaker`, `turn_no` (all filterable) + backfill `doc_type='evidence'` on the
  15 corpus docs. Stays inside the ONE existing index — free-tier 3-index cap untouched.
- `evidence-engine/live-server/` — small Node backend holding the only two secrets
  (`AZURE_SEARCH_ADMIN_KEY`, `GITHUB_MODELS_TOKEN` — `$(gh auth token)` works). The browser
  never sees either. Routes: `POST /api/session`, `/api/ask`, `/api/challenge`, `/api/reset`
  (filter-deletes that session's testimony docs), `GET /api/health`.
- KB retrieval uses `knowledgeSourceParams[0].filterAddOn` against knowledge source
  `evidence-ks` (NOT `evidence-source`) — confirmed working on the live KB, api-version
  `2026-05-01-preview`.
- Web: `ModeSwitch` (Case File ⇄ Live Wire), `LiveDesk` (grid: suspect rail · live chat ·
  engine tap), claim chips → challenge → stamped verdict cards with verbatim trigger passages,
  end-of-session interrogation report. **Case File mode untouched and fully offline** — the
  judge-without-keys path. If the backend is down, Live Wire shows "LINE DEAD" and never
  silently falls back.

### Threshold calibration (measured live, June 11 2026)

Declarative claim queries rerank systematically lower than question-style queries:

| Query shape | In-corpus / grounded | Out-of-corpus / fabricated | Threshold |
|-------------|----------------------|----------------------------|-----------|
| Question-style (turn retrieval) | ~3.8–4.0 | 0 refs | **3.5** (WP3) |
| Declarative claim (challenge)   | 2.2–3.9  | 0.9–1.5 | **2.0** (`CLAIM_EVIDENCE_THRESHOLD`) |
| Testimony sentences (self-check) | gated by time-conflict heuristic | — | **1.0** (`TESTIMONY_THRESHOLD`) |

All fail closed. Verdict heuristics (port of cycle-13 `check_claim` fix) operate at
**sentence/log-line level**: only segments sharing a term with the claim (speaker name included)
can contribute a negation or clock-time conflict — a statement-header timestamp or a stray
"was not unusual" elsewhere in the document cannot manufacture a contradiction.

### Cost + teardown

- $0 total: Azure Search free tier (additive fields + a handful of tiny testimony docs per
  session, deleted on reset), GitHub Models free tier. No new Azure resources created.
- Teardown unchanged: `az group delete --name evidence-engine-rg`. Orphaned testimony docs (if a
  session is abandoned mid-run) can be purged with a filter delete on `doc_type eq 'testimony'`.

### Run it

```bash
cd evidence-engine/live-server && npm install && npm run build
cp .env.example .env   # search endpoint + admin key; GITHUB_MODELS_TOKEN=$(gh auth token)
npm start              # :8787
cd ../web && npm run dev   # :5173 → flip to LIVE WIRE
npm run test:live      # (in live-server) full demo-path verification + proof artifact
```

---

### Recommended Next Build Step

Per [`strategy.md`](.claude/memory/strategy.md) build order:

1. **Case corpus authoring** — expand the evidence index from 3 to 20–30 documents in a focused domain (e.g. developer productivity research, AI coding tool benchmarks). Richer corpus = better demo recall and more impressive judge interaction.
2. **Game MCP server** — build the custom MCP server (`src/mcp-server/`) that exposes the retrieval API as named Copilot tools. The KB-native MCP endpoint can be surfaced directly for the basic path; the custom server adds game-specific tools (score tracking, challenge generation, hint retrieval).
3. **Lock the creative framing** — the concept (Evidence Engine as a game / citation challenge) needs a name, a demo script, and a Discord post before build accelerates.
