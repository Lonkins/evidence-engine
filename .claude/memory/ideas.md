---
name: ideas
description: Idea evaluation results — RiskRadar selected as the winning concept
metadata:
  type: project
---

## Status: DECIDED — RiskRadar (Idea C) selected

Judge-persona review completed June 9, 2026. All four judges independently scored RiskRadar 8.5/10.

## Final Scores

| Idea | MS PM | Engineer | CIO | Resp. AI | Total |
|------|-------|----------|-----|----------|-------|
| **C — RiskRadar** | **8.5** | **8.5** | **8.5** | **8.5** | **34.0** |
| B — PolicyCraft | 7.5 | 6.5 | 7.5 | 7.5 | 29.0 |
| D — GrantFinder | 6.5 | 5.5 | 7.0 | 6.0 | 25.0 |
| A — CyberReady | 5.5 | 7.5 | 5.0 | 7.0 | 25.0 |
| E — SafeSchoolAI | 4.5 | 4.0 | 4.0 | 5.0 | 17.5 |

## Why RiskRadar Won

- Solves a problem actively on fire: teachers adopting AI tools weekly, no systematic process exists
- Real bidirectional MCP (read AND write to assessment store) — not a RAG wrapper
- NIST AI RMF framework gives agent methodological credibility judges can inspect
- Audit trail in SharePoint serves IT admin, DPO, and governors simultaneously
- Direct child protection benefit — Hack for Good framing is earned, not inflated
- No credible substitute ("why not Microsoft Learn" doesn't apply here)

## Key Design Constraints from Judges

**False confidence trap** (Responsible AI): Agent output must be framed as INPUT to a human decision, not a final verdict. Add mandatory re-assessment triggers when vendors update privacy policies.

**Static output problem** (PM + CIO): Risk report alone is weak demo. Outcome must be action-oriented — write to an Approved Tools registry, not just generate a PDF.

**Work IQ must be real** (Engineer): Cannot be a manually populated list. Must pull genuine tenant context — who approved what, what's already in use.

**OAuth on MCP** (PM): Add OAuth on vendor privacy lookup to hit the explicit bonus scoring tier.

## Eliminated Ideas

- **SafeSchoolAI (E)**: Every judge said scope kills credibility. A DA is the wrong primitive for multi-mode routing.
- **CyberReady (A)**: "Why not just use Microsoft Learn?" — no good answer.
- **GrantFinder (D)**: Live API execution risk too high; IQ layer too thin.
- **PolicyCraft (B)**: Best fate is a companion capability inside RiskRadar, not standalone.

## PolicyCraft Integration Opportunity

The top design addition from the CIO: *"Once a tool is approved, here's the policy clause to add to your AUP."* This integrates PolicyCraft's value into RiskRadar's output without requiring a separate submission. One agent, complete governance story.
