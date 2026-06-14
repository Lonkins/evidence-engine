---
name: strategy
description: Creative Apps track strategy — concept decision, build status, locked choices, prize vectors
metadata:
  type: project
---

## Status: STRETCH SET-PIECES + RECEIPTS SHIPPED (June 14) — Holbrooke default, BYO at parity

**June 14, 2026 — Entry 10 (Copilot Receipts) shipped.** The MCP/Copilot surface
is now `ground_on` + `check_claim` against your OWN source: `@ground_on` a file,
notes, or a diff → indexed into Foundry IQ as its own partition → `@check_claim`
audits a statement (incl. one Copilot just made about your code) against *your*
material → GROUNDED / CONTRADICTED / UNVERIFIABLE + verbatim citation + a
faithfulness gate (PASS/HELD) + reasoning-token count, degrading to the disclosed
cross-check when answer synthesis is unavailable. The MCP server now exposes FIVE
tools: `load_case`, `interrogate`, `ground_on`, `check_claim`, `accuse`. "Put your
PR on the stand" is the headline dev story.

**Stretch set-pieces shipped (June 14):** pull-the-plug split-screen (grounding
ON/OFF A/B in one frame), the reasoning-token receipt (`Foundry IQ · medium effort
· N reasoning tokens` vs `cross-check · 0`), Objection Cinema (the challenge moment
staged), You Take the Stand (Foundry IQ interrogates the player), Voice (voiced
verdict — accessibility), and the Grounding Record (exportable cited dossier).

**Scoped unification + unified close shipped (June 14):** ONE flow, two scenarios
with PARALLEL features — both share a witness rail, "Take the stand", a unified
"Deliver your verdict" close, and the Grounding Record. **Holbrooke is now the
DEFAULT example**, with **Bring Your Own Trial at feature parity**. Holbrooke alone
keeps the murder accusation that can reach SOLVED (true killer); BYO has no
ground-truth killer, so its close is CASE_MADE / UNPROVEN only — SOLVED is
structurally unreachable (an honesty guard).

**Verdict labels are GROUNDED / CONTRADICTED / UNVERIFIABLE** (the MCP check_claim
also shows the faithfulness gate). SUPPORTED → GROUNDED and INSUFFICIENT_EVIDENCE →
UNVERIFIABLE; the verdict is Foundry IQ-produced (gpt-4.1-mini bound to
`evidence-kb`, medium effort), with the deterministic regex demoted to a disclosed
cross-check + the offline fallback.

**Deferred:** the internal enum/rail refactor (the verdict-label/witness-rail enum
cleanup) is deferred — not blocking, no judge-visible impact.

---

## Status: IQ-BRAIN LIVE (B0 + B1 done June 13) — Live web = hero surface

**June 13, 2026 — B0 + B1 landed (design-log Entry 6).** Foundry IQ now produces
the verdict on the hero surface. `gpt-4.1-mini` (AIServices `agents-league-hub-resource`,
Standard, eastus) is bound to `evidence-kb`; `outputMode: answerSynthesis` + effort
`medium`. Challenge → the KB reasons and emits `VERDICT: CONTRADICTED` + verbatim
citation; `source: iq` in the response, `kb.reason` in the engine tap. Regex is now a
disclosed, agreeing cross-check. Pull-the-plug OFF → `source: ungrounded`, her word
stands. live-server `.env`: `IQ_VERDICT_ENABLED=true`, `KB_REASONING_EFFORT=medium`.
Build green, 30 tests. Proof: `spike/output/08-retrieve-verdict.json`,
`spike/08-answer-synthesis.sh`.

**A5 done (June 13):** `evidence-engine/verdict-core/` — one tested package
(`@evidence-engine/verdict-core`, 25 tests) consumed by live-server + MCP via a
`file:` dep. The MCP's drifted inline verdict copy is gone; both surfaces run the
identical heuristic + IQ verdict. Offline-web parity deferred (canned Act I).

**A6 done (June 13):** MCP `check_claim` now produces the IQ answer-synthesis
verdict. `foundry-client.ts` gained `reasonVerdict()`; the tool runs
`buildVerdictInstruction → parseIqAnswer → combineWithCrossCheck` and renders the
IQ-led verdict + cited passage + "Decided by: Foundry IQ" in the Copilot output,
degrading to the shared heuristic when Azure is off. Verified vs live KB (Helena
19:45 → source:iq CONTRADICTED, 29,995 reasoning tok). MCP env gains
`IQ_VERDICT_ENABLED` + `KB_REASONING_EFFORT` (default off/minimal).

**A1 done (June 13):** live is now the DEFAULT surface. The desk cold-opens
mid-interrogation — Helena auto-on-the-stand, her planted "I left at 19:45"
already a pulsing claim chip, zero tutorial → challenge → CONTRADICTED + Foundry
IQ citation + FABRICATION CONFIRMED. TitleCard CTA reworked ("Step into the
interrogation"); ModeSwitch retired → "Offline demo · no keys" corner link (Act I
= offline fallback). Fixed a StrictMode double-`connect()` session race. Verified
in-browser at 1440 + 375. Web build green, 34 tests.
**A2 done (June 13):** live accusation close. Crimson "Name the killer" trigger →
`LiveAccusation` set-piece; verdict driven by what the player pinned live
(`evaluateLiveAccusation`, tested): SOLVED (killer + pinned receipt → report),
OVERRULED (caught-lying-but-innocent — "a contradiction is not a confession"),
UNPROVEN (no receipt). Verified in-browser SOLVED end-to-end. 39 web tests.
**CONCEPT PIVOT (June 13, design-log Entry 7):** owner flagged the game felt
static/novelty (we scripted both the lie and the truth). Four-persona reckoning →
locked: (1) keep it a game; (2) **grey band = first-class UNVERIFIABLE verdict**,
all copy aligned to Foundry IQ's "grounded answers to reduce hallucination"
(**Part 1 DONE**); (3) **"bring your own trial"** — user pastes their own
story/notes/code, engine interrogates a witness grounded in *it* (Part 2 next);
Holbrooke stays as the built-in example + deterministic video hero. Reuses the
index/partition/upload plumbing. Deadline June 14 — timebox BYO, protect Section C
(host/video/receipts/Discord), never break the verified Holbrooke path.
**Part 2 DONE (June 13) — "bring your own trial":** POST /api/session takes
{source,title,witnessName}; text is chunked + indexed as its own evidence
partition (case_id 'byo-<uuid>'); a single custom witness is grounded in it;
challenges run answerSynthesis over that partition; reset purges it. Web: TitleCard
"put your own source on trial" → ByoIntake (paste) → BYO desk (no suspect rail/
accusation, "New trial" link). Verified in-browser: pasted a drone field manual →
witness hallucinated a NASA-satellite backstory → challenge → UNVERIFIABLE grey
band against the user's own source ("a confident claim with no receipt is exactly
where hallucinations hide"). Holbrooke untouched as the built-in example. Builds
green; 39 web + 30 server tests.
**Uniform flow done (June 13):** neutral scenario chooser intro + one desk shell
for both paths (same header, "On the stand" rail — 3 suspect cards for Holbrooke,
1 `WitnessStand` card for BYO, same panel/engine-tap). Verified both in-browser.

**Inference-driven multi-persona BYO — DONE (June 13, design-log Entry 8).** On
ingest, an LLM (`witnesses.ts` `extractWitnesses`) infers 1–3 witnesses from the
source (story characters / the author / code-witnesses); they show in the same
selectable rail as Holbrooke (`WitnessStand`); the manual witness-name field is
gone. Sessions hold `witnesses[]`; `handleAsk` resolves the selected witness;
`buildByoSystemPrompt` plays that persona. Verified in-browser: story → 3
witnesses → switch to Tom → CONTRADICTED with grounded citation. Builds green;
tests pass.

**The Grounding Record — DONE (June 13, design-log Entry 9).** The "so what" after
a catch: each challenge files into a live, growing, exportable record (Grounded /
Contradicted-with-"source says" / Unverifiable-held). "The Record (N)" trigger in
the live header → modal with cited rows, counts (never a score), a faithfulness-
not-truth disclaimer, and Export-to-markdown. Universal (Holbrooke + BYO). No 2nd
IQ call — reuses the verdict's existing justification/citation. The MCP check_claim
gains a "Faithfulness gate: PASS/HELD" line. Verified in-browser.

**Also queued:** the "Receipts" Copilot rework (rival's idea, v2 headline).
**Section C (host/video/receipts/Discord) is owned by the user. Deadline June 14.**

---

### Prior status (the repositioning that B0/B1 just fulfilled)

**June 13, 2026 — critical review + locked redesign (design-log Entry 4).** A
first-hand code review (four-persona lenses; subagents were rate-limited so the
orchestrator ran them directly) found the headline claim *"the IQ layer is the
game engine"* is **false today**: in all three surfaces (MCP, web Act I, live
Act II) Foundry IQ only retrieves; a **local regex** makes the actual verdict.
Root cause: KB provisioned LLM-free (`extractiveData` + `minimal` effort) to
stay on the free tier, which *cannot* synthesise a judgment.

**Two decisions locked with the user:**
1. **Live web interrogation is THE product.** MCP server + offline Act I demoted
   to supporting evidence (Copilot proof / offline fallback).
2. **Full rebuild — Foundry IQ becomes the verdict brain.** Wire a model to the
   KB, use `answerSynthesis` + `low`/`medium` effort so the KB reasons and
   returns the grounded verdict + citation. Regex demoted to disclosed
   cross-check. **Free-tier constraint lifted** (resources unlimited).

**Next action: provisioning spike — confirm `answerSynthesis` returns a grounded
verdict with citations (Azure OpenAI/GitHub Models bound to `evidence-kb`).**
Full spec + build order: `evidence-engine/docs/design-log.md` Entry 4.

---

### Prior status (superseded by the repositioning above)

Overnight loop 1 complete (June 10, 2026). MCP server scaffold, 15-document case corpus, and README built.

## Locked Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Concept | **Evidence Engine** — detective game where every character claim is grounded by Foundry IQ agentic retrieval; player catches lies using citations | Only concept where IQ is load-bearing; inverts the hallucination problem as gameplay |
| IQ layer | **Foundry IQ** (Azure AI Search knowledge base + agentic retrieval) | Only viable layer for this use case; Work IQ + Fabric IQ blocked behind enterprise accounts |
| App shape | MCP server (stdio) for GitHub Copilot in VS Code | Explicitly called out in track brief as "especially welcomed" |
| Scope | One hand-authored synthetic detective case — The Holbrooke Gallery Affair | Free tier: 3 indexes / 50MB cap; one great case > mediocre engine |
| Azure Search tier | Free ($0/month) | Confirmed working in spike stages 0–5 |
| API version | `2026-05-01-preview` | Locked in spike; schema shapes are non-obvious in older versions |
| Retrieval request shape | `intents` (not `messages`) | `messages` unsupported at `minimal` effort; locked in spike stage 4 |

## Build Status

> **SUPERSEDED (June 14) — see the status blocks at the top of this file.** This
> table reflects the pre-IQ-brain, pre-stretch state. Known-stale rows: "4 tools"
> (now FIVE: load_case, interrogate, ground_on, check_claim, accuse); the verdict
> is now Foundry IQ-produced, not a local regex; the witness-name field was removed
> (BYO infers 1–3 witnesses); "Live Wire" was retired (live is the default surface).

| Component | Status | Notes |
|-----------|--------|-------|
| Concept | ✅ Locked | Evidence Engine — unanimous 4/4 persona consensus |
| IQ integration | ✅ Wired (dev + Azure) | foundry-client.ts: Azure AI Search REST, local fallback |
| MCP server | ✅ Built + verified | SUPERSEDED: now FIVE tools (load_case, interrogate, ground_on, check_claim, accuse); IQ-produced verdict; TypeScript, tsc clean build |
| Case corpus | ✅ Built | 15 documents — statements, security log, forensics, motive doc |
| README | ✅ Done | Architecture Mermaid diagram, setup guide, responsible AI section |
| COPILOT_USAGE.md | ✅ Done | 6 specific Copilot interactions documented |
| .vscode/mcp.json | ✅ Done | stdio transport, env var inputs for Azure |
| Demo script | ✅ Done | `docs/demo-script.md` — 3-min shooting script, 7 segments, pre-flight checklist |
| Discord post | ✅ Done | `docs/discord-post.md` — 3 templates + timing strategy |
| Game walkthrough | ✅ Done | `docs/game-walkthrough.md` — full transcript with exact tool calls + expected outputs |
| Web UI | ✅ Built + verified (June 11) | `evidence-engine/web/` — React/Vite noir detective desk. Pressable claim chips → stamped verdicts (VERIFIED/CONTRADICTED/NO RECORD) with verbatim citations; evidence board fills in via citations; sealed questions unlock on discovery; archive search fails closed ("the evidence is silent"); full-screen accusation set-piece. Fully static (no keys), 76 kB gz JS, 34 unit tests incl. citation-integrity (every quote verified verbatim vs corpus). Same win condition as MCP server. Playthrough verified in browser end-to-end. |
| Live Interrogation (WP9) | ✅ Built + verified live (June 11) | SUPERSEDED: "Live Wire" was retired (live is now the DEFAULT surface, not a separate mode); the verdict is now Foundry IQ answer-synthesis (gpt-4.1-mini bound to evidence-kb), with gpt-4o-mini only playing the witnesses. Open free-form chat with the suspects. `evidence-engine/live-server/` (Node) holds the only two secrets (search admin key + GitHub Models token — `gh auth token` works); browser keyless. Every turn = live Foundry IQ retrieve (filterAddOn `doc_type eq 'evidence'`, knowledge source `evidence-ks`) → gpt-4o-mini in character (drift allowed BY DESIGN) → each sentence indexed as `testimony` doc (session_id/speaker/turn_no) in the same single index. Challenge = two live retrieves: evidence partition (SUPPORTED/UNSUPPORTED/CONTRADICTED; claim-calibrated threshold 2.0 — grounded ≥2.2, fabricated ≤1.5, measured live) + speaker's own testimony partition (SELF_CONTRADICTION on clock-time conflicts, earlier statement shown verbatim with turn number). Verdict heuristics gate on claim-relevant sentences/log-lines incl. speaker name. Wiretap "engine tap" panel renders every live call (step/latency/status) — judges SEE the IQ layer working in real time. Session reset filter-deletes testimony docs (index stays tiny). Full demo path verified vs LIVE KB: planted lie CONTRADICTED w/ citation, Helena cracks under badge-log press → SELF_CONTRADICTION, scorecard, cleanup of 13 docs. Proof artifact: `evidence-engine/docs/live-mode-proof.json`. Index migration: `spike/07-add-live-fields.sh` (additive, $0). Case File mode untouched (offline judge-without-keys path); backend down → "LINE DEAD" gate, never fakes live. 18 server unit tests; web 34 tests; both builds green (web 81 kB gz). |

## Prize Vectors

> **SUPERSEDED (June 14):** the 15–20% estimate predates the IQ-brain rebuild, the
> stretch set-pieces, Copilot Receipts, and BYO. Re-estimate against the current
> hero (live Foundry IQ verdict + verbatim citation + engine tap) rather than the
> "working Copilot demo" baseline below.

Creative Apps prize value TBC. Win probability est. 15–20% with a working Copilot demo.

## Open Items (Human-Gated)

> **SUPERSEDED (June 14):** Azure is provisioned and the KB has a model bound
> (gpt-4.1-mini → evidence-kb); the spike 0–5 provisioning and corpus upload below
> are DONE. The live remaining items are host/video/receipts/Discord (Section C,
> owned by the user).

- [x] Run spike scripts 0-5 to provision Azure AI Search — DONE (KB live, model bound)
- [x] Upload corpus documents to Azure AI Search index — DONE
- [ ] Fill in .env with AZURE_SEARCH_ENDPOINT and AZURE_SEARCH_KEY
- [ ] Record demo video (3 min): 20s title card → 90s web app catch-the-lie (press claim → CONTRADICTED stamp → board pins hot → accusation set-piece) → 40s MCP in Copilot Chat → 30s architecture
- [ ] Host `evidence-engine/web/dist/` (GitHub Pages / Azure Static Web Apps) — build is static, `base: './'`, no keys needed
- [ ] Post to Discord #creative-apps with video + GIF of lie-catching moment

## Autonomous Next Steps

All autonomous actions complete. Remaining items are human-gated.

### Completed (Cycle 13 — June 11, 2026)

✅ `check_claim` temporal-conflict detection fix — replaced hardcoded keyword heuristic ("shows", "records", "card_exit") with:
  1. Temporal conflict: extracts HH:MM times from claim and document; flags CONTRADICTED only when every doc timestamp differs from every claim timestamp by >5 minutes
  2. Explicit negation phrases only: "does not", "did not", "was not", "no record", "denied", "contradicts", "inconsistent with"
  3. Removes false positive risk: prior code would CONTRADICT any document containing common words like "records" or "shows"
✅ Build verified clean (tsc, no errors)

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| June 10 | Track setup complete | Added as parallel track alongside Enterprise Agents |
| June 10 | Spike stages 0–5 complete | Free tier confirmed; API contract locked; KB native MCP endpoint live (zero-glue Copilot integration) |
| June 10 | IQ verification: Foundry IQ only viable layer | Work IQ + Fabric IQ blocked behind enterprise accounts |
| June 10 | Concept locked: Evidence Engine (4/4 persona consensus) | Only concept with load-bearing IQ; highest differentiation |
| June 10 | MCP server scaffold + corpus built (overnight loop 1) | Core playable game deliverable; Azure integration ready to wire |
| June 12 | Three-act learning journey (design-log Entry 3): Act I Briefing (scripted training, offline) → Act II Live Interrogation → Act III Debrief with "what you just practised". Title card states the hallucination thesis up front; training banner teaches the move and unlocks Act II on first claim press; act switch with honest sublabels lives in the headers. No engine changes; verified end-to-end in browser. | User feedback: flow unintuitive, learning point implicit. The arc IS the judge story: problem → skill → live stakes → takeaway. |
| June 12 | Judging-led Live Wire redesign (4-persona protocol run; full log in `evidence-engine/docs/design-log.md`) | P1+P3 convergent blocker: UNSUPPORTED scored as a "catch" → game exploitable + overclaims; fix scoring first. Build order: scoring semantics → ground-truthed planted fabrications → demo resilience (HH:MM + 429 retry) → guided first beat + objective → wiretap origin tags (azure/model/heuristic) → honest framing copy → submission surfaces (README quickstart, COPILOT_USAGE, demo script, Discord draft). CUT (P4): full onboarding, confront mechanic, trust meters, refactors. Human-gated: video, hosting, Discord post. |
