---
name: riskradar-strategy
description: RiskRadar build status, completed items, and prize vector tracking for Agents League hackathon
metadata:
  type: project
---

# RiskRadar Build Status — June 11, 2026

**Why:** Agents League Hackathon deadline June 14, 2026. Prize pool up to $30,404 across four prizes.

## Component Status

| Component | Status | Notes |
|-----------|--------|-------|
| DA instructions | ✅ Complete | `instruction.txt` — 6-step workflow + 6 REDLINES + escalation matrix |
| DA manifest | ✅ Complete | `declarativeAgent.json` — conversation starters, capabilities block (TODO placeholders for tenant IDs) |
| MCP tool definitions | ✅ Complete | `ai-plugin.json` — 3 tools + OAuthPluginVault |
| MCP server | ✅ Built and tested | Express, TypeScript, OAuth middleware; SharePoint via graph-store.ts when SP env vars set, file fallback otherwise |
| OAuth on MCP | ✅ Built | Azure AD JWKS Bearer token validation; skips in dev mode |
| graph-store.ts | ✅ Wired | Full Microsoft Graph API client: site/list ID resolution, PATCH/POST upsert, field mapping |
| store.ts | ✅ Wired | Routes to SharePoint when SP_SITE_URL/SP_TENANT_ID/SP_CLIENT_ID/SP_CLIENT_SECRET set; file fallback otherwise |
| Common Sense Media ratings | ✅ 18 tools | ChatGPT/D, Grammarly/B, Khan Academy/A, Turnitin/D, Notion AI/C, etc. |
| Evaluation prompts | ✅ 17 prompts | `evals/prompts.json` — covers EU AI Act Article 5, Critical Risk, DPA refusal, data residency, headteacher override edge cases |
| Test suite | ✅ 56/56 | Vitest, 97% coverage (auth/store/ratings/routes) |
| README | ✅ Accurate | Mermaid architecture diagram; grade table matches ratings.ts; no false claims about Foundry IQ being live |
| Knowledge base docs | ✅ 4 documents, 1,599 lines | `enterprise-agents/data/knowledge/` — NIST AI RMF, OWASP AI Top 10, AI Security Cert Guide, Synthetic Team Readiness Report |
| KNOWLEDGE_SETUP.md | ✅ Complete | Step-by-step guide for human to provision SharePoint + Foundry IQ |
| Demo script | ✅ Complete | `enterprise-agents/docs/demo-script.md` — narrated recording guide |
| Demo transcript | ✅ Complete | `enterprise-agents/docs/demo-transcript.md` — shows grounded NIST AI RMF citations |
| Discord post templates | ✅ Complete | `enterprise-agents/docs/discord-post.md` — 3 templates with Hack for Good angle |
| DA provisioned in M365 | ❌ Human needed | Requires M365 dev tenant + `teamsapp provision` |
| MCP server deployed | ❌ Human needed | Deploy to Railway/Render, set MCP_SERVER_URL |
| Foundry IQ knowledge base live | ❌ Human needed | Upload 4 docs per KNOWLEDGE_SETUP.md |
| Demo video | ❌ Human needed | June 13 target, use demo-script.md |

## Prize Vectors

| Prize | Value | Key Requirements | Status |
|-------|-------|-----------------|--------|
| Best Overall Agent | $16,468 | Accuracy (20%), Reasoning (20%), Safety (20%), Creativity (15%), UX (15%), Vote (10%) | Code complete; needs live provisioning + demo |
| Best Enterprise Agent | $6,468 | Deepest M365 integration | SharePoint store wired; needs live provisioning |
| Best Use of IQ Tools | $6,468 | Real Foundry IQ + Work IQ grounding | Knowledge docs ready; needs Azure AI Search + SharePoint |
| Hack for Good | $1,468 | Child protection framing | Strong — Discord post templates ready |

## Critical Human Actions (June 12–14)

1. **June 12:** Deploy MCP server to Railway/Render (~30 min)
2. **June 12:** Provision M365 dev tenant DA (`teamsapp provision`)
3. **June 12:** Upload 4 knowledge docs to Azure AI Foundry (follow KNOWLEDGE_SETUP.md)
4. **June 12:** Wire SharePoint SP env vars, test live `saveAssessment` round-trip
5. **June 13:** Record demo video using `docs/demo-script.md`
6. **June 13:** Post to Discord using Template A from `docs/discord-post.md`
7. **June 14:** Make repo public, fill in submission.md, submit

**How to apply:** Autonomous loops should not attempt M365/Azure deployment actions. Code is complete. Future cycles should focus on final polish (eval prompts, README accuracy) only if genuinely incomplete.
