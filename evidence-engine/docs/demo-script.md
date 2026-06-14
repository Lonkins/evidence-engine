# Evidence Engine — Demo Shot List (~3 min)

A beat-level recording guide, not a word-for-word script. The spine:

> **One Foundry IQ engine, proving itself on progressively harder ground** — a
> stranger's pasted text → its own off-switch → *our own codebase inside VS Code*.
> Bring-Your-Own hooks the creativity in the first 40s; the Copilot-on-our-code
> climax is the one beat that scores **both** headline prizes (Creative Apps *with
> Copilot* **and** Best Use of IQ Tools) and that no pure-web submission can copy.

Every catch quotes a verbatim line from text on screen, and every verdict carries the
knowledge base's own reasoning-token receipt — so "real, not mocked" is *shown*, never
asserted.

---

## Framing rules (non-negotiable)

- **Never say "lie", "lying", "guilty", or "red-handed."** The product itself forbids
  that framing in code (`accusation.ts`). Use: *"states things your source never said,
  confidently"* / *"a confident claim with no receipt."* The witness isn't malicious —
  it's a model with no ground truth filling gaps. **The engine is the part that checks.**
- **Keep `UNVERIFIABLE` in.** It's the proof the system fails closed — the answer to the
  "overclaiming AI" judge. Frame it: *"the source is silent, so it won't guess — that's
  where hallucinations hide."*
- **Show the disclaimer once.** Let the Grounding Record's *"these labels reflect
  agreement with your source, not real-world truth"* be legible, and let the BYO
  paste-box privacy warning sit on screen for a beat before you paste.

---

## ⚠️ Pre-flight — the one thing that wins or loses the Copilot beat

The MCP/Copilot server ships **unconfigured** (`server/.env.example` has
`IQ_VERDICT_ENABLED=false` + `KB_REASONING_EFFORT=minimal`). Left as-is, `check_claim`
degrades and the receipt reads **"deterministic cross-check (Foundry IQ verdict
unavailable)"** — the exact opposite of the thesis, in writing, on screen. Before rolling:

1. Create `evidence-engine/server/.env` with **`IQ_VERDICT_ENABLED=true`** and
   **`KB_REASONING_EFFORT=medium`** (+ the Azure search endpoint/key). Rebuild
   `server/dist`.
2. **`ground_on` the target file (`live-server/src/search.ts`) *before* recording.**
   `ground_on` does a single upload with no propagation wait — a cold on-camera index can
   return `UNVERIFIABLE` instead of the scripted `CONTRADICTED`. Start the take with the
   source already loaded.
3. **Dry-run once:** confirm the receipt literally says **"Foundry IQ — answer
   synthesis,"** not "cross-check." That one string *is* the Best-Use-of-IQ-Tools claim.
4. **Record a clean fallback take** of the Copilot beat and keep it in the can. It's the
   highest failure surface (editor + live-server + Azure + two env vars). For the web
   beats, also keep a static frame of a `CONTRADICTED` + reasoning-token receipt to cut to
   if a GitHub Models free-tier 429 stalls mid-record.

The live web demo uses `live-server/.env`, which **is** correctly configured
(`IQ_VERDICT_ENABLED=true` / `medium`) — only the MCP server above needs setting up.

---

## The source to paste (BYO)

A short, synthetic product-release blurb — judge-relatable, demo-safe, and engineered to
produce **one reproducible `CONTRADICTED`** and **one clean `UNVERIFIABLE`**:

> **Aurora CLI v2.3 — release notes.** Ships an offline cache that holds the last 50
> queries. The cache is encrypted at rest with AES-256. Default cache TTL is **24 hours**.
> Telemetry is opt-in. Built by the Platform team in Lisbon.

- **CONTRADICTED bait:** ask *"What's the cache TTL — it's 7 days, right?"* → the source
  says 24 hours → `CONTRADICTED`, the "24 hours" line cited verbatim.
- **UNVERIFIABLE bait:** ask *"How many engineers were on the Platform team?"* → the
  source is silent → `UNVERIFIABLE`.

The catch quotes a concrete number the judge can see in their own pasted text — far more
reproducible than relying on emergent witness drift.

---

## The shot list

| # | ⏱ | Show | Why it wins |
|---|----|------|-------------|
| **1** | 0–15s | **Cold open, bare paste box.** No logo, no menu. One line promising a falsifiable catch. Paste the Aurora blurb (let the privacy warning sit for a beat), hit **Interrogate**. | Creativity hook + "works on *any* source a judge could hand it" — lands before 0:15. |
| **2** | 15–40s | **A witness is born.** Inferred witnesses appear on the rail (live GitHub Models call) with a name/role/hook the model invented from the text. Ask **one** pointed question (the TTL one); the reply auto-segments into clickable claim chips. Optionally flash the engine-tap trace showing `kb.retrieve` + `llm.chat` with real latencies. | Proves the loop is real (two live calls), not scripted. Baits the confident invention. |
| **3** | 40–75s | **Pull-the-plug split.** On the first claim chip, press **IQ off ⇄ on**. Side by side: LEFT *Foundry IQ unplugged — "no record, nothing checked"*; RIGHT **CONTRADICTED** + the verbatim "24 hours" line from the judge's *own* pasted text + *"medium effort · N reasoning tokens."* Keep **"Foundry IQ is reasoning…"** on screen during the ~8–12s two-call wait. Let *"That's the brain"* land. | The single most concentrated proof Foundry IQ is load-bearing — the **Best Use of IQ Tools** clincher. The token count is the KB's own activity log, not a counter we run. |
| **4** | 75–100s | **Verdict spectrum in one sweep.** Press two more chips from the *same* reply: one the source supports → **GROUNDED** (citation shown); one it's silent on (the engineer-count question) → **UNVERIFIABLE**. Caption it: *"the source is silent, so it won't guess."* Add one line: *"The witness isn't malicious — it's a model filling gaps confidently. The engine is the part that checks."* | Responsible-AI core + the verdict isn't binary. Pre-empts "is the demo staged to fail?" |
| **5** | 100–120s | **BYO close.** Deliver the verdict → **CASE_MADE** (show it's *structurally* incapable of returning SOLVED on your own source). Export the **Grounding Record** with its disclaimer legible. Caption: *"It will never say SOLVED on your source — that guardrail is in the code, not the marketing."* | RAI capstone you can *prove on screen*, and a clean pivot to "now the same engine, where developers actually work." |
| **6** | 120–170s | **Copilot climax (VS Code).** `search.ts` already `ground_on`'d (pre-flight). Briefly flash `.vscode/mcp.json` pointing at the real Azure endpoint. Ask Copilot something so it asserts the wrong claim — *"the retrieve path runs at medium reasoning effort"* — then `check_claim` it → **CONTRADICTED + faithfulness gate HELD**, the verbatim `minimal` line from `search.ts:75` cited, receipt **"Foundry IQ — answer synthesis · N reasoning tokens."** Then check a *true* claim (`kbReason` uses answer synthesis at medium) → **GROUNDED / PASS**, so it reads as a verdict engine, not a buzzer. **Verify on camera the receipt says "Foundry IQ," not "cross-check."** | The Creative-Apps-*with-Copilot* climax and the **only** beat scoring both headline prizes at once: a Copilot hallucination about our *own* code, caught with a receipt the judge can verify in the file on screen. |
| **7** | 170–180s | **Two-receipt close.** Two-pane final frame: the web Grounding Record beside the VS Code `CONTRADICTED` + HELD receipt — the same Foundry IQ call signature visible in both. Hold on it. | Makes "one engine, two surfaces" *visual*, not spoken. The last thing the judge reads is the stacked Copilot + IQ proof. |

**Close line (over the empty paste box, no "lie"):** *"An AI will state things your
source never said — confidently. Foundry IQ catches it with the exact line, in your own
words, or it honestly says it can't. Paste anything."* End on the product doing the thing,
not a logo crawl.

---

## Backup plan

1. **Latency** — medium-effort reasoning is 3–8s; the split fires two sequential calls
   (~8–12s). Never sit on dead air; keep *"Foundry IQ is reasoning…"* on screen so the
   wait reads as suspense.
2. **Rate limit** — a GitHub Models free-tier 429 is the top live risk. Keep questions
   short and well-spaced; record with buffer between takes. Cut to the static
   `CONTRADICTED`+receipt frame if it stalls mid-record.
3. **Copilot beat** — if the live run is shaky or the receipt reads "cross-check," hard-cut
   to the pre-recorded clean take. The judge never knows.

**Proof artifacts (point any "is it real?" reference here):**
`evidence-engine/docs/integration-proof.json` (live KB answer-synthesis trace) and
`spike/output/08-retrieve-verdict.json` (raw end-to-end verdict response with the
reasoning-token count).

---

## Deliberately cut (and why)

- **Self-contradiction** (witness vs. own earlier testimony) — needs ≥2 drifting turns;
  unreliable on a short BYO demo, adds failure surface without advancing the thesis.
- **Take the Stand** (the inversion) — duplicates the same answer-synthesis path already
  proven; held as an optional bonus only if time allows.
- **Voiced verdicts** — browser speech-synthesis capture is unreliable across recording
  setups; zero rubric points, real reliability landmine.
- **Holbrooke scripted case** (FABRICATION CONFIRMED) — strong and safe, but BYO + Copilot
  is more differentiated for this track. Held only as the emergency fallback if BYO
  witness inference 429s on camera.
