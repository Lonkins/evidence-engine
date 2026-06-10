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

## Completed (Overnight Loop 5 — June 10, 2026)

✅ `server/src/auth.ts` — OAuth 2.0 Bearer token validation middleware: JWKS-based JWT verification against Azure AD, graceful dev-mode bypass when env vars absent, RS256 algorithm, issuer + audience validation
✅ `server/src/index.ts` — middleware applied to all `/api/*` routes via `app.use("/api", requireBearerToken)`
✅ `server/package.json` — added `jsonwebtoken` + `jwks-rsa` dependencies
✅ `server/.env.example` — documented `OAUTH_TENANT_ID`, `OAUTH_AUDIENCE`, `PORT` with step-by-step Azure portal instructions
✅ `appPackage/ai-plugin.json` — added `auth` block with `OAuthPluginVault` + `${{OAUTH_REFERENCE_ID}}` env var substitution to runtime spec (completes both sides of OAuth handshake)
✅ `env/.env.dev` — added `OAUTH_REFERENCE_ID=OAuthConfiguration-TODO-FILL-IN-AFTER-REGISTRATION` placeholder
✅ Build verified clean

## Completed (Overnight Loop 8 — June 10, 2026)

✅ `riskradar/appPackage/instruction.txt` — Major enhancement (95 → 149 lines):
  - New **WORK IQ CONTEXT** section: explicit M365 caller identity signals (DPO/network manager/headteacher role detection), personalisation guidance, tenant-specific contact resolution, and org readiness signal surfacing from team_readiness_report.md
  - New **REDLINES** section: 6 non-negotiable stops — EU AI Act Article 5 prohibition, Critical Risk without DPO notification, data outside UK/EU without adequacy, no DPA available, headteacher override handling, active deployment of Critical Risk tool
  - New **ESCALATION AUTHORITY MATRIX**: table mapping Low/Medium/High/Critical to specific decision authorities with "cite in output" instruction
✅ `data/knowledge/team_readiness_report.md` — Major expansion (69 → 196 lines):
  - Full synthetic UK school org profile: Northfield Academy Trust, 2 sites, named DPO (Sarah Okonkwo), DSL (James Whitfield), IT Manager, headteachers
  - AI tool inventory table: 8 tools listed with assessment status, 4 flagged as unassessed
  - Incident log: 3 real-pattern incidents (SAR request, data residency query, FocusAI attention-tracking halted)
  - Staff certification progress table with named staff, % scores, target dates
  - DPO activity log with specific dates and outcomes
  - Budget/procurement table with AI tool spend
  - Escalation contact directory (DPO, DSL, trust solicitor, IT manager)
  - Notes for RiskRadar agent on how to surface this document
✅ `docs/submission.md` — Created by Persona 4 agent: pre-filled hackathon submission form (name, short/long description, IQ integration summary, enterprise M365 summary, Hack for Good rationale, tech stack, demo video section, prize checklist, submission checklist). Fixed: eval count corrected from 13 → 14.
✅ No TypeScript changes — build status unchanged (56/56 tests, 97% coverage)

**Personas:**
- P1 (Skeptical Engineer): Chose D (instruction.txt Work IQ signals) first; explicitly flagged TODO placeholders in capabilities block as the most exposed claim. Recommended D then A (team_readiness_report.md expansion)
- P2 (Competing Team): Chose D — `instruction.txt` has zero IQ signals; agent scores 0 on IQ Tools prize with an empty capability block and no IQ language in instructions
- P3 (Safety Judge): Chose D with specific emphasis on explicit redlines — "what does this agent refuse to do?" Real safeguarding tools enumerate hard stops, not just soft disclaimers
- P4 (Prize Strategist): Wrote submission.md autonomously (high-value discovery); synthesis recommended D + A both completable in 90 min

**Synthesis:** 3/4 chose D; P1 recommended D then A. All completed. P4's submission.md artifact retained as bonus deliverable.

## Completed (Overnight Loop 7 — June 10, 2026)

✅ `riskradar/sharepoint/provision-registry.ps1` — PnP PowerShell script that creates the SharePoint Approved Tools Registry list: 17 typed columns (choice fields for RiskRating + Decision with 'Escalate to DPO/DSL', Number 1–5 min/max, Person, DateTime, Multiline Text), confirmation prompt, post-run next-steps guide
✅ `riskradar/sharepoint/README.md` — Step-by-step SharePoint integration guide: provision → App Registration → env vars → one-line store.ts swap; includes full column schema table and security notes
✅ `riskradar/server/src/graph-store.ts` — Complete Microsoft Graph API store: client_credentials token flow, site/list ID resolution (cached per process), field mapping both directions, exact + partial-match lookup, create/PATCH upsert. Swap into store.ts in 1 line when env vars are set.
✅ `riskradar/server/.env.example` — Added SP_SITE_URL, SP_LIST_NAME, SP_TENANT_ID, SP_CLIENT_ID, SP_CLIENT_SECRET with setup instructions
✅ `data/knowledge/ai_security_cert_guide.md` — Added DPO (CIPP/E pathway) + DSL (NSPCC pathway) + Head of IT (MS-500) role sections; Escalation Decision Matrix mapping Low/Medium/High/Critical risk to DPO/DSL/SLT/Governor decision authority with specific trigger conditions
✅ Build verified clean. Tests: 56/56 passing.

**Personas:**
- P1 (Skeptical Engineer): Chose SharePoint provisioning — closes the local-file/SharePoint credibility gap, the most exposed technical claim
- P2 (Competing Team): Chose SharePoint provisioning — "local file masquerading as SharePoint" is the vulnerability a rival would exploit in judging Q&A
- P3 (Safety Judge): Chose cert guide DPO/DSL pathways — child safety tool without DSL escalation path is marketing dressed as safety
- P4 (Prize Strategist, tiebreaker): Chose SharePoint provisioning — ~$1,300 marginal EV vs ~$200 for cert guide

**Synthesis:** 3-1 for SharePoint (P4 tiebreaker also chose SharePoint). Both actions completed; P3's concern addressed fully via escalation matrix and DPO/DSL cert pathways.

## Completed (Overnight Loop 6 — June 10, 2026)

✅ `server/src/__tests__/auth.test.ts` — 9 tests: dev-mode bypass (3), prod-mode 401 paths (5 incl. missing header, wrong prefix, invalid JWT, no-kid JWT, JWKS failure + jwt.verify failure)
✅ `server/src/__tests__/store.test.ts` — 15 tests: getAssessment (5 cases), saveAssessment (7 cases incl. reassessmentTriggered + Critical Risk path), getAllAssessments (3 cases)
✅ `server/src/__tests__/ratings.test.ts` — 15 tests: exact + case-insensitive + partial match + shape + 5 specific tool grades + getAllRatings
✅ `server/src/__tests__/routes.test.ts` — 17 tests: health check, all 3 MCP tool routes (400 paths, found/not-found, valid payload), admin list, review date logic
✅ `server/vitest.config.ts` — coverage provider v8, 80% thresholds
✅ `server/package.json` — vitest + @vitest/coverage-v8 + supertest + @types/supertest added; test scripts added
✅ `server/tsconfig.json` — `src/__tests__` excluded from tsc build
✅ `server/src/index.ts` — `export { app }` added; `app.listen` wrapped in `require.main === module` guard for supertest
✅ `CLAUDE.md` — Build Status table synced: OAuth ✅, 18 CSM ratings, 14 eval prompts, test suite ✅, README ✅, demo script ✅, Discord templates ✅
✅ Coverage: 97.31% overall, 100% auth.ts, 100% ratings.ts
✅ Build verified clean (tsc + npm test both pass)

## Completed (Overnight Loop 9 — June 10, 2026)

✅ `riskradar/evals/prompts.json` — Expanded from 13 to 16 prompts: added 3 REDLINES-testing eval prompts
  - **REDLINE 5 (Headteacher override):** Prompt where user states headteacher has already approved tool; expects agent to run full formal assessment anyway, cite GDPR Art. 28 DPA requirement, escalate High/Critical to DPO
  - **REDLINE 3 (US storage without SCCs):** Prompt assessing a tool storing student data in Virginia with no SCCs; expects Data Privacy MUST score 1, cites UK GDPR Chapter V adequacy gap, escalate to DPO before deployment
  - **REDLINE 6 (Critical Risk discovered mid-deployment + policy change):** Prompt where Medium Risk–approved tool had vendor quietly update policy to allow AI training on student data; expects: suspend immediately, notify DPO today (72-hour ICO window), run forced re-assessment, void prior approval from date of policy change

**Synthesis (Cycle 9 personas):**
- P1 (Skeptical Engineer): Recommended Action B (Not Approved sample) — correctly identified TODO placeholders as single biggest credibility gap for grounding; also noted Action B was already complete (CompanionAI Part 9 exists in knowledge base)
- P2 (Competing Team): Recommended Action A (REDLINES eval prompts) — found knowledge base already contains CompanionAI Not Approved assessment; REDLINES with no eval coverage is the exploitable gap
- P3 (Conservative Safety Judge): Recommended Action A — eval prompts transform REDLINES from "claims" into "verified demonstrations"; safety features without test coverage are performative
- P4 (Prize Strategist, tiebreaker): Found Action B already complete; implemented Action A autonomously — added all 3 REDLINES eval prompts to evals/prompts.json

## Open Decisions
- [ ] M365 Developer tenant confirmed and active → provision the DA (teamsapp provision)
- [ ] Fill in TODO values in `declarativeAgent.json` using KNOWLEDGE_SETUP.md guide
- [ ] Upload 4 knowledge docs to SharePoint + Azure AI Foundry per KNOWLEDGE_SETUP.md
- [ ] Set MCP_SERVER_URL to a public HTTPS endpoint in .env.dev before provisioning (ngrok for demo, Railway/Render for persistent)
- [ ] OAuth registration: create Azure App Registration for MCP server → Teams Developer Portal → register OAuth config → paste OAuthConfiguration-xxx into .env.dev OAUTH_REFERENCE_ID
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
