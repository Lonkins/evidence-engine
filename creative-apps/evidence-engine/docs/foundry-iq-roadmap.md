# Evidence Engine — Foundry IQ Complete User Flow & Deliverables

> The single source of truth for where the product is going. Compiled from the
> four-persona reviews (Foundry IQ capability maximalist, game/experience
> designer, prize strategist, rival team), design-log Entries 4–5, and our own
> intuition. Goal: **one product, all-in on Foundry IQ, a unique and fun loop**
> that wins Creative Apps + "Best Use of IQ Tools."

---

## 1. Product definition (the sentence judges repeat)

> **An AI witness lies to your face about a murder; Foundry IQ catches her in the
> act and shows you the receipt.**

The villain is a fluent, hostile liar (a live model, free to drift). The hero is
an incorruptible fact-checker that can only speak in quoted evidence (Foundry IQ
over the case file). The drama is the gap between them — and you watch them fight,
live, in the engine tap.

**One product.** The hosted **live web interrogation** is THE product. Everything
else is *supporting evidence*:
- **MCP server in Copilot Chat** → the "especially welcomed" GitHub Copilot proof.
- **Offline Act I** → the no-keys, no-backend fallback for a judge who won't run a server.
- **`spike/` raw responses + `live-mode-proof.json`** → the credibility trail.

---

## 2. The complete Foundry IQ user flow (target)

The loop where Foundry IQ does genuinely deep work on *every* beat — not one
shallow retrieval call. Remove Foundry IQ and five of seven steps collapse.

| Beat | What the player does | What Foundry IQ does | Status |
|------|----------------------|----------------------|--------|
| **Cold open** | Lands mid-interrogation; Helena's "I left at 19:45" is already on screen, one claim chip pulsing | Pre-seeded; teaches the loop in ~16s with zero tutorial | ✅ live (A1, June 13) |
| **Ask** | Questions a witness | `kbRetrieve` (minimal effort) grounds the witness on retrieved passages only — so drift is *detectable* | ✅ live |
| **Drift & index** | Witness answers, partly invents | Each sentence indexed as testimony within seconds (freshness) — now itself challengeable | ✅ live |
| **Challenge** | Presses a sentence they doubt | **`answerSynthesis` (medium effort): the KB reasons and emits the verdict + verbatim citation** — IQ is the brain | ✅ live (B0/B1, June 13) |
| **Cross-reference** | — | (a) self-consistency vs the witness's own earlier testimony; (b) *federation*: which sub-corpus (forensics/comms/financial) breaks the alibi | (a) ✅ live · (b) gated |
| **Cite** | Reads the receipt | Verbatim passage + docKey, joined by `ref_id` so the quote is provably grounded; regex runs as a disclosed cross-check | ✅ live |
| **Wiretap** | Watches IQ think | The KB's native `activity[]` (search count, reasoning tokens, effort tier) streams into the engine tap | ✅ partial (token count live; full activity stream = #A4) |
| **Pull the plug** | Flips grounding OFF/ON | OFF → nothing to check, her word stands; ON → CONTRADICTED lands. The thesis, made interactive | ✅ live |
| **Accuse** | Names the killer, attaches exhibits | Right suspect + convicting evidence = solved; lied-but-innocent = `OVERRULED` | ✅ live (A2, June 13) |
| **Debrief** | "What you just practised" | fluent ≠ true · a citation beats confidence · unverifiable ≠ false | ✅ live (Act III) |

---

## 3. Deliverables

### A. Buildable now (no Azure) — the next session's work

| # | Deliverable | Why (axis / source) | Effort | Notes |
|---|-------------|---------------------|--------|-------|
| **A1** | ✅ **One-product flow + cold-open** (June 13) | UX, Creative Innovation (designer) | M–L | DONE. Live is the default surface; the desk cold-opens mid-interrogation — Helena auto-on-the-stand, her planted "I left at 19:45" already on screen as a pulsing claim chip, zero tutorial. TitleCard CTA reworked ("Step into the interrogation", live-first copy). ModeSwitch retired from the main flow → a subtle "Offline demo · no keys" corner link (Act I demoted to the no-backend fallback). Header retitled "The Interrogation Room". Fixed a real StrictMode double-`connect()` session race (caused "Unknown claim" on challenge). Verified in-browser (desktop 1440 + mobile 375): cold-open → challenge → CONTRADICTED + Foundry IQ citation + FABRICATION CONFIRMED; no overflow. Web build green, 34 tests. |
| **A2** | ✅ **`OVERRULED` accusation in the live close** (June 13) | Replayability + Responsible AI (designer, rival) | M | DONE. Live accusation set-piece (`LiveAccusation.tsx`, reuses `accusation.css`), reached from a crimson "Name the killer" trigger in the live header. The verdict is driven by what the player pinned *live* (`evaluateLiveAccusation` over `live.challenges`, tested): **SOLVED** (killer + a pinned contradiction → close → the report), **OVERRULED** (you accuse someone you caught lying but who didn't do it — "a contradiction is not a confession"), **UNPROVEN** (a name with no pinned receipt). Verified in-browser: cold-open → challenge Helena → accuse Helena → CASE SOLVED → debrief. Web build green, 39 tests (5 new). |
| **A3** | **"She adapts" second turn** | Technical Excellence, "it's really reasoning" (engineer) | M | When a plant is pinned, the witness shifts her story and the shift is itself checkable — lying digs a deeper hole. Prompt work in `characters.ts` + a re-challenge beat. |
| **A4** | **Full `activity[]` stream in the wiretap** | Best Use of IQ (engineer) | S | Beyond the token count: render the KB's `searchIndex` step(s) + `agenticReasoning` as their own engine-tap lines so the judge sees the reasoning, not just latency. |
| **A5** | ✅ **Shared verdict-core** (June 13) | Technical Excellence (strategist) | M | DONE. `evidence-engine/verdict-core/` — one typed, tested package (`@evidence-engine/verdict-core`, 25 tests) consumed by live-server and the MCP server via a `file:` dep. The MCP's drifted inline check (own `extractTimes`/`EXPLICIT_CONTRADICTION_PHRASES`, `INSUFFICIENT EVIDENCE` label) is gone — both surfaces now run the identical heuristic + IQ verdict. Offline-web Act I parity deferred (canned; Vite cross-root friction, low value). Builds green, behaviour unchanged end-to-end. |
| **A6** | ✅ **MCP `check_claim` rewired to the IQ verdict** (June 13) | GitHub Copilot + Best Use of IQ (rival) | M | DONE. `foundry-client.ts` gains `reasonVerdict()` (answer-synthesis `messages` call, `doc_type eq 'evidence'`, same shape as live-server's `kbReason`); `check_claim` runs `buildVerdictInstruction → parseIqAnswer → combineWithCrossCheck` and renders the IQ-led verdict + cited passage + reasoning-token count in the Copilot output, disclosing "Decided by: Foundry IQ". Degrades to the shared heuristic when Azure/answerSynthesis is off (never fakes IQ). Verified against the live KB: Helena's 19:45 → `source: iq`, CONTRADICTED, 29,995 reasoning tokens, verbatim badge-log citation. Closes the rival's "your hero moment isn't in Copilot" attack. |
| **A7** | **Replayability: load-bearing red herrings** | Replayability (designer) | M | Make Felix/Nora plants matter — catching a true contradiction that points at the wrong person. Skill = catch the lie that puts someone alone with the body, not every lie. |

### B. Gated on the Azure provisioning spike (the hard dependency)

| # | Deliverable | Why | Notes |
|---|-------------|-----|-------|
| **B0** | ✅ **Answer-synthesis provisioning spike** (June 13) | **Unblocked the IQ-brain claim** | DONE. `gpt-4.1-mini` (AIServices `agents-league-hub-resource`, Standard) bound to `evidence-kb`; PUT `outputMode: answerSynthesis` + `models[{kind:azureOpenAI,...}]` + effort `medium` → 204. `/retrieve` with `messages` → synthesised `VERDICT: CONTRADICTED` + verbatim badge-log PASSAGE + 12 references[]. Lead-token survives. Proof: `spike/output/08-retrieve-verdict.json`; shapes in `SPIKE_LOG.md` stage 8. |
| **B1** | ✅ **Flip `IQ_VERDICT_ENABLED=true` + reconcile** (June 13) | Best Use of IQ | DONE. `iq-verdict.ts`/`search.ts` reconciled to the real shape (quote + `[ref_id:N]` strip); live-server `.env` sets `IQ_VERDICT_ENABLED=true`, `KB_REASONING_EFFORT=medium`. Verified end-to-end: challenge Helena's 19:45 → `source: iq`, `CONTRADICTED`, verbatim citation, `kb.reason` in the engine tap; grounding OFF → her word stands. Build green, 30 tests pass. |
| **B2** | Multi-source KB federation | Creative + Best Use of IQ (engineer) | forensics-ks / comms-ks / financial-ks; verdict names *which* source broke the alibi. Strategist ranks below the line — do after B0–B1 land. |
| **B3** | Permission-trimmed "sealed evidence" | Creative (engineer) | A query key + document-level security filter; sealed docs unlock when the player earns a "warrant." Also closes the admin-key least-privilege gap. |
| **B4** | Vector hybrid | Closes paraphrase miss-rate | Defer — highest effort, lowest marginal demo value. |

### C. Submission / presentation (human-gated)

| # | Deliverable | Why | Notes |
|---|-------------|-----|-------|
| **C1** | **Host the web app + live backend** behind one URL | UX (+20pp) — existential | A judge will not run three terminals. Azure Static Web Apps + a small Container App for live-server. |
| **C2** | **Record the 60–90s kill-shot video** | 90% of judging (strategist) | Ask Helena → she drifts → challenge → live CONTRADICTED + verbatim citation, engine tap visible. **Record AFTER B0** or you film the regex. Fixed, low-temp, pre-walked path. |
| **C3** | **Real Copilot receipts** | Required category | Actual VS Code Agent-mode transcripts/screenshots, not prose. |
| **C4** | Pre-rendered canonical GIF/video as the fallback | Demo-day resilience | The hosted backend is a single point of failure under community-vote traffic. |
| **C5** | Engineered Discord drop | ~10% community vote | Kill-shot GIF + hosted link, self-reply for engagement. Day of submission. |

### D. Bold / ambitious (resources unlimited)

| # | Deliverable | Why |
|---|-------------|-----|
| **D1** | **Voice interrogation** (Azure speech: witness TTS, player STT) | Category-jump wow — "the AI lied to me out loud." Best community-vote + social travel. |
| **D2** | **Case packs** (a second 15-doc corpus, same engine via `case_id`) | Signals a *product*, not a demo. Anthology framing. |

---

## 4. Done this session ✅

- Pull-the-plug grounding toggle (engine + web UI).
- Time-of-death stakes on the kill-shot.
- Catch set-piece animation.
- Foundry IQ reasoning line on verdicts + `agenticReasoning` token count in the trace.
- IQ-driven verdict core (`iq-verdict.ts` / `kbReason`), speculative, flag-gated.
- README credibility fix; design-log Entries 4–5.

---

## 5. Recommended sequence

1. ✅ **B0 + B1 DONE (June 13)** — the IQ-brain verdict is live in the live-server; "Best Use of IQ" is now real on the hero surface.
2. ✅ **A5 + A6 DONE (June 13)** — shared `verdict-core` package consumed by live-server + MCP; the MCP `check_claim` now produces the IQ answer-synthesis verdict (identical story across surfaces, Copilot axis reclaimed).
3. ✅ **A1 DONE (June 13)** — live is the default surface, cold-open on the lie, Act I demoted to an offline link, CTA reworked. Hero moment in seconds, verified in-browser.
4. **A2, A3, A7** (OVERRULED, adapts, red herrings) — depth, replayability, "it's really reasoning."
5. **A4** (full activity stream) — cheap IQ-visibility polish.
6. **C1 → C2 → C3 → C5** (host, then record against prod, receipts, Discord).
7. **B2/B3, D1/D2** — federation, sealed evidence, voice, case packs as reach.

**The rule (strategist's tiebreak):** on the IQ axis, ship the ambitious thing or
the named prize is unwinnable — pay for a tier if you must. On every other axis, a
working modest feature out-scores a broken ambitious one in a video-judged field
of 232.
