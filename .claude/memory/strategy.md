---
name: strategy
description: Evolving hackathon strategy — locked decisions, current track, prize vectors, build schedule
metadata:
  type: project
---

## Status: CORE DA BUILT — READY TO PROVISION
Session 3 (June 9, 2026)

## Locked Decisions

### Track: Enterprise Agents (Microsoft 365 Copilot)
**Why:** Reasoning Agents required Azure OpenAI API calls × 6 agents per run = ongoing cost risk on free tier. Enterprise Agents Declarative Agent approach uses M365 Copilot's built-in AI — zero compute cost. 120 vs 287 projects = less competition. Domain knowledge carries over.

### Approach: Declarative Agent + TypeScript MCP Server
- Declarative Agent (DA) is manifest-based — no custom AI compute
- MCP server in TypeScript adds the bonus criteria explicitly scored higher by judges
- OAuth on MCP server adds a third bonus tier

### IQ Layer: Work IQ (primary) + Foundry IQ (knowledge base)
- Work IQ is native to M365 and most compelling for an Enterprise agent — real organisational signals without synthetic workarounds
- Foundry IQ provides the knowledge base for grounded, cited answers

### Domain: AI security for schools — still the lead candidate
Subject to judge-persona review — see `ideas.md`

### Prize Vectors (unchanged)
1. Best Overall Agent ($15k cash)
2. Best Enterprise Agent ($5k cash)
3. Best Use of IQ Tools ($5k cash)
4. Hack for Good ($1,468)
Total reachable: ~$30,404

## Completed (Session 3 — June 9)

✅ `instruction.txt` — Full RiskRadar instructions: 6-step workflow, 5-dimension scoring, MCP tool invocation, output format, EU AI Act flags
✅ `declarativeAgent.json` — Updated description, 4 conversation starters, action linked
✅ `ai-plugin.json` — 3 functions (getAssessment, saveAssessment, vendorLookup) + LocalPlugin runtime at localhost:3000/api
✅ `manifest.json` — Proper branding, app name and descriptions
✅ `evals/prompts.json` — 7 RiskRadar evaluation prompts
✅ TypeScript MCP server — Express, all 3 tools, file-persisted assessment store
✅ Common Sense Media EdTech ratings — 12 tools pre-loaded (ChatGPT, Grammarly, Khan Academy, etc.)
✅ Committed to agents-league git repo as `riskradar/`

## Completed (Overnight Loop 1 — June 9/10)

✅ `declarativeAgent.json` — Added `capabilities` block: OneDriveAndSharePoint (Work IQ) + GraphConnectors (Foundry IQ) with TODO markers for resource IDs
✅ `appPackage/KNOWLEDGE_SETUP.md` — Step-by-step guide for filling in both TODO values and uploading knowledge docs
✅ `evals/prompts.json` — Expanded from 7 to 14 prompts; added: already-deployed Critical Risk, EU AI Act prohibited (emotion recognition), tool not in CSM database, vendor refusing DPA, reassessment trigger, home-use edge case
✅ `server/src/ratings.ts` — Expanded from 12 to 18 tools: added Notion AI (C), BrainPOP (B), Nearpod (B), Google Classroom (A), Microsoft Teams for Education (A), Turnitin (D)
✅ Build verified clean

## Completed (Overnight Loop 2 — June 9/10)

✅ `riskradar/README.md` — Full project README replacing generic ATK template: architecture with Mermaid diagram (Work IQ + Foundry IQ + MCP + HITL flow), scoring rubric table, CSM coverage table, responsible AI principles section, setup/provision guide, Hack for Good framing
✅ `appPackage/ai-plugin.json` — Replaced hardcoded `http://localhost:3000/api` with `${{MCP_SERVER_URL}}` ATK env var substitution — human can now override for ngrok/Railway/Render without editing code
✅ `env/.env.dev` — Added `MCP_SERVER_URL=http://localhost:3000/api` default + comments explaining ngrok/deploy override

## Completed (Overnight Loop 3 — June 9/10)

✅ `data/knowledge/risk_assessment_frameworks.md` — Major enhancement: 256 → 438 lines
  - All 15 ICO Children's Code standards listed with names and key requirements (Standards 1–15)
  - EU AI Act Article 5(1)(a)–(f) sub-provisions with direct school implications (including 5(1)(e) — emotion/attention tracking banned in schools)
  - NIST AI RMF sub-category citations added to every scoring dimension (GOVERN 1.2, MEASURE 2.5, MAP 5.1, etc.)
  - Scoring tables rewritten with "Evidentiary Anchor" column — concrete evidence distinguishing each score level
  - ICO Children's Code standards cross-referenced inside Dimension 2 (Age Appropriateness) scoring criteria
  - Part 5 added: Full ChatGPT sample scored assessment with all 5 dimensions, citations, risk rating (16/Medium), controls, AUP clause, and HITL disclaimer
  - Part 6 added: NIST AI RMF Sub-category Quick Reference table mapping all 5 dimensions to primary sub-categories
✅ Build verified clean

## Completed (Overnight Loop 4 — June 10, 2026)

✅ `docs/demo-script.md` — Full 3–4 minute video recording guide: pre-flight checklist, narration lines, 8-message Scenario A (Grammarly assessment, Medium Risk), 60-second Scenario B (EU AI Act prohibited tool — attention tracking), expected MCP tool calls at each step, scoring table with citations to show, editing notes, submission checklist
✅ `docs/discord-post.md` — 3 Discord post templates (full, short, technical): compelling Hack for Good narrative, all four technical components called out, posting timing/strategy notes
✅ `data/knowledge/risk_assessment_frameworks.md` — Extended to 580 lines: Grammarly sample assessment (17/Medium Risk, all 5 dimensions scored with citations, AUP clause, controls), Part 8 contrasting patterns table (ChatGPT vs Grammarly showing different failure profiles at same overall risk level)
✅ `data/knowledge/owasp_ai_top10.md` — Major enhancement: generic cert-prep → school-specific grounded knowledge
  - School-specific scenarios added to every LLM01–LLM10 entry (student jailbreaking, data leakage between students, gradebook write access, teacher overreliance, etc.)
  - RiskRadar dimension mapping added to every entry (which of 5 dimensions each risk signals, what assessment question to ask)
  - Summary mapping table added: all 10 OWASP risks mapped to primary RiskRadar dimension with key assessment question
✅ Build verified clean

## Open Decisions
- [ ] M365 Developer tenant confirmed and active → provision the DA (teamsapp provision)
- [ ] Fill in TODO values in `declarativeAgent.json` using KNOWLEDGE_SETUP.md guide
- [ ] Upload 4 knowledge docs to SharePoint + Azure AI Foundry per KNOWLEDGE_SETUP.md
- [ ] Set MCP_SERVER_URL to a public HTTPS endpoint in .env.dev before provisioning (ngrok for demo, Railway/Render for persistent)
- [ ] OAuth on MCP server — NOTE: persona analysis found this is ineffective on LocalPlugin/localhost runtime; correct OAuth requires HTTPS + OAuthPluginVault (needs Azure deployment)
- [ ] Demo video

## Build Schedule

| Day | Goal |
|-----|------|
| June 9 | Idea locked, M365 Dev tenant, VS Code + ATK installed |
| June 10 | DA scaffold via ATK, Foundry IQ knowledge base live |
| June 11 | TypeScript MCP server (read + write) |
| June 12 | OAuth on MCP, Work IQ wired, end-to-end demo flow |
| June 13 | Demo video, README, architecture diagram |
| June 14 | Submit |

## Risks

| Risk | Mitigation |
|------|-----------|
| M365 Developer tenant takes time to activate | Sign up immediately; usually instant |
| MCP server is net-new work | Simple TypeScript server, well-documented in challenge resources |
| DA limits on custom reasoning depth | Instructions + knowledge base + MCP tools compensate |
| Community vote (10%) | Post to Discord today with concept, post demo when ready |

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| June 9 | Reasoning Agents track | 50% score on accuracy+reasoning, stackable prizes |
| June 9 | AI Security for schools | Differentiated, Hack for Good, Security Audit concept |
| June 9 | **PIVOT: Enterprise Agents** | Cost control, less competition, domain knowledge carries over |
| June 9 | Declarative Agent approach | Zero API cost, fastest to build, all computation on M365 |
| June 9 | TypeScript MCP server bonus | Bonus criteria, leverages existing skills |
