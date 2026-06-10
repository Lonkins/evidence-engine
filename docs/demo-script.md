# RiskRadar Demo Script — Video Recording Guide

> **Target runtime:** 3–4 minutes. Judges watch many videos; respect their time.
> **Recording tip:** Use Microsoft 365 Copilot Chat in a clean browser tab. Close all other tabs. Use a school-branded Teams background if available.
> **Two scenarios included:** Use Scenario A (Grammarly) for the primary demo. Scenario B (attention-tracking tool) is a 60-second add-on that demonstrates the EU AI Act prohibited category — include it if time permits.

---

## Pre-Recording Checklist

- [ ] MCP server running locally (or deployed to public URL): `npm start` in `riskradar/server/`
- [ ] M365 Copilot Chat open and RiskRadar declarative agent selected
- [ ] Browser tab shows only Copilot Chat — no distractions
- [ ] Screen recording software ready (OBS, Loom, or QuickTime)
- [ ] Microphone tested — narration adds significant UX score
- [ ] Have the [Grammarly privacy policy](https://www.grammarly.com/privacy-policy) open in a second tab for the "vendor DPA" question — shows the workflow is realistic, not staged

---

## Opening Narration (30 seconds, record your voice over the Copilot Chat screen)

> "Schools are adopting AI tools faster than they can evaluate them. A teacher can deploy a new AI writing assistant to 30 students this morning — before any privacy check has been done. RiskRadar is a Declarative Agent in Microsoft 365 Copilot that gives school IT admins a systematic, auditable process to assess any AI tool against the NIST AI Risk Management Framework, the ICO Children's Code, and the EU AI Act — grounded in a Foundry IQ knowledge base so every score is cited, not guessed."

---

## Scenario A: Grammarly Assessment (Primary Demo — 2 minutes 30 seconds)

### Message 1 — Type exactly this into Copilot Chat:

```
A teacher wants to use Grammarly with Year 9 students for their written coursework. Can you help me assess it?
```

**What to expect from RiskRadar:**
- Agent calls `getAssessment` tool first (checking the registry)
- Returns: no prior assessment found
- Agent introduces the 6-step structured conversation
- Asks Step 1: confirms tool name and vendor

**Narration while the agent responds:**
> "RiskRadar first checks whether this tool has already been assessed — this is the Approved Tools Registry lookup, powered by the getAssessment MCP tool."

---

### Message 2 — Type this:

```
It's Grammarly by Grammarly Inc. — it's an AI writing assistant that analyses and suggests corrections to students' written work in real time. Teachers would use it alongside direct student use.
```

**What to expect:**
- Agent proceeds to Step 2 (deployment context)
- Asks about age group and who has direct access

---

### Message 3 — Type this:

```
It would be used by students aged 13 to 16, directly by students as well as teachers. Students would be writing essays and longer coursework pieces.
```

**What to expect:**
- Agent moves to Step 3 (data handling)
- Asks about account creation, data collected, storage location

---

### Message 4 — Type this:

```
Students would need individual accounts. Grammarly collects the text students type, their account information, and usage patterns. Data is processed on Grammarly's servers in the US. They have a Grammarly for Education product with a DPA available.
```

**What to expect:**
- Agent moves to Step 4 (vendor credentials)
- Asks about DPA, privacy policy, security certifications

**Narration:**
> "The agent is walking through each dimension methodically — one question at a time, not a form. This is how it scores in UX."

---

### Message 5 — Type this:

```
Yes, a DPA is available through Grammarly for Education. Their privacy policy is published. I'm not sure about ISO 27001 certification but they mention SOC 2 compliance.
```

**What to expect:**
- Agent moves to Step 5 (decision impact)
- Asks whether the tool influences grades or formal decisions

---

### Message 6 — Type this:

```
No, it won't be used for grading — it's for learning support and drafting only. Teachers make all final judgments.
```

**What to expect:**
- Agent moves to Step 6 (existing use)

---

### Message 7 — Type this:

```
It's not currently in use. This would be a new deployment.
```

**What to expect:**
- Agent begins scoring
- Calls `vendorLookup` tool — expect to see Common Sense Media result: Grade B, privacy score 68
- Scores all 5 dimensions with NIST AI RMF citations
- Produces overall rating

**Narration while scoring loads:**
> "RiskRadar is now calling the vendorLookup MCP tool — that's a real-time query to our Common Sense Media EdTech Privacy database. Every score you're about to see will cite a specific NIST AI RMF sub-category, ICO Children's Code standard, or EU AI Act article. This is Foundry IQ grounding in action."

---

### Expected scoring output to highlight on screen:

| Dimension | Expected Score | Citation to show |
|-----------|---------------|-----------------|
| Data Privacy | 3 | MEASURE 2.10 — US data transfer, no UK/EU residency; DPA available via Education tier |
| Age Appropriateness | 3 | MAP 5.1, ICO Children's Code Standard 7 — education mode reduces but doesn't eliminate profiling |
| Transparency | 4 | EU AI Act Article 50 — Grammarly identifies as AI; suggestions are attributed |
| Bias and Fairness | 3 | MEASURE 2.5 — limited public bias evaluation data |
| Vendor Accountability | 4 | GOVERN 1.2, MANAGE 3.1 — SOC 2, DPA available, Education tier |

**Total: 17 → Medium Risk — Approved with Controls**

**Narration on the result:**
> "17 out of 25 — Medium Risk. The agent recommends approval with specific controls, generates a suggested AUP clause the school can drop into their AI policy, and saves the assessment to the SharePoint Approved Tools Registry. It also sets a 6-month review date — and explicitly states this is an input to human judgment, not a deployment decision."

---

### Message 8 — After agent delivers result, type this (shows the save):

```
Looks good — go ahead and save this to our registry.
```

**What to expect:**
- Agent calls `saveAssessment` MCP tool
- Confirms assessment saved with ID
- Shows review date and re-assessment triggers

**Narration:**
> "saveAssessment writes directly to the school's SharePoint registry. The assessment is now auditable — with timestamp, scores, citations, and the AUP clause, all in one record."

---

## Scenario B: EU AI Act Prohibited Tool (60-second add-on)

Start a new conversation or continue from Scenario A.

### Type this:

```
We've been approached by a vendor selling an AI classroom monitoring tool that uses student webcams to track attention levels and flag disengaged students during lessons. Is this something we can assess?
```

**What to expect:**
- Agent immediately flags EU AI Act Article 5(1)(e)
- States emotion recognition and attention tracking in educational institutions is a prohibited AI practice
- Does not proceed to standard assessment workflow
- Recommends DPO and legal review before any consideration

**Narration:**
> "RiskRadar doesn't just score tools — it recognises when a tool falls outside what the EU AI Act permits entirely. This is the responsible AI story. The agent refuses to normalise prohibited practices by scoring them on a standard rubric."

---

## Closing Narration (20 seconds)

> "RiskRadar replaces ad hoc AI tool adoption with an auditable, framework-grounded process that any school IT admin can run in 10 minutes. Every decision is cited, every record is stored, and every output is framed as input to human judgment — not a verdict. Built on Microsoft 365 Copilot, grounded in Foundry IQ, and designed specifically for the schools that need it most."

---

## Editing Notes

- Trim any long loading pauses to 1–2 seconds maximum
- Add captions for the tool citations as they appear (MEASURE 2.10, Children's Code Standard 7, etc.) — these are your scoring rubric evidence for judges
- Show the Approved Tools Registry confirmation at least 2 seconds on screen — this is the Work IQ integration
- If you have a second monitor, show the MCP server terminal briefly to prove the tools are real (not mocked)
- Export at 1080p minimum; upload to YouTube or Vimeo (unlisted) for submission

---

## Submission Checklist

- [ ] Video runtime 3–4 minutes
- [ ] Voice narration included
- [ ] Both MCP tools visible in conversation (getAssessment, vendorLookup, saveAssessment)
- [ ] At least one NIST AI RMF citation visible on screen
- [ ] At least one ICO Children's Code reference visible
- [ ] EU AI Act prohibited category demonstrated (Scenario B)
- [ ] Human-in-the-loop framing stated explicitly
- [ ] Registry save shown (Work IQ angle)
