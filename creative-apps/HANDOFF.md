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
| 3 | Verify search query round-trip | ⏳ Pending | — |
| 4 | Verify search query round-trip | ⏳ Pending | — |
| 5 | MCP server scaffold + Copilot tool registration | ⏳ Pending | — |

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

## Next Actions

1. ~~Run stage 0 — confirm `az` CLI authenticated~~ ✅
2. ~~Run stage 1 — provision search service~~ ✅
3. ~~Run stage 2 — create search index schema (`evidence` index, semantic config)~~ ✅
4. Run stage 3 — verify search query round-trip (keyword + semantic rerank)
