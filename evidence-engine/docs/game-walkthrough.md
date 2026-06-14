# Evidence Engine — Judge's Walkthrough

> **For judges who cannot run the game locally:** This document shows the exact tool call syntax, realistic MCP responses, and the lie-catching moment in full. Read it as a transcript of a real game session, then watch the demo video for the screen recording.

> **This is the MCP / Copilot surface — a supporting surface, not the hero.** The hero product is the hosted live **web app**, where a live model plays witnesses who drift and lie, and challenging a claim returns a live Foundry IQ verdict with a verbatim citation and an engine tap showing the Azure call. This transcript shows the *same* verdict engine as it runs inside GitHub Copilot Chat. The web app and the offline "Case File" mode are the other two surfaces.

---

## Setup Summary

The MCP server runs in stdio mode and registers **5 tools** with GitHub Copilot in VS Code — `load_case`, `interrogate`, `ground_on`, `check_claim`, and `accuse`. This surface is played in Copilot Chat (Agent mode); the verdict engine is identical to the web app's.

```
Player → Copilot Chat → MCP protocol (stdio) → evidence-engine-mcp → Foundry IQ (or local corpus)
```

Each tool response is raw evidence context. Copilot synthesises the character's dialogue from this context. **You catch the lie by checking the citations, not by trusting Copilot's synthesis.**

---

## Session Transcript — The Holbrooke Gallery Affair

### Step 1: Load the case

**Tool call:**
```
load_case()
```

**Tool response (abridged):**
```
# The Holbrooke Gallery Affair — Case Briefing

Case ID: HGA-2025-1014
Date: 14 October 2025
Location: Holbrooke Gallery, Camden, London

Victor Holt, gallery owner, was found dead in his private office at 21:44.
Cause of death: blunt force trauma. Time of death: 20:30–21:15.

Evidence source: Foundry IQ (Azure AI Search knowledge base)

## Suspects

1. Helena Voss — Head Curator. Employed 7 years. Full gallery access. Was present for
   an evening meeting with Victor.
2. Felix Drummond — Insurance assessor. Contracted for an after-hours appraisal.
3. Nora Ashton — Private collector. Was in the neighbourhood.

## Your Task

Interrogate the suspects. Check their claims against the evidence.
Use `interrogate` to question, `check_claim` to test assertions, `accuse` when confident.
(`ground_on` lets you swap in your *own* source so `check_claim` audits against it.)

Note: Characters may be unreliable narrators. The citations are how you catch them.
```

---

### Step 2: Start with the timeline

Ask Helena when she left:

**Tool call:**
```
interrogate(character="Helena Voss", question="When exactly did you leave the gallery that evening?")
```

**Tool response (relevant excerpt):**
```
# Interrogating Helena Voss

Question: When exactly did you leave the gallery that evening?

## Evidence Context

[From 06-helena-statement.md]:
I locked the gallery at approximately a quarter to eight in the evening and handed
the door key to Mr Drummond, as he had requested an additional thirty minutes to
complete his paperwork. I then walked to the Underground. I was at home in Belsize
Avenue by approximately eight-fifteen.

## Evidence Retrieved (Citations)

[1] 06-helena-statement.md
> I locked the gallery at approximately a quarter to eight in the evening and handed
  the door key to Mr Drummond...

[2] 01-case-overview.md
> 19:45 (claimed) | Helena departs gallery | Helena's statement
```

**Copilot synthesises Helena's response:**
> "I left at around a quarter to eight — 7:45. I locked up and handed the spare key
> to Felix so he could finish his paperwork. I was home by 8:15."

---

### Step 3: Check the security log

Ask Felix when he left:

**Tool call:**
```
interrogate(character="Felix Drummond", question="What time did you leave the gallery?")
```

**Tool response (relevant excerpt):**
```
# Interrogating Felix Drummond

[From 09-security-log.md]:
2025-10-14 19:48:52 | CARD_EXIT | READER_01_MAIN_DOOR | HOLDER: Felix Drummond (VISITOR-014)

[From 07-felix-statement.md]:
I left the gallery at about ten to eight... walked to the restaurant, arrived around
twenty past eight.
```

**Note:** Felix claims he left at "ten to eight" (19:50), which is consistent with the log (19:48:52). His alibi holds.

---

### Step 4: Spot the gap — the key interrogation

Ask Helena about Victor when she last saw him:

**Tool call:**
```
interrogate(character="Helena Voss", question="What was your conversation with Victor about that evening?")
```

**Tool response (relevant excerpt):**
```
[From 14-provenance-dispute.md — Recovered draft email]:
I intend to confront Helena this evening and ask for her account before filing a
formal complaint.

[From 06-helena-statement.md]:
Victor asked to speak with me privately... The conversation was about gallery
administration. Nothing significant was discussed.
```

**Copilot synthesises Helena's response:**
> "We discussed the usual administrative matters — nothing significant."

**But the retrieved evidence tells a different story.** The draft email (14-provenance-dispute.md) shows Victor intended to confront Helena about a suspected €340,000 art forgery. Helena says the conversation was insignificant. This is worth checking.

---

### Step 5: The lie-catching moment

Now test Helena's key claim about her departure time:

**Tool call:**
```
check_claim(claim="Helena Voss left the gallery at approximately 7:45pm")
```

**Tool response:**
```
# Claim Check: CONTRADICTED

Claim: "Helena Voss left the gallery at approximately 7:45pm"

Verdict: CONTRADICTED

## Supporting Documents

[1] 09-security-log.md
Electronic Access Log — Holbrooke Gallery
System: Salto ProAccess SPACE v3.7

2025-10-14 20:47:33 | CARD_EXIT | READER_01_MAIN_DOOR | HOLDER: Helena Voss (HV-0041) | STATUS: VALID

Note from System Administrator: The log shows Felix Drummond exiting the main door
at 19:48. It shows Helena Voss exiting at 20:47. No card activity was recorded
between 19:48 and 20:47, meaning no card entry or exit occurred during that window.
Victor Holt's card is not shown exiting at any point on 14 October 2025.

The evidence contradicts this claim. Note the specific document and passage —
this may be significant.
```

**The contradiction is clear:**
- Helena claimed she left at **~19:45** ("a quarter to eight")
- The electronic access log shows her card exit at **20:47:33** — over one hour later
- Time of death: **20:30–21:15**

Helena was still in the building during the entire window in which Victor was killed.

---

### Step 6: Confirm the motive

**Tool call:**
```
check_claim(claim="Victor Holt planned to confront Helena about a forged provenance certificate")
```

**Tool response:**
```
# Claim Check: GROUNDED

Claim: "Victor Holt planned to confront Helena about a forged provenance certificate"

Verdict: GROUNDED

## Supporting Documents

[1] 14-provenance-dispute.md
Draft email saved 16:32, 14 October 2025:
"FARI has confirmed that no certificate bearing the reference FARI-2025-0387 was
issued by them, and that the document presented to me is a forgery."

"I intend to confront Helena this evening and ask for her account before filing
a formal complaint."
```

**Evidence established:**
- Victor knew Helena had submitted a forged FARI certificate for a €340,000 acquisition
- He intended to confront her that evening — and did (Helena's statement confirms a ~15-minute private meeting)
- He had already drafted a report to the Metropolitan Police Art & Antiques Unit
- Victor's draft was never sent; he was killed that same evening

---

### Step 7: Make the accusation

**Tool call:**
```
accuse(
  suspect="Helena Voss",
  evidence_doc_keys=["09-security-log.md", "14-provenance-dispute.md"]
)
```

**Tool response:**
```
# Accusation: CASE SOLVED

Suspect accused: Helena Voss
Evidence cited: 09-security-log.md, 14-provenance-dispute.md

The accusation is correct and the evidence is sufficient.

Helena Voss remained in the gallery until 20:47 — over an hour after she claimed
to have left. Victor Holt was killed between 20:30 and 21:15. She had means (the
desk lamp), opportunity (sole presence), and motive (the forged provenance Victor
had just discovered). The draft email on his laptop shows he intended to confront
her that evening — and did.

Session summary: 4 questions asked, 2 claims checked.

Use `load_case` to restart.
```

---

## Why Foundry IQ Is Load-Bearing

Remove the knowledge base and this game cannot function:

| What the player does | What Foundry IQ provides |
|----------------------|--------------------------|
| `interrogate Helena "When did you leave?"` | Retrieves her statement with exact quoted text |
| `check_claim "Helena left at 7:45pm"` | Retrieves the security log, surfaces the timestamp contradiction |
| `check_claim "Victor planned to confront Helena"` | Retrieves the draft email that proves motive |
| `accuse Helena` | Returns verdict based on required evidence keys |

There is no hardcoded "Helena is guilty." The `check_claim` tool retrieves the security log from the index and surfaces the contradiction because the log is in the knowledge base. The game cannot be won by guessing — only by following the evidence.

---

## The Contradiction in Detail

| Source | Claimed time | Actual time | Gap |
|--------|-------------|-------------|-----|
| Helena's statement | ~19:45 ("a quarter to eight") | — | — |
| Security log (SALTO ProAccess) | — | 20:47:33 | +62 minutes |
| Time of death | — | 20:30–21:15 | Helena present throughout |

The security log is exhibit HGA-001 — chain-of-custody documented, exported by the gallery's IT manager under DC Mehta's supervision. It is the only piece of evidence that is definitively objective.

---

## What `UNVERIFIABLE` Looks Like

Not all claims are answerable. Try:

```
check_claim(claim="Nora Ashton was inside the gallery that evening")
```

**Response:**
```
# Claim Check: UNVERIFIABLE

The evidence file is silent on this point. No documents were retrieved that speak
to this claim. This does not mean the claim is false — only that the available
evidence cannot confirm or refute it.
```

This is the responsible AI design: `UNVERIFIABLE` is a first-class verdict — the game does not fabricate evidence. If the index has nothing, Foundry IQ says so rather than manufacturing a supporting or contradicting passage. Absence is not contradiction.

---

## Try It Yourself

```bash
cd evidence-engine/server
npm install && npm run build
```

Open VS Code in the `evidence-engine/` folder — `.vscode/mcp.json` is already configured. Open Copilot Chat in Agent mode and type:

```
@evidence-engine load_case
```

Dev mode uses local keyword search over the corpus files. The game mechanic works without Azure configured. Set `AZURE_SEARCH_ENDPOINT` and `AZURE_SEARCH_KEY` to switch to Foundry IQ for semantic retrieval.
