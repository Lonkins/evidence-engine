---
name: strategy
description: Creative Apps track strategy — concept decision, build status, locked choices, prize vectors
metadata:
  type: project
---

## Status: CONCEPT LOCKED + MCP SERVER BUILT

Overnight loop 1 complete (June 10, 2026). MCP server scaffold, 15-document case corpus, and README built.

## Locked Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Concept | **Evidence Engine** — detective game where every character claim is grounded by Foundry IQ agentic retrieval; player catches lies using citations | Only concept where IQ is load-bearing; inverts the hallucination problem as gameplay |
| IQ layer | **Foundry IQ** (Azure AI Search knowledge base + agentic retrieval) | Only viable layer for this use case; Work IQ + Fabric IQ blocked behind enterprise accounts |
| App shape | MCP server (stdio) for GitHub Copilot in VS Code | Explicitly called out in track brief as "especially welcomed" |
| Scope | One hand-authored synthetic detective case — The Holbrooke Gallery Affair | Free tier: 3 indexes / 50MB cap; one great case > mediocre engine |
| Azure Search tier | Free ($0/month) | Confirmed working in spike stages 0–5 |
| API version | `2026-05-01-preview` | Locked in spike; schema shapes are non-obvious in older versions |
| Retrieval request shape | `intents` (not `messages`) | `messages` unsupported at `minimal` effort; locked in spike stage 4 |

## Build Status

| Component | Status | Notes |
|-----------|--------|-------|
| Concept | ✅ Locked | Evidence Engine — unanimous 4/4 persona consensus |
| IQ integration | ✅ Wired (dev + Azure) | foundry-client.ts: Azure AI Search REST, local fallback |
| MCP server | ✅ Built + verified | 4 tools, TypeScript, stdlib, tsc clean build |
| Case corpus | ✅ Built | 15 documents — statements, security log, forensics, motive doc |
| README | ✅ Done | Architecture Mermaid diagram, setup guide, responsible AI section |
| COPILOT_USAGE.md | ✅ Done | 6 specific Copilot interactions documented |
| .vscode/mcp.json | ✅ Done | stdio transport, env var inputs for Azure |
| Demo script | ✅ Done | `docs/demo-script.md` — 3-min shooting script, 7 segments, pre-flight checklist |
| Discord post | ✅ Done | `docs/discord-post.md` — 3 templates + timing strategy |
| Game walkthrough | ✅ Done | `docs/game-walkthrough.md` — full transcript with exact tool calls + expected outputs |
| Web UI | ❌ Not started | Optional polish layer |

## Prize Vectors

Creative Apps prize value TBC. Win probability est. 15–20% with a working Copilot demo.

## Open Items (Human-Gated)

- [ ] Run spike scripts 0-5 (in worktree `creative-apps/.claude/worktrees/hungry-cannon-81b457/creative-apps/spike/`) to provision Azure AI Search free tier — see HANDOFF.md in that worktree
- [ ] Upload corpus documents to Azure AI Search index once provisioned
- [ ] Fill in .env with AZURE_SEARCH_ENDPOINT and AZURE_SEARCH_KEY
- [ ] Record demo video (3 min): 20s hook → 90s catch-the-lie moment → 40s MCP in Copilot Chat → 30s architecture
- [ ] Post to Discord #creative-apps with video + GIF of lie-catching moment

## Autonomous Next Steps

All autonomous actions complete. Remaining items are human-gated.

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| June 10 | Track setup complete | Added as parallel track alongside Enterprise Agents |
| June 10 | Spike stages 0–5 complete | Free tier confirmed; API contract locked; KB native MCP endpoint live (zero-glue Copilot integration) |
| June 10 | IQ verification: Foundry IQ only viable layer | Work IQ + Fabric IQ blocked behind enterprise accounts |
| June 10 | Concept locked: Evidence Engine (4/4 persona consensus) | Only concept with load-bearing IQ; highest differentiation |
| June 10 | MCP server scaffold + corpus built (overnight loop 1) | Core playable game deliverable; Azure integration ready to wire |
