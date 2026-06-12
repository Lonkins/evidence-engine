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
