# Evidence Engine — Demo Recording Script

**Target length:** 3 minutes  
**Format:** Screen recording with voiceover  
**Audience:** Hackathon judges (technical, brief attention span)

---

## v3 — COLD-OPEN SPINE (June 14, 2026 — record THIS one)

> Same kill-shot discipline as v2, with a payoff-first cold open and two new
> set-pieces (the split-screen, the reasoning-token receipt). Lead with the
> moment, not the title card. Shot detail for each beat is in v2 below.

**0:00–0:12 — Cold open (true black, monospace typewriter, no music yet):**
> AI assistants lie to you every day.
> This is a game where you catch one — in the act.

HARD CUT (no title card yet) straight to the **CONTRADICTED** stamp landing on
Helena's `19:45` alibi with the badge-log passage quoted verbatim. Payoff before
the logo. *(This exact sentence is also README line 1 and the Discord opener — one
caption everywhere. Keep "lie" to the spoken hook only; on-screen verdicts stay
GROUNDED / CONTRADICTED / UNVERIFIABLE.)*

**0:12–0:55 — The kill shot** (v2 beats 1–4): ask Helena her departure, watch the
engine tap fire `AZURE kb.reason(verdict)`, challenge `19:45` → CONTRADICTED +
verbatim citation. Land on the **Receipt** line under the verdict —
*"Foundry IQ · medium effort · N reasoning tokens"* — and say it out loud:
> "That verdict isn't a regex. The knowledge base reasoned over the case file —
> here's the receipt for the thinking it did."

**0:55–1:15 — The split-screen (the loopable GIF — the close of the social cut):**
Press **IQ off ⇄ on** on her first claim — stage this *before* the kill-shot challenge
above, since the button retires once you challenge for real. One sentence, two panes:
LEFT *Foundry IQ unplugged — "no record", her word stands*; RIGHT the **CONTRADICTED**
stamp with its citation.
> "Same claim, same model. The only difference is Foundry IQ. Pull the plug and
> the catch collapses — that's the brain."
Freeze on the two-pane frame. This is the eight seconds that travels.

**1:15–1:45 — "You scripted both sides?" → Bring your own trial:** paste a short
source the judges have never seen; the witness drifts; challenge → UNVERIFIABLE or
CONTRADICTED against *their* text. The lie is emergent — the scripting critique dies.

**1:45–2:25 — Copilot Receipts** (the "especially welcomed" MCP surface): in VS Code,
`@ground_on` a repo file, then `@check_claim` a plausible-but-wrong claim about it →
**CONTRADICTED** (or **UNVERIFIABLE**) with the verbatim line cited — the **Faithfulness
gate** reads **HELD** beneath it — plus the reasoning-token count, inside Copilot Chat.
> "Same engine, where developers already work — it catches the assistant lying
> about your own code, with the receipt."

**2:25–2:55 — Architecture + the Grounding Record:** the one-index diagram (v2 beat 9),
then the exportable **Grounding Record** — "you leave the interrogation holding a
cited document." Close on the cold-open line.

---

## v2 — KILL-SHOT SCRIPT (June 12, 2026 — record this one)

> Principle: don't tour features — show ONE moment, fast.
> Payoff on screen inside 60 seconds.

### Pre-flight (additional to v1 checklist below)

- [ ] `live-server` running (`npm start`, health returns `"live": true`)
- [ ] Web app open at 1440×900, Act II · Live Interrogation, Helena selected, fresh session
- [ ] Engine tap panel visible on the right — this is the Foundry IQ proof on camera

### Shot list

**0:00–0:15 — The hook (title card / voiceover):**
> "AI assistants hallucinate — and we keep trusting them. Evidence Engine is a
> noir detective game where the suspects ARE a live LLM… and your job is to
> catch it drifting from the truth. Every check runs live against Foundry IQ."

**0:15–0:60 — The kill shot (one unbroken take, Act II · Live Interrogation):**
1. Type: *"What time exactly did you leave the gallery that evening?"*
2. Helena answers in character — pause on *"I left the gallery at 19:45 sharp."*
   Point out the engine tap firing: `AZURE kb.retrieve(evidence)` → `MODEL llm.chat`
   → `AZURE index.upload(testimony)` — Foundry IQ in the loop, on camera, with latency.
3. Click the 19:45 claim → **CONTRADICTED** stamp + **FABRICATION CONFIRMED** ribbon.
4. Linger 5 seconds on the verbatim badge-log/detective-notes passage.
   > "She was scripted to lie about this — and the live knowledge base just
   > caught her, with the passage quoted verbatim. Not a vibe. A citation."

**1:00–1:30 — Press her until she cracks:**
5. Type: *"The badge log says otherwise. When did you really leave?"*
6. She concedes a new time → challenge it → **SELF-CONTRADICTION** verdict shows her
   turn-2 statement verbatim ("their words, turn 2 — indexed verbatim").
   > "Her own testimony was indexed into the same knowledge base the moment she
   > said it. She's now contradicting herself — and the index remembers."

**1:30–1:50 — The scorecard:**
7. End interrogation → report: plants pinned 1/3, contradictions pinned, "file
   silent means unverifiable, not false". One line on the honest scoring.

**1:50–2:20 — Copilot surface (v1 hero shot, shortened):**
8. Cut to VS Code: `check_claim` Helena's departure in Copilot Chat →
   CONTRADICTED with `09-security-log.md` citation. One beat:
   > "Same engine, inside GitHub Copilot Chat, via MCP — plus the knowledge
   > base's own native MCP endpoint, zero glue code."

**2:20–2:50 — Architecture card:**
9. Static diagram: browser (keyless) → live-server (two secrets) → Foundry IQ
   KB (one index, evidence + testimony partitions) → GitHub Models.
   > "One Azure AI Search free-tier index, partitioned by filters. Every turn
   > and every verdict is a live retrieve — the engine tap logs them all."

**2:50–3:00 — Close:**
> "Catching hallucinations shouldn't need a PhD. Make it a game.
> Evidence Engine — the citations are how you catch them."

---

## v1 — Original MCP-first script (fallback / source for segment 8)

---

## Pre-Flight Checklist

Before recording:

- [ ] `npm run build` passes in `evidence-engine/server/`
- [ ] VS Code is open at the `evidence-engine/` workspace root
- [ ] `.vscode/mcp.json` is present — MCP server auto-registers
- [ ] GitHub Copilot Chat is open in Agent mode (not Chat mode)
- [ ] Evidence Engine MCP tools appear when you click the tools icon in Copilot Chat
- [ ] Set terminal font size large enough for recording (min 16pt)
- [ ] Set VS Code theme to dark for contrast
- [ ] Close unrelated tabs and notifications
- [ ] If using Foundry IQ: `AZURE_SEARCH_ENDPOINT` and `AZURE_SEARCH_KEY` are in `server/.env`
- [ ] Start a fresh MCP session (reload window or restart VS Code MCP servers)

---

## Recording Script

### Segment 1 — Hook (0:00–0:20)

**[Screen: VS Code, Copilot Chat open, tools icon visible]**

**Narration:**
> "What if AI couldn't hallucinate its way to an answer? Evidence Engine is a detective game where every character claim is grounded by retrieval over the actual case file — and when the evidence doesn't support the claim, the game knows."

**[Screen: Show the tools panel — load_case, interrogate, check_claim, accuse listed]**

**Narration:**
> "It runs as an MCP server inside GitHub Copilot Chat. Four tools. One dead gallery owner. One planted lie."

---

### Segment 2 — Load the case (0:20–0:40)

**[Type in Copilot Chat:]**
```
load_case
```

**[Wait for tool response — Copilot will present the case briefing]**

**Narration:**
> "Victor Holt was found dead in his private office. Time of death: 20:30 to 21:15. Three people were present that evening. One of them lied about when they left."

**[Highlight the three suspect names on screen]**

---

### Segment 3 — Interrogate the suspect (0:40–1:20)

**[Type in Copilot Chat:]**
```
Interrogate Helena Voss. Ask her: when exactly did she leave the gallery that evening?
```

**[Wait for response — Copilot synthesises Helena's answer from retrieved evidence]**

Expected Copilot response will include Helena claiming she left around 7:45pm and was home by 8:15.

**Narration:**
> "Helena says she left at a quarter to eight. Every detail in her answer came from the evidence index — Copilot retrieved her witness statement and used it to ground her response. See the document reference in the tool output."

**[Point at the citation in the tool response — `06-helena-statement.md`]**

---

### Segment 4 — The lie-catching moment (1:20–2:15) ← THE CORE

**[Type in Copilot Chat:]**
```
check_claim: "Helena Voss left the gallery at approximately 7:45pm"
```

**[Wait for the tool response — this should take 2–4 seconds]**

Expected tool response headline:
```
# Claim Check: CONTRADICTED
```

**[Pause on the CONTRADICTED verdict — let it land]**

**Narration:**
> "The verdict: CONTRADICTED. The tool retrieved the electronic access log from the knowledge base — the actual Salto ProAccess export, exhibit HGA-001. And it shows Helena's card exit at 20:47. That's 8:47pm. Over an hour after she claimed to have left."

**[Scroll to show the log entry — zoom in if possible:]**
```
2025-10-14 20:47:33 | CARD_EXIT | READER_01_MAIN_DOOR | HOLDER: Helena Voss (HV-0041)
```

**Narration:**
> "Time of death: 20:30 to 21:15. Helena was in the building the entire time."

**[Beat. Let viewers absorb.]**

---

### Segment 5 — Confirm motive (2:15–2:35)

**[Type in Copilot Chat:]**
```
check_claim: "Victor Holt planned to confront Helena about a forged document that evening"
```

Expected tool response:
```
# Claim Check: GROUNDED
```

From the recovered draft email: "I intend to confront Helena this evening..."

**Narration:**
> "The knowledge base also contains Victor's unsent draft email. He'd discovered a forged provenance certificate on a €340,000 acquisition Helena arranged. He planned to confront her that evening — and did."

---

### Segment 6 — Solve the case (2:35–2:50)

**[Type in Copilot Chat:]**
```
accuse Helena Voss with evidence: 09-security-log.md, 14-provenance-dispute.md
```

Expected response:
```
# Accusation: CASE SOLVED
```

**Narration:**
> "Case solved. The accusation requires citing the actual evidence documents — not guessing, citing."

---

### Segment 7 — Architecture close (2:50–3:00)

**[Cut to the README architecture diagram — or show a quick terminal build]**

**Narration:**
> "Evidence Engine — a detective game where citation integrity is the win condition. Built with the MCP TypeScript SDK, Foundry IQ agentic retrieval, and GitHub Copilot as the interface. The knowledge base is the game engine."

**[End with Evidence Engine title card or the CASE SOLVED screen]**

---

## Editing Notes

- Cut any pauses longer than 2 seconds where no output is visible
- Keep the CONTRADICTED verdict on screen for at least 3 seconds before narrating
- If the tool response is long, let it stream before narrating — the streaming itself looks impressive
- Speed up the accuse call (it can lag) — show the CASE SOLVED heading prominently
- Add a subtle lower-third: "Evidence Engine — MCP Server + Foundry IQ + GitHub Copilot"

---

## Fallback if Azure Is Not Provisioned

Dev mode (local corpus) will produce the same game mechanic with keyword-based retrieval instead of semantic retrieval. The CONTRADICTED verdict still fires correctly — the security log is retrieved because "helena" and "voss" are in the claim terms. Narrate this:

> "In dev mode the game uses local keyword search over the corpus files. For the submission, the same server connects to Azure AI Search via the Foundry IQ agentic retrieval API."

Show the `.env.example` or the `foundry-client.ts` briefly if making a technical audience video.

---

## Backup Scenario — UNVERIFIABLE

If you want to show the responsible AI story:

**[Type:]**
```
check_claim: "Nora Ashton was inside the gallery when Victor was killed"
```

Response:
```
# Claim Check: UNVERIFIABLE

The evidence file is silent on this point. No documents were retrieved that speak
to this claim.
```

**Narration:**
> "When the evidence doesn't answer a claim, the game says so. It doesn't guess. UNVERIFIABLE is a first-class verdict — the source is silent, and silence is not a lie — never a fallback error message."

This is the 30-second responsible AI addendum if you want to add it before the architecture close.

---

## Submission Checklist After Recording

- [ ] Video is 3 minutes or under (hard cap; 4 minutes maximum)
- [ ] CONTRADICTED verdict is clearly visible and narrated
- [ ] The security log timestamp 20:47:33 is visible on screen
- [ ] MCP tool calls are visible in the Copilot Chat interface
- [ ] At least one document citation (docKey) is shown
- [ ] Architecture overview is included (even briefly)
- [ ] Video is uploaded to the submission form
