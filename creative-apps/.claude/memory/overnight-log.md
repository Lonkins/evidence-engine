---
name: overnight-log
description: Log of autonomous development cycles for the Creative Apps track
metadata:
  type: project
---

## Setup — June 10, 2026

Track directory created. CLAUDE.md and memory structure initialised. Awaiting first concept-selection session.

No cycles run yet.

---

## Cycle — June 11, 2026 (Prize Strategy Cycle)

**Context:** Both tracks code-complete. 3 days to deadline. Question: highest-value autonomous action.

**Prize strategy analysis:**

Ranked viable autonomous actions by expected value:

| Action | EV Delta | Reasoning |
|--------|----------|-----------|
| Discord posts | +$600-1,200 | Highest EV but human-gated — requires demo video first. Blocked. |
| Create creative-apps submission.md | +$300-600 | Best pure autonomous action. Eliminates submission form friction. Also de-risks Creative Apps entry being abandoned under deadline pressure. |
| Second detective case | +$0-100 | Not on judging rubric. One tight case > two rushed ones. |
| Web UI | +$50-150 | Marginal polish; adds June 14 build/deploy risk. |

**Action taken:** Created `evidence-engine/docs/submission.md` — pre-filled Creative Apps submission form.

**What was built:**
- Complete pre-filled submission form (project name, one-liner, short description, long description ~750 words)
- IQ Tools integration summary table with evidence pointers
- GitHub Copilot integration summary table (4 modes documented)
- Tech stack table
- Demo video section with 3-minute flow breakdown and [FILL] placeholders for video/repo URLs
- Key files for judges
- Submission checklist (8 items)
- June 14 execution order — numbered 10-step script for deadline day

**Key design decision:** The submission.md serves a dual purpose. It is both the submission form and the execution anchor for June 14. One document the human reads that tells them exactly what to do, in what order, with no decisions required.

**Next priority for autonomous cycles:** All pure autonomous actions are now complete. Remaining items are human-gated:
1. Record demo video (3 min, `docs/demo-script.md`)
2. Make GitHub repo public
3. Post Discord (Template A, `docs/discord-post.md`)
4. Enterprise: record RiskRadar demo video and post enterprise Discord
5. Submit both tracks before June 14 EOD

---

## Cycle — June 12, 2026 (handoff execution: judge-credibility fixes)

**Context:** Executed the open-ended handoff prompt (`open-ended-agent-prompt.md` in user memory). Verified each claimed blocker against the actual repo before acting — two of three were partially stale.

**Findings vs. the assessment:**
- Blocker #1 (MCP config): real, but the premise was wrong — VS Code `mcp.json` DOES support `inputs`/`promptString`. The actual problem was friction: every server entry demanded prompts before starting. Fixed properly.
- Blocker #2 (Azure provisioning unverified): stale — the spike trail IS committed in this branch (`spike/SPIKE_LOG.md`, `spike/output/*.json` raw Azure responses, `evidence-of-pass.json`). What was missing was a judge-facing index of it. `spike/README.md` (referenced twice, never existed) now provides it. Azure CLI access denied in this session, so no live re-verification; committed artifacts are the proof.
- Blocker #3 (demo narrative): already fixed in a prior cycle — `demo-script.md` v2 "KILL-SHOT SCRIPT" has the hero moment. No change needed.
- Responsible AI reframing: already done in a prior cycle — README section is honest and detailed. No change needed.

**Changes made:**
1. `.vscode/mcp.json` — `evidence-engine` stdio server is now zero-config: no inputs, no env; `cwd: server/` so dotenv picks up `server/.env` when present (live mode) and falls back to local corpus otherwise. KB-native HTTP MCP entry keeps its single key prompt (only fires if started).
2. `spike/README.md` — new judge-facing provisioning trail: 60-second proof table pointing at committed raw artifacts + reproduce-from-scratch script order. Fixes dead references in README.md:153 and server/.env.example.
3. `README.md` — "Judge in 2 minutes" item 3 now links the provisioning trail; "Playing the Game" Option A documents zero-config behavior and the `.env` live switch.

**Verification:** server build green; MCP stdio smoke test passes zero-config (initialize → 4 tools listed); `check_claim` on Helena's 7:45pm lie returns CONTRADICTED offline via the real protocol; web 34/34 tests, live-server 18/18 tests, both builds green.

**Still human-gated (unchanged):** demo video recording, hosting, repo public, Discord posts, submission before June 14 EOD.

---

## Cycle — June 13–14, 2026 (consolidated: IQ-brain + stretch set-pieces + BYO + unification)

**Context:** Final push before deadline. The product moved from "deterministic regex returns the verdict, Foundry IQ does retrieval" to **"Foundry IQ produces the verdict."** This entry consolidates all June 13–14 work.

**1. The IQ brain — answer synthesis (spike 08).** The headline change. The knowledge base now runs answer synthesis (`outputMode: answerSynthesis`, `gpt-4.1-mini` bound to `evidence-kb`, reasoning effort `medium`) and *returns the verdict itself* — `VERDICT: CONTRADICTED` + the verbatim deciding passage + `references[]`. Raw end-to-end response committed at `spike/output/08-retrieve-verdict.json` (`modelQueryPlanning → searchIndex → modelAnswerSynthesis → agenticReasoning`, 10,155 reasoning tokens). The deterministic check is **demoted to a disclosed cross-check** + the no-keys fallback — never the headline decision. Verdict labels are now **GROUNDED / CONTRADICTED / UNVERIFIABLE** (the stale SUPPORTED / INSUFFICIENT_EVIDENCE pair was retired). Gated behind `IQ_VERDICT_ENABLED` / `KB_REASONING_EFFORT`.

**2. Stretch set-pieces — making the reasoning visible.** Pull-the-plug split-screen (grounding ON/OFF A/B in one frame — her word stands vs. CONTRADICTED+cited); the reasoning-token receipt (`Foundry IQ · medium effort · N reasoning tokens` vs. `cross-check · 0`); Objection Cinema (the challenge moment staged); You Take the Stand (Foundry IQ interrogates the *player*); Voice (voiced verdict, an accessibility feature); self-conviction by a witness's own earlier indexed testimony, cited with turn number.

**3. Copilot Receipts — `ground_on` + `check_claim` against your OWN source.** MCP tool count moved from four to **five**: `ground_on` indexes the user's pasted source (file/notes/code/diff) into its own Foundry IQ partition, then `check_claim` audits a claim — including one Copilot just made about the code — against *their* material, returning GROUNDED / CONTRADICTED / UNVERIFIABLE + a **faithfulness gate** (PASS/HELD) + reasoning-token count. "Put your PR on the stand." Degrades to the deterministic cross-check (never fakes an IQ verdict); Azure's content filter intermittently rejects synthesis on security-sensitive code — disclosed.

**4. BYO inference + the Grounding Record.** Bring Your Own Trial now **infers 1–3 witnesses** from the pasted source rather than asking the user to author them; lies are emergent/unscripted, checked live against their text. Every catch files into the exportable **Grounding Record** (kept / contradicted / unverifiable, each cited) — the post-catch payoff, so you leave with a cited dossier, not just a stamp.

**5. Scoped unification — one flow, two scenarios, parallel features.** Holbrooke is now the **default example** (not a separate "Act I"); the chooser is neutral. BOTH scenarios share a witness rail, "Take the stand" (IQ interrogates the player), a **"Deliver your verdict"** close, and the Grounding Record. Holbrooke keeps the murder accusation that can reach **SOLVED** (true killer); BYO has no ground-truth killer, so its close is **CASE_MADE / UNPROVEN only** — SOLVED is structurally unreachable as an honesty guard.

**Deferred (scoped out, not done):** the verdict-enum and witness-rail refactor — the unification was applied at the flow/close level; a full shared-enum + shared-rail component refactor was deferred to avoid June 14 regression risk.

**RA spine reaffirmed:** evidence-relative verdicts (never "lying"/"false"/"guilty"), UNVERIFIABLE first-class, counts not trust-scores, "your source says…", disclaimers bound to artifacts; the engine tap tags every step AZURE / MODEL / LOCAL so the IQ-vs-cross-check split is disclosed, not discovered.

**Verification:** live-server build green with a new `sessions.test.ts`; existing web + live-server suites green. Hosting, repo-public, demo video, Discord, and final submission remain human-gated.
