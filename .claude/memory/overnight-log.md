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

---

## Cycle 2 — June 9/10, 2026

**What was worked on:** README.md replacement + ai-plugin.json runtime URL fix.

**Persona recommendations:**
- *Skeptical Microsoft Engineer (P1):* Critical infrastructure failure — LocalPlugin at `localhost:3000` is unreachable from Microsoft's servers; all 3 MCP tools silently fail in production demo. Fix: deploy server to public HTTPS, update ai-plugin.json URL.
- *Competing Team (P2):* README is the biggest gap — generic ATK template makes the submission invisible at first glance. Single action: README with Mermaid diagram.
- *Conservative Safety Judge (P3):* README first for reputational risk (template README with no child safety framing is embarrassing if submission wins Hack for Good). Then scoring criteria in knowledge doc. Also flagged HITL as a footer disclaimer, not a design principle.
- *Prize Strategist (P4):* README moves +$800–1,200 across Overall/Enterprise/IQ Tools. Creativity (15%) + UX (15%) + Community Vote (10%) = 40% of score is presentation-driven. Clear recommendation: write the README now.

**Tiebreaker:** All 4 agreed README first. P1's infrastructure concern partially addressed within the cycle.

**What was built:**
1. `riskradar/README.md` — Full replacement README: Mermaid architecture diagram (M365 Copilot → DA → Work IQ + Foundry IQ + MCP → registry + CSM), 6-step workflow summary, scoring rubric table, CSM coverage table, responsible AI principles section (HITL elevated to design principle, not disclaimer), project structure, full setup/provision guide with ngrok + deploy instructions, evaluation prompts, Hack for Good framing
2. `appPackage/ai-plugin.json` — Replaced hardcoded `http://localhost:3000/api` with `${{MCP_SERVER_URL}}` ATK env var substitution — directly addresses P1's critical failure point
3. `env/.env.dev` — Added `MCP_SERVER_URL=http://localhost:3000/api` as the default local value with comments explaining how to override with ngrok or Railway/Render for demo/production
4. TypeScript build verified clean

**Critical insight from P3:** Human-in-the-loop was a one-line footer disclaimer in instruction.txt. README now frames it as a named design principle with three specific commitments. This is the difference between "compliant" and "credible" for Reliability & Safety (20%).

**Recommended next cycle priority:**
1. **Knowledge document improvements** — Strengthen `data/knowledge/risk_assessment_frameworks.md` with more specific per-level scoring criteria (what makes a score 3 vs 4 for Data Privacy), concrete ICO Children's Code section citations (Age Appropriate Design Code standard numbers), and NIST AI RMF function citations. This is what makes grounded citations credible rather than performative — a judge who asks "why 3 not 2?" will catch weak knowledge docs.
2. **Human required (highest impact):** Set `MCP_SERVER_URL` to a public HTTPS URL in `.env.dev`, then run `teamsapp provision`. This is the single action that makes the MCP tools work in the actual demo.
3. **Human required:** Fill in SharePoint URL + Azure AI Search connection ID per KNOWLEDGE_SETUP.md.

---

## Cycle 3 — June 9/10, 2026

**What was worked on:** Knowledge document enhancement (`data/knowledge/risk_assessment_frameworks.md`).

**Persona recommendations:**
- *Skeptical Microsoft Engineer (P1):* Knowledge document improvements are the right action. Cited specific gap: the document currently maps NIST AI RMF to the four functions only (surface-level) — a real implementation maps to specific sub-category IDs like GOVERN 1.1, MAP 2.2. Adding ICO Children's Code standard numbers is verifiable by any judge who pulls up the source. Recommended adding EU AI Act Article 5(1)(a)–(f) sub-provisions explicitly.
- *Competing Team (P2):* 90 minutes on knowledge doc is the highest-leverage documentation move available without deployment. Key weakness identified: ICO Children's Code citations were in prose paragraphs but NOT inside the scoring rubric rows — fixing that is the real differentiator, as it shows the rubric was built by someone who actually read the code.
- *Conservative Safety Judge (P3):* Do it. Current risk: a technically literate judge pulls up the ICO Children's Code (15 named standards), finds the knowledge base has none of them, and concludes the grounding is performative. Adding NIST sub-category citations transforms justifications from summaries into traceable, auditable citations.
- *Prize Strategist (P4):* Recommended leading with a worked ChatGPT assessment transcript as the single highest-value item (serves triple duty: knowledge base content + demo script + eval test case). Then add ICO Standards 1–15 and NIST sub-categories. Estimated +$1,200–2,400 expected prize value delta across Accuracy & Relevance (20%) and Reasoning (20%) criteria.

**Tiebreaker:** P4 recommended starting with the ChatGPT sample assessment. All four personas agreed on knowledge document work overall.

**What was built:**
- `data/knowledge/risk_assessment_frameworks.md` — 256 → 438 lines:
  1. All 15 ICO Children's Code standards listed with names and key requirements
  2. EU AI Act Article 5(1)(a)–(f) sub-provisions with explicit school implications (incl. 5(1)(e) — attention/emotion tracking banned in schools)
  3. NIST AI RMF sub-category citations (GOVERN 1.2, MAP 5.1, MEASURE 2.5, etc.) added to every scoring dimension table
  4. Scoring tables rewritten with "Evidentiary Anchor" column — concrete evidence distinguishing each score level, resolving the "why 3 not 4?" ambiguity
  5. ICO Children's Code standards cross-referenced by number inside Dimension 2 (Age Appropriateness) scoring criteria
  6. Part 5 added: Full ChatGPT sample scored assessment — all 5 dimensions with citations, 16/25 Medium Risk rating, controls, AUP clause, HITL disclaimer
  7. Part 6 added: NIST AI RMF Sub-category Quick Reference table

**Recommended next cycle priority:**
1. **Human required (most urgent):** `teamsapp provision` — set `MCP_SERVER_URL` in `.env.dev` to a public HTTPS URL (ngrok for demo, Railway for persistent), then run `teamsapp provision`. This is the single action that makes the full stack work in an actual M365 demo.
2. **Human required:** Upload the 4 knowledge docs to SharePoint + Azure AI Foundry per `KNOWLEDGE_SETUP.md`; fill in TODO values in `declarativeAgent.json`.
3. **Autonomous cycle option:** Write a second sample assessment for a different tool (e.g. Grammarly or Khan Academy AI) to extend the knowledge base with more domain-specific grounding. Or improve `data/knowledge/owasp_ai_top10.md` with school-specific application notes per LLM risk.

