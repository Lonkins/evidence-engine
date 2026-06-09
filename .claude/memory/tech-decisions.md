---
name: tech-decisions
description: All locked technical decisions for RiskRadar — stack, APIs, auth, data sources
metadata:
  type: project
---

## Track and Approach

- Track: Enterprise Agents, Declarative Agent (DA) via Microsoft 365 Agents Toolkit
- No custom AI compute — runs on M365 Copilot infrastructure
- Zero Azure OpenAI cost

## Knowledge Source: Azure AI Search via Foundry IQ (LOCKED)

Chosen over DA native knowledge for technical correctness and judge credibility.

Path: Upload 4 knowledge docs to Azure AI Foundry → create knowledge base → index with Azure AI Search (free tier, 50MB, zero cost) → DA manifest references Azure AI Search connector.

This is a legitimate Foundry IQ integration claim. The Azure AI Search free tier covers our 4 files with headroom.

**Why:** More technically correct Foundry IQ claim than DA native sources. Engineer judge specifically values inspectable, honest integration. Free tier means no cost downside.

## Work IQ Integration

Native in M365 Copilot context. DA automatically receives user's org signals (identity, role, tenant context) via Work IQ. No separate configuration needed beyond correct scoping in the manifest. In the agent instructions we explicitly surface Work IQ context (who is asking, what their org context is).

## MCP Server (TypeScript — bonus criteria)

OAuth-protected. Three tools:

| Tool | Operation | Target |
|------|-----------|--------|
| `getAssessment` | Read | SharePoint list — Approved Tools registry |
| `saveAssessment` | Write | SharePoint list — Approved Tools registry |
| `vendorLookup` | Read | Common Sense Media EdTech Privacy ratings (public) |

**OAuth:** On the DA ↔ MCP Server connection. Satisfies the explicit OAuth bonus scoring tier.
The Common Sense Media fetch is a public endpoint from the MCP server side — no API key needed for basic use.

**Common Sense Media rationale:** Free, public, widely trusted, independently rates EdTech tools on privacy (A-F), COPPA/GDPR flags, data collection summaries. A real external data source that judges will recognise. Far stronger than a mocked vendor API.

## SharePoint List Schema (Approved Tools Registry)

| Field | Type | Description |
|-------|------|-------------|
| ToolName | Text | AI tool being assessed |
| VendorName | Text | Tool vendor |
| AssessmentDate | Date | When assessed |
| RiskScore | Number | Total score 5–25 |
| RiskRating | Choice | Low / Medium / High / Critical |
| DataPrivacyScore | Number | 1–5 |
| AgeAppropriatenessScore | Number | 1–5 |
| TransparencyScore | Number | 1–5 |
| BiasScore | Number | 1–5 |
| VendorAccountabilityScore | Number | 1–5 |
| Decision | Choice | Approved / Approved with Controls / Not Approved / Escalate |
| ReviewDate | Date | When to re-assess |
| AssessedBy | Person | M365 user who ran assessment |
| AUPClause | Multiline Text | Suggested AUP clause if approved |
| Notes | Multiline Text | Additional context |
| CommonSenseRating | Text | A/B/C/D/F from Common Sense Media |
| ReassessmentTrigger | Boolean | Flagged for re-assessment |

## DA Instructions Design

Instructions live in `declarativeAgent.json`. Key sections:
1. Persona: RiskRadar, school AI tool risk assessor
2. Workflow: 6-question conversation → score → store via MCP → output
3. Knowledge reference: ground scoring in risk_assessment_frameworks.md
4. MCP tool invocation: when to call getAssessment, saveAssessment, vendorLookup
5. Output format: scored assessment, risk rating, recommendation, AUP clause if approved

Engineer judge noted ~8k token effective limit on DA instructions — keep concise.

## TypeScript Comfort

Tom is comfortable with TypeScript. Claude agents write, Tom reviews and directs.

## Build Order

1. M365 tenant + ATK → scaffold DA project
2. Azure AI Foundry → knowledge base → upload 4 docs → Azure AI Search index
3. DA manifest: instructions + knowledge source connector + MCP reference
4. TypeScript MCP server: scaffold → tools → SharePoint write → Common Sense Media fetch
5. OAuth on MCP server
6. End-to-end test → demo video → README
