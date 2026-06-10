# Handoff Brief — RiskRadar: Foundry IQ Knowledge Integration

**For:** High-skill reasoning agent
**Working directory:** `/Users/tomprice/Documents/Projects/agents-league/`
**Deadline:** June 14, 2026 — approximately 5 days
**Priority:** This is the single most important remaining technical task

---

## The Only Goal

Win the Agents League Hackathon (Microsoft, June 4–14, 2026). Specifically: win as many of these four prizes as possible:

| Prize | Value |
|-------|-------|
| Best Overall Agent | $16,468 |
| Best Enterprise Agent | $6,468 |
| Best Use of IQ Tools | $6,468 |
| Hack for Good | $1,468 |

Every decision you make — including the architectural decision in this brief — must be evaluated against that prize table. Do not optimise for elegance. Optimise for winning.

---

## What Has Been Built

A Declarative Agent (DA) called **RiskRadar** that runs inside Microsoft 365 Copilot Chat. It helps school IT administrators assess AI tools for safety before deploying them to students.

**Already complete and working:**

- `riskradar/appPackage/instruction.txt` — Full agent instructions: 6-step NIST AI RMF conversation workflow, 5-dimension scoring rubric, MCP tool invocation guidance
- `riskradar/appPackage/declarativeAgent.json` — DA manifest with 4 conversation starters, action linked to MCP tools
- `riskradar/appPackage/ai-plugin.json` — 3 MCP tools defined: `getAssessment`, `saveAssessment`, `vendorLookup`
- `riskradar/appPackage/manifest.json` — Teams app manifest v1.27
- `riskradar/server/` — TypeScript Express MCP server, all 3 tool endpoints tested and passing
- `riskradar/server/src/ratings.ts` — Common Sense Media EdTech privacy ratings pre-loaded for 12 tools
- `riskradar/evals/prompts.json` — 7 evaluation prompts

The DA scaffold was created via Microsoft 365 Agents Toolkit (ATK). The project lives at `/Users/tomprice/AgentsToolkitProjects/RiskRadar/` (the ATK-managed project) and is mirrored at `riskradar/` inside this repo.

**What does NOT exist yet:**
- The DA has not been provisioned in M365 (no `TEAMS_APP_ID` set)
- The knowledge base has NOT been uploaded to Azure AI Foundry
- The DA manifest has NO knowledge source configured — the `capabilities` block in `declarativeAgent.json` is absent
- OAuth on the MCP server is not implemented

---

## Your Task

This is a two-phase task. Complete Phase 1 first. Phase 2 depends on Phase 1 output.

---

### Phase 1 — Decide: Foundry IQ vs SharePoint vs Both

**The decision:** How should the DA's knowledge base be connected, and what does that mean for the `declarativeAgent.json` `capabilities` block?

The judging criterion in play is: **Best Use of IQ Tools ($6,468)** — plus **Accuracy & Relevance (20% of overall score)** which requires grounded, cited answers.

There are three candidate approaches. You must reason through them and choose:

---

**Option A: SharePoint (OneDriveAndSharePoint capability)**

Upload the 4 knowledge documents to a SharePoint library in the M365 developer tenant. Reference them in `declarativeAgent.json` via:

```json
"capabilities": [
  {
    "name": "OneDriveAndSharePoint",
    "items_by_url": [
      { "url": "https://{tenant}.sharepoint.com/sites/{site}/Shared%20Documents/{folder}" }
    ]
  }
]
```

- **Pros:** Simpler. Works immediately. No Azure AI Foundry setup needed. Reliable.
- **Cons:** This is Work IQ territory (M365 content), not Foundry IQ. The "Best Use of IQ Tools" prize specifically asks about Foundry IQ. A judge who knows the IQ layer taxonomy may penalise this.

---

**Option B: Azure AI Foundry (Foundry IQ via Azure AI Search)**

Create an Azure AI Foundry hub and project. Upload the 4 documents. Foundry creates an Azure AI Search index. Connect the DA to it via:

```json
"capabilities": [
  {
    "name": "GraphConnectors",
    "connections": [
      { "connection_id": "{azure-ai-search-connection-id}" }
    ]
  }
]
```

OR the Foundry IQ connection might use a different capability name — this requires investigation.

- **Pros:** Directly demonstrates Foundry IQ. Strongest claim for "Best Use of IQ Tools" prize. More technically impressive.
- **Cons:** More setup. Azure AI Search free tier limits (50MB, 3 indexes, 10k docs) — needs verification. The exact `capabilities` schema for connecting a DA to Foundry IQ is not fully documented and needs research.

---

**Option C: Both — SharePoint for Work IQ, Foundry for Foundry IQ**

Upload the same documents to both. Configure both capabilities. In the demo, explicitly call out: "The agent uses Work IQ (SharePoint knowledge base) and Foundry IQ (Azure AI Search index) simultaneously."

- **Pros:** Demonstrates both IQ layers, which is the explicit requirement. Maximises "Best Use of IQ Tools" score. Stronger narrative.
- **Cons:** More setup. More potential failure points. More time.

---

**Before deciding, do this:**

**Spawn four critical analysis agents in parallel** with the decision context above. Each agent must adopt one of these personas and argue from that perspective:

1. **Skeptical Microsoft Engineer** — Which approach is technically correct? Which approach risks being challenged by a judge who knows the M365 platform? What is the single most likely failure point in each option?

2. **Competing Team** — You're a rival team. Which option are you most afraid this team chooses? Which option would be easy to beat in the judging?

3. **Conservative Responsible AI Judge** — From a reliability and safety scoring perspective (20% of marks), which option results in the most grounded, reliably cited agent responses? Which option most risks hallucinated sources?

4. **Prize Strategist** — Given approximately 4 working days remaining, which option maximises total expected prize value across all four prizes? Time-box each option realistically.

Synthesise their responses. When they conflict, the Prize Strategist breaks the tie. Document the chosen approach and rationale in `.claude/memory/tech-decisions.md`.

---

### Phase 2 — Implement the Chosen Approach

After deciding, implement it. The specific steps depend on the approach chosen, but the output of Phase 2 must be:

1. **The 4 knowledge documents uploaded** to wherever the chosen approach requires
2. **`declarativeAgent.json` updated** with the correct `capabilities` block pointing to the live knowledge source
3. **The DA provisioned** in the M365 developer tenant — meaning `teamsapp provision` has run successfully and `TEAMS_APP_ID` is set in `riskradar/env/.env.dev`
4. **A test conversation** that proves the agent is citing its knowledge base, not hallucinating — a screenshot or transcript showing a response that references "NIST AI RMF" or "ICO Children's Code" from the knowledge document should be captured

---

## Context on the Knowledge Documents

Located at: `data/knowledge/`

| File | Why It Matters |
|------|---------------|
| `risk_assessment_frameworks.md` | The core scoring rubric — NIST AI RMF four functions, 5-dimension scoring (1-5 scale with detailed criteria at each level), ICO Children's Code, EU AI Act prohibited/high-risk categories |
| `owasp_ai_top10.md` | OWASP Top 10 for LLMs — LLM01–LLM10 |
| `ai_security_cert_guide.md` | AI security cert pathways for school roles |
| `team_readiness_report.md` | Synthetic quarterly readiness report — demonstrates the agent can surface organisational data |

The most important is `risk_assessment_frameworks.md`. The scoring rubric inside it is what the DA cites when justifying a dimension score. Without it grounded in a knowledge base, the DA is making up scoring criteria. This directly hits "Accuracy & Relevance (20%)."

---

## Critical Files to Read First

Before starting, read these files in full:

1. `CLAUDE.md` — the competition context, prize structure, subagent persona definitions
2. `riskradar/appPackage/declarativeAgent.json` — current state of DA manifest
3. `riskradar/appPackage/instruction.txt` — what the agent is instructed to do (includes references to knowledge base)
4. `riskradar/appPackage/ai-plugin.json` — the 3 MCP tool definitions
5. `.claude/memory/strategy.md` — what has been decided, what is open
6. `.claude/memory/tech-decisions.md` — prior architectural decisions and rationale

---

## Hard Constraints

- **Never commit credentials.** `TEAMS_APP_ID`, Azure API keys, connection strings go in `riskradar/env/.env.dev` which is gitignored.
- **Synthetic data only.** Do not use real student data, real employee data, or PII. The knowledge documents are already synthetic-safe.
- **Do not break the MCP server.** `riskradar/server/` builds clean. Do not edit it unless improving it.
- **The DA manifest schema is v1.7.** Any `capabilities` added must validate against `https://developer.microsoft.com/json-schemas/copilot/declarative-agent/v1.7/schema.json`

---

## Definition of Done for This Handoff

- [ ] Decision documented in `.claude/memory/tech-decisions.md` with persona analysis summary
- [ ] Knowledge documents uploaded to chosen platform
- [ ] `declarativeAgent.json` updated with working `capabilities` block
- [ ] DA provisioned — `TEAMS_APP_ID` populated (in `.env.dev`, not committed)
- [ ] Evidence that knowledge grounding works (agent cites the framework in a test response)
- [ ] `HANDOFF.md` updated with what was done and what comes next

---

## What Comes After This

Once this handoff is complete, the next phase (which can be a separate handoff) is:

1. **OAuth on the MCP server** — adds a bonus criterion tier, relatively self-contained TypeScript work
2. **Demo video** — 3–5 minute walkthrough showing the full assessment conversation
3. **Discord post** — community vote (10% of score), post the Hack for Good framing
4. **Submit** — June 14 deadline

---

## One Final Reminder

The personas will argue. Let them. The only question that matters at the end is: **which path wins the most money?** Make that the answer.
