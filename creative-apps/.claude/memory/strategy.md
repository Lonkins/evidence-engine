---
name: strategy
description: Creative Apps track strategy — concept decision, build status, locked choices, prize vectors
metadata:
  type: project
---

## Status: SPIKE COMPLETE — CONCEPT EMERGING

Spike stages 0–4 complete (June 10, 2026). Core technology stack validated on free tier. Concept is taking shape: an MCP server for GitHub Copilot that retrieves cited evidence from a vector-indexed knowledge base.

**Why:** Read [[azure-ai-search-kb-api]] before writing any retrieval code — the API shape is non-obvious.

## Locked Decisions

| Decision | Value | Locked Date |
|----------|-------|-------------|
| IQ layer | Azure AI Search knowledge base (Foundry IQ path) | June 10, 2026 |
| Delivery form | MCP server for GitHub Copilot in VS Code | June 10, 2026 (emerging) |
| Azure Search tier | Free ($0/month) | June 10, 2026 |
| API version | `2026-05-01-preview` | June 10, 2026 |
| Retrieval request shape | `intents` (not `messages`) | June 10, 2026 |
| Intent type value | `"semantic"` | June 10, 2026 |

## Open Decisions

- [ ] Final creative concept / name / framing (what makes this memorable to judges)
- [ ] What domain the knowledge base covers (evidence for developer claims, or different)
- [ ] Technology stack for MCP server (Node.js / Python)
- [ ] Number of documents to index for demo
- [ ] Demo video script

## Build Status

| Component | Status | Notes |
|-----------|--------|-------|
| Azure AI Search (free) | ✅ Provisioned | `evidence-engine-search`, eastus |
| Search index | ✅ Created | `evidence` index, semantic config `evidence-semantic` |
| Knowledge source + base | ✅ Created | `evidence-ks` → `evidence-kb`, LLM-free |
| Retrieval API validated | ✅ PASS | HTTP 200 + docKey + rerankerScore on free tier |
| Concept (creative framing) | ⏳ Not locked | Next priority |
| MCP server scaffold | ⏳ Not started | Stage 5 |
| Copilot tool registration | ⏳ Not started | Stage 5 |
| Core application | ⏳ Not started | Depends on concept |
| README (Copilot usage) | ⏳ Not started | Required for judging |
| Demo script | ⏳ Not started | Create once concept locked |
| Discord post | ⏳ Not started | Post once concept locked |

## Prize Vectors

Prize details for Creative Apps track are TBC — update once published or found on Discord.

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| June 10 | Track setup complete | Added as parallel track alongside Enterprise Agents |
| June 10 | Spike stages 0–4 complete | Free tier confirmed; API contract locked; no paid upgrade needed |
