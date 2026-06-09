---
name: overnight-log
description: Log of autonomous overnight loop cycles — what was done, persona recommendations, and next cycle priorities
metadata:
  type: project
---

## Cycle 1 — June 9/10, 2026

**What was worked on:** Knowledge source capabilities block, eval prompt expansion, CSM ratings expansion.

**Persona recommendations:**
- *Skeptical Microsoft Engineer (P1):* Capabilities block #1; OAuth on LocalPlugin/localhost is "real code that proves nothing" — M365 OAuth requires HTTPS + OAuthPluginVault, not viable without Azure deployment. Strongly recommended capabilities block.
- *Competing Team (P2):* Capabilities block #1; no knowledge source means the agent is just the base model with tools, directly undercuts Accuracy & Relevance (20%) and IQ Tools prize.
- *Conservative Safety Judge (P3):* Eval expansion #1 for Reliability & Safety (20%); but also flagged that no knowledge source means ungrounded answers, which is exactly the overclaiming this criterion targets.
- *Prize Strategist (P4):* Capabilities block #1 at ~$1,600-1,900 expected prize value; OAuth ranked #2 at ~$900-1,100 but blocked by deployment constraints.

**Tiebreaker:** Prize Strategist (P4) → Capabilities block.

**What was built:**
1. `declarativeAgent.json` — added `capabilities` block: `OneDriveAndSharePoint` (Work IQ, SharePoint knowledge folder) + `GraphConnectors` (Foundry IQ, Azure AI Search connection) with TODO markers for real resource IDs
2. `appPackage/KNOWLEDGE_SETUP.md` — actionable step-by-step guide for filling in both TODO values (SharePoint URL + Graph Connector connection ID) and uploading the 4 knowledge documents
3. `evals/prompts.json` — expanded from 7 to 14 prompts; new edge cases: already-deployed Critical Risk scenario, EU AI Act prohibited tools (emotion recognition/webcam), tool not in CSM database, vendor refusing DPA, vendor policy change triggering reassessment, home-use boundary question
4. `server/src/ratings.ts` — expanded from 12 to 18 CSM ratings: Notion AI (C/54), BrainPOP (B/73), Nearpod (B/69), Google Classroom (A/86), Microsoft Teams for Education (A/85), Turnitin (D/42)
5. TypeScript build verified clean

**Critical insight from P1:** OAuth implementation should NOT be prioritised for autonomous cycles because the current `LocalPlugin`/localhost runtime cannot exercise OAuth in an M365 Copilot context. The correct OAuth path (OAuthPluginVault + HTTPS + Azure App Registration) requires human deployment steps. Attempting it autonomously produces "real code that proves nothing in a demo."

**Recommended next cycle priority:**
1. **README.md for riskradar/** — Mermaid architecture diagram showing Work IQ + Foundry IQ + MCP tools + human-in-the-loop flow. Judges read READMEs. ~60 min, pure Markdown.
2. **Knowledge document improvements** — Strengthen `data/knowledge/risk_assessment_frameworks.md` with more specific scoring criteria examples and clearer ICO Children's Code citation patterns.
3. **Human required:** Fill in TODO values in declarativeAgent.json per KNOWLEDGE_SETUP.md, then `teamsapp provision`.
