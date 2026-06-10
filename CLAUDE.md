# Agents League Hackathon — Claude Code Context

> **THE ONLY GOAL IS TO WIN.** Every decision in this project — architecture, scope, framing, what to build next — must be evaluated against a single question: does this maximise the probability of winning a prize? If something is technically elegant but doesn't move the needle on the judging rubric, deprioritise it. If something is messy but wins, do it. The prize structure is below. Read it before making any decision.

---

## Multi-Prize Strategy

| Prize | Value | How to Win It |
|-------|-------|---------------|
| 🏆 Best Overall Agent | $16,468 | Strongest submission across all criteria |
| 💼 Best Enterprise Agent | $6,468 | Deepest, most credible M365 integration |
| 💡 Best Use of IQ Tools | $6,468 | Real Foundry IQ + Work IQ — grounded, cited answers |
| 🎗️ Hack for Good | $1,468 | Credible child/school safety framing |

**Maximum reachable: ~$30,404**

Prizes stack. Do not optimise for one at the expense of two. Every build decision should be evaluated across all four prize vectors simultaneously.

---

## Judging Rubric

| Criterion | Weight | What Moves This Score |
|-----------|--------|-----------------------|
| Accuracy & Relevance | 20% | Grounded, cited responses from knowledge base (Foundry IQ) |
| Reasoning & Multi-step Thinking | 20% | 6-step workflow, conditional logic, MCP tool chaining |
| Reliability & Safety | 20% | No hallucinations, human-in-the-loop framing, error handling |
| Creativity & Originality | 15% | School AI safety — uncommon domain, clear real need |
| User Experience & Presentation | 15% | Demo video quality, conversation flow naturalness |
| Community Vote (Discord) | 10% | Post in Discord, explain the Hack for Good angle |

---

## Subagent Orchestration — MANDATORY

**Before committing to any significant technical or strategic decision, spawn four critical analysis agents in parallel.** Do not proceed on gut instinct. Do not skip this step because it feels obvious.

Significant decisions include:
- Any architectural choice that can't be easily reversed
- Choosing between two valid technical approaches
- Scoping what to cut vs what to build when time is short
- Framing choices for the submission or demo

### The Four Mandatory Critical Personas

Spawn all four as sub-agents, in parallel, whenever a significant decision needs validating. Each receives the decision context. Each argues from their perspective. Then you synthesise — and when in doubt, the Prize Strategist (Persona 4) breaks the tie.

---

**Persona 1: Skeptical Microsoft Engineer**

> You are a senior Microsoft engineer reviewing hackathon submissions. You have deep knowledge of M365 Copilot extensibility, the Declarative Agent schema, Azure AI Foundry, and the IQ layer architecture. Your job is to punch holes in technical claims. You are looking for: fake integrations dressed as real ones, knowledge sources that aren't actually connected, MCP tools that are mocked, IQ layers that are referenced in a README but not implemented. You are not impressed by ambition — you are impressed by things that actually work as described. Evaluate the decision from this angle and identify the single most likely technical failure point.

---

**Persona 2: The Competing Team**

> You are a rival team in the same Enterprise Agents track. You have been building for three days. Your submission is strong. Your job is to look at this project's current state and identify: what would beat it, what weaknesses a strong competing submission would exploit, and what decisions this team is making that you would not make. Be ruthless and specific. Assume the judges will see 20 other submissions and will compare directly. What does this project need to do differently to beat you?

---

**Persona 3: Conservative Responsible AI Judge**

> You are a judge focused specifically on the Reliability & Safety criterion (20% of score). You are sceptical of AI products that claim to protect children without credible evidence. You look for: overclaiming, demos that work only on happy paths, agents that present outputs as decisions rather than inputs to human judgment, framing that is marketing dressed as safety. You are the reason responsible AI criteria exist. Evaluate the decision from a safety and credibility standpoint — would this embarrass the judges who approved it six months later?

---

**Persona 4: Prize Strategist**

> You are a hackathon veteran who has won six competitions. Your only concern is expected prize value. You understand the scoring rubric, the prize structure, and the time remaining (deadline: June 14, 2026). You do not care about technical elegance. You do not care about production-readiness beyond what judges will see in a demo. Your job is to evaluate the decision purely in terms of: does this action increase or decrease the probability of winning each of the four available prizes? Quantify if possible. Recommend the action that maximises total expected prize value given the remaining time.

---

### How to Use the Personas

1. Spawn all four in parallel with the same context and decision framing
2. Read all four responses before deciding
3. Look for consensus — if three agree, that is the answer
4. If they disagree, use Persona 4 (Prize Strategist) as the tiebreaker
5. Document the decision and rationale in the strategy memory file

---

## Competition Overview

- **Event**: Agents League Hackathon, hosted by Microsoft
- **Dates**: June 4–14, 2026
- **Track**: 💼 Enterprise Agents (Microsoft 365 Copilot)
- **Winners announced**: June 30, 2026
- **Submission deadline**: June 14, 2026

---

## The Project: RiskRadar

**One line:** A Declarative Agent in Microsoft 365 Copilot that helps school IT administrators systematically assess the safety and privacy risks of AI tools before deploying them to students.

### The Problem

Teachers are adopting AI tools into classrooms weekly. School IT admins have no systematic process to evaluate whether a tool is safe for students — data handling, age appropriateness, GDPR compliance, bias risk. Decisions happen ad hoc or not at all. No credible substitute exists for this specific workflow in the UK school context.

### What the Agent Does

1. IT admin opens M365 Copilot Chat and names a tool to assess
2. Agent checks the existing Approved Tools Registry (via MCP) for prior assessments
3. If new: conducts a 6-step NIST AI RMF structured conversation
4. Scores across 5 dimensions using the knowledge base for criteria (grounded, cited)
5. Calls vendorLookup MCP tool → Common Sense Media EdTech privacy rating
6. Calls saveAssessment MCP tool → writes to SharePoint Approved Tools Registry
7. Delivers risk rating (Low/Medium/High/Critical), recommendation, AUP clause if approved
8. Explicitly states: output supports human judgment, does not replace it

### Why This Wins

- **Accuracy & Relevance (20%):** Foundry IQ knowledge base → grounded answers citing NIST AI RMF, ICO, EU AI Act
- **Reasoning (20%):** 6-step conditional workflow, tool chaining, prior-assessment awareness
- **Reliability & Safety (20%):** Human-in-the-loop framing, no false verdicts, escalation paths
- **Creativity (15%):** School AI safety — no other submission is likely in this domain
- **UX (15%):** Real conversation starters, natural dialogue not a form
- **Hack for Good ($1,468):** Direct child protection framing is credible and specific

---

## Technical Architecture

### Declarative Agent

Built with Microsoft 365 Agents Toolkit. No custom AI compute. Runs on M365 Copilot infrastructure at zero compute cost.

**Files:**
- `riskradar/appPackage/declarativeAgent.json` — DA manifest, instructions, knowledge sources, actions
- `riskradar/appPackage/instruction.txt` — Full agent instructions (6-step workflow, scoring, tool guidance)
- `riskradar/appPackage/ai-plugin.json` — 3 MCP tools defined (getAssessment, saveAssessment, vendorLookup)
- `riskradar/appPackage/manifest.json` — Teams app manifest v1.27
- `riskradar/m365agents.yml` — ATK provision/publish pipeline
- `riskradar/env/.env.dev` — TEAMS_APP_ID and Azure credentials (never commit secrets)

### IQ Integration

| IQ Layer | Role | Status |
|----------|------|--------|
| **Foundry IQ** | Knowledge base grounding: NIST AI RMF, ICO guidance, OWASP AI Top 10, scoring rubric | ⚠️ Documents exist, not yet uploaded to Foundry |
| **Work IQ** | Tenant context: M365 signals, existing approved tools | ⚠️ Native to DA, not yet explicitly wired |

### MCP Server (TypeScript)

Located at: `riskradar/server/`

| Tool | Endpoint | What it does |
|------|----------|-------------|
| `getAssessment` | POST /api/getAssessment | Retrieve prior assessment from registry |
| `saveAssessment` | POST /api/saveAssessment | Write completed assessment to registry |
| `vendorLookup` | POST /api/vendorLookup | Common Sense Media privacy rating (12 tools pre-loaded) |

All three tools tested and working. Server builds clean. File-persisted assessment store at `server/data/assessments.json`.

### Bonus Criteria

| Bonus | Status |
|-------|--------|
| MCP Apps | ✅ Scaffolded via ATK MCP server path |
| External MCP Server read | ✅ getAssessment implemented |
| External MCP Server write | ✅ saveAssessment implemented |
| OAuth on MCP | ✅ Built | Bearer token middleware + OAuthPluginVault in ai-plugin.json |

---

## Current Build Status

| Component | Status | Notes |
|-----------|--------|-------|
| DA instructions | ✅ Complete | `instruction.txt` — full 6-step workflow |
| DA manifest | ✅ Complete | Conversation starters, action linked, capabilities block |
| MCP tool definitions | ✅ Complete | `ai-plugin.json` — all 3 tools + OAuthPluginVault auth block |
| MCP server | ✅ Built and tested | Express, TypeScript, OAuth middleware, file persistence |
| OAuth on MCP server | ✅ Built | Bearer token middleware (JWKS/Azure AD) + OAuthPluginVault |
| Common Sense Media ratings | ✅ 18 tools | ChatGPT, Grammarly, Khan Academy, Turnitin, Notion AI, etc. |
| Evaluation prompts | ✅ 14 prompts | `evals/prompts.json` — incl. Critical Risk, EU AI Act, edge cases |
| Test suite | ✅ Built | Vitest, 56 tests, 97% coverage (auth/store/ratings/routes) |
| README | ✅ Complete | `riskradar/README.md` with Mermaid architecture diagram |
| Demo script | ✅ Complete | `docs/demo-script.md` — full narrated recording guide |
| Discord post templates | ✅ Complete | `docs/discord-post.md` — 3 templates with Hack for Good angle |
| Knowledge base docs | ✅ 4 documents, 750+ lines | `data/knowledge/` — 3 sample assessments incl. Critical Risk |
| Knowledge source in DA manifest | ✅ Configured | TODO placeholders in place; fill in per KNOWLEDGE_SETUP.md |
| DA provisioned in M365 | ❌ Not yet | Requires M365 dev tenant + `teamsapp provision` |
| Foundry IQ knowledge base live | ❌ Not yet | 4 docs exist, need uploading per KNOWLEDGE_SETUP.md |
| Demo video | ❌ Not yet | June 13 target — use `docs/demo-script.md` |

---

## Knowledge Documents (ready to upload to Foundry IQ)

Located at: `data/knowledge/`

| File | Content |
|------|---------|
| `risk_assessment_frameworks.md` | NIST AI RMF four functions, 5-dimension scoring rubric, ICO Children's Code, EU AI Act |
| `owasp_ai_top10.md` | OWASP Top 10 for LLMs (LLM01–LLM10) |
| `ai_security_cert_guide.md` | AI security cert guide for school roles |
| `team_readiness_report.md` | Synthetic quarterly readiness report (synthetic data, safe to share) |

---

## Build Schedule

| Day | Priority | Goal |
|-----|----------|------|
| June 9 | ✅ Done | DA scaffold, MCP server built and tested |
| June 10 | 🔴 Critical | M365 dev tenant → provision DA → Foundry IQ knowledge base live |
| June 11 | 🔴 Critical | Knowledge source wired in DA manifest → test grounded responses |
| June 12 | 🟡 High | OAuth on MCP; end-to-end demo flow; Discord post |
| June 13 | 🟡 High | Demo video; README with architecture diagram |
| June 14 | 🟠 Hard deadline | Submit by EOD |

---

## Hack for Good Framing

"RiskRadar gives every school in the country a systematic, free process for protecting students from harmful AI tools — replacing ad hoc decisions with a credible, auditable framework that scales without consultancy cost."

The re-assessment trigger is the responsible AI story: protection doesn't expire when the vendor updates its terms.

---

## What Must Never Be Committed

- `.env` files with real credentials
- Azure API keys, connection strings, TEAMS_APP_ID (write to `.env.dev`, not source)
- Real student data or PII
- Customer or employee data of any kind

---

## Memory Files

Located at `.claude/memory/` — read before starting work, update when decisions are made.

| File | Content |
|------|---------|
| `strategy.md` | Build status, locked decisions, prize vectors |
| `tech-decisions.md` | Architecture decisions and rationale |
| `ideas.md` | Idea evaluation results |
| `competition-context.md` | Track rubric, IQ layers, requirements |
