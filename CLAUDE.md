# Agents League Hackathon — Claude Code Context

## Competition Overview

- **Event**: Agents League Hackathon, hosted by Microsoft
- **Dates**: June 4–14, 2026 — **5 days remaining** (today is June 9)
- **Track**: 💼 Enterprise Agents (Microsoft 365 Copilot)
- **Winners announced**: June 30, 2026

## Multi-Prize Strategy

| Prize | Value | How |
|-------|-------|-----|
| 🏆 Best Overall Agent | $16,468 | Strongest overall submission |
| 💼 Best Enterprise Agent | $6,468 | Win the track |
| 💡 Best Use of IQ Tools | $6,468 | Deep integration of Foundry IQ + Work IQ |
| 🎗️ Hack for Good | $1,468 | Direct child protection through systematic AI tool review |

**Maximum reachable: ~$30,404**

---

## The Project: RiskRadar

**One line:** A Declarative Agent in Microsoft 365 Copilot that helps school IT administrators systematically assess the safety and privacy risks of AI tools before deploying them to students.

### The Problem

Teachers are adopting AI tools into classrooms weekly. School IT admins have no systematic process to evaluate whether a tool is safe for students — data handling, age appropriateness, GDPR compliance, bias risk. Decisions happen ad hoc or not at all. No credible substitute exists for this specific workflow.

### What the Agent Does

1. IT admin asks: "Is [tool name] safe to deploy to students?"
2. Agent walks through a structured NIST AI RMF-based risk conversation (not a form — a dialogue)
3. Scores the tool across: data privacy, age appropriateness, bias risk, transparency, vendor accountability
4. Generates a scored risk assessment with cited sources from the knowledge base
5. Writes outcome to an **Approved Tools registry** in SharePoint (via MCP) — the audit trail DPOs and governors need
6. Surfaces prior assessments if the same tool is requested again — gets smarter over time
7. Triggers re-assessment alerts when vendors update privacy policies or terms
8. Optional output: generates a suggested AUP clause for the approved tool (PolicyCraft integration)

### Judge Design Constraints (from persona review)

- **Framing must be clear:** agent output is input to a human decision, not a final verdict — avoids false confidence harm
- **Output must be action-oriented:** write to Approved Tools registry, not just a PDF report
- **Re-assessment triggers:** automated alerts when tool updates data practices (vendor freshness)
- **Work IQ must be real:** pull actual tenant context (what's already approved, who approved it)

---

## Technical Architecture

### Development Approach: Declarative Agent (DA)

Manifest-based agent in M365 Agents Toolkit. No custom AI compute — runs on M365 Copilot infrastructure. Zero Azure OpenAI cost.

### IQ Integration

| IQ Layer | Role |
|----------|------|
| **Foundry IQ** | Knowledge base: NIST AI RMF, ICO AI guidance, COPPA/GDPR for minors, responsible AI principles, OWASP AI Top 10 |
| **Work IQ** | Tenant context: existing approved tools, who approved them, organisational role of requester |

### MCP Server (TypeScript — bonus criteria)

| Operation | What it does |
|-----------|-------------|
| **Read** | Retrieve existing tool assessments from the registry |
| **Write** | Store new risk assessment outcomes to SharePoint |
| **Read** | Vendor privacy policy lookup (external) |
| **OAuth** | Authenticated vendor privacy lookup — hits explicit bonus scoring tier |

### Bonus Criteria Coverage

| Bonus | Status |
|-------|--------|
| MCP Apps | ✅ |
| External MCP Server (read + write) | ✅ |
| OAuth on MCP | ✅ (vendor privacy lookup) |

---

## Track Requirements

**Required (hard):**
1. ✅ Agent hosted in Microsoft 365 Copilot Chat
2. ✅ Microsoft IQ integration (Foundry IQ + Work IQ)

**Per Enterprise Agents Starter Kit:**
- Declarative Agent built with Microsoft 365 Agents Toolkit + VS Code
- Agent can target Copilot Free (no paid Copilot licence needed for users)
- External MCP server integration for read/write operations

---

## Prerequisites Needed

- [ ] **M365 Developer tenant** — [developer.microsoft.com/microsoft-365/dev-program](https://developer.microsoft.com/microsoft-365/dev-program) (free, instant, 90-day E5)
- [ ] **Microsoft 365 Agents Toolkit** — VS Code extension: "Microsoft 365 Agents Toolkit"
- [ ] **Node.js LTS** — for DA scaffolding and MCP server
- [x] **Azure account** — created (needed for Foundry IQ knowledge base)
- [ ] **VS Code** — with ATK extension installed

---

## Judging Rubric

| Criterion | Weight |
|-----------|--------|
| Accuracy & Relevance | 20% |
| Reasoning & Multi-step Thinking | 20% |
| Reliability & Safety | 20% |
| Creativity & Originality | 15% |
| User Experience & Presentation | 15% |
| Community Vote (Discord) | 10% |

---

## Build Schedule

| Day | Goal |
|-----|------|
| June 9 | M365 Dev tenant live, VS Code + ATK installed, DA project scaffolded |
| June 10 | DA manifest complete, Foundry IQ knowledge base uploaded and live |
| June 11 | TypeScript MCP server — read + write to SharePoint assessment store |
| June 12 | OAuth on vendor MCP, Work IQ wired, end-to-end demo flow working |
| June 13 | Demo video, README with architecture diagram |
| June 14 | Submit |

---

## File Structure (target)

```
agents-league/
├── CLAUDE.md
├── README.md
├── declarative-agent/
│   ├── appPackage/
│   │   ├── manifest.json
│   │   └── declarativeAgent.json   ← instructions + knowledge sources
│   └── env/
│       └── .env.dev
├── mcp-server/                     ← TypeScript, bonus criteria
│   ├── src/
│   │   ├── index.ts
│   │   ├── tools/
│   │   │   ├── getAssessment.ts
│   │   │   ├── saveAssessment.ts
│   │   │   └── vendorLookup.ts
│   │   └── auth/
│   │       └── oauth.ts
│   ├── package.json
│   └── tsconfig.json
└── data/
    └── knowledge/                  ← Foundry IQ sources (carry over)
        ├── owasp_ai_top10.md
        ├── ai_security_cert_guide.md
        └── team_readiness_report.md
```

---

## Hack for Good Framing

"RiskRadar gives every school in the country a systematic, free process for protecting students from harmful AI tools — replacing ad hoc decisions with a credible, auditable framework that scales without consultancy cost."

The re-assessment trigger is the responsible AI story: protection doesn't expire when the vendor updates its terms.

---

## What the Python Work Produced That Carries Over

- `data/knowledge/` — three documents feed directly into Foundry IQ
- Domain knowledge: NIST AI RMF, OWASP AI Top 10, ICO guidance — all still needed
- Hack for Good and AI security narrative — unchanged
