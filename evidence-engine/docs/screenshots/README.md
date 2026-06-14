# Evidence Engine — Demo Screenshots

Submission screenshots for the **hosted live web app** — the hero surface. A live
model plays the witnesses (and is allowed to drift); when you challenge a claim,
Foundry IQ returns the verdict with a verbatim cited receipt. Capture these against
the live backend (`live-server` running, `IQ_VERDICT_ENABLED=true`) so the engine-tap
panel shows the real `AZURE` calls.

## Required beats (live web hero)

| File | Beat | Status |
|------|------|--------|
| `01-cold-open.png` | The cold open — the noir interrogation desk with the default *Holbrooke Gallery Affair* loaded: witness rail, the open free-form chat, the engine-tap panel idle | pending |
| `02-contradicted-live.png` | **HERO.** Challenge Helena's departure claim → live `CONTRADICTED` stamp + the deciding passage quoted **verbatim** + the **reasoning-token receipt** (`Foundry IQ · medium effort · N reasoning tokens`), engine tap showing the live `AZURE` step | pending |
| `03-pull-the-plug.png` | **Pull-the-plug split-screen.** The same sentence side-by-side: Foundry IQ unplugged (no record, her word stands) next to Foundry IQ in the loop (`CONTRADICTED`, cited) — grounding on/off in one frame | pending |
| `04-grounding-record.png` | The **Grounding Record** export — the growing cited dossier (kept / contradicted / unverifiable, each with its citation) you leave the interrogation with | pending |
| `05-byo-emergent-lie.png` | **Bring Your Own Trial.** Paste your own doc/notes/code → an inferred witness drifts → Foundry IQ catches an **emergent, unscripted** claim against *your* source (`CONTRADICTED` or `UNVERIFIABLE`), cited | pending |
| `06-copilot-receipts.png` | **Copilot Receipts in VS Code.** `@ground_on` your own file, then `@check_claim` a statement Copilot made about it → `GROUNDED / CONTRADICTED / UNVERIFIABLE` + faithfulness gate (PASS/HELD), cited line | pending |

**`02-contradicted-live.png` is the submission's hero image** — it must show:
- The `CONTRADICTED` verdict stamp
- The deciding passage (e.g. the security-log line) quoted **verbatim** in the citation
- The **reasoning-token receipt** — `Foundry IQ · medium effort · N reasoning tokens` (vs the cross-check at `0`)
- The engine-tap panel with the live `AZURE` answer-synthesis step visible

## Instructions

1. Start the live backend: `cd evidence-engine/live-server && npm install && npm run build`,
   copy `.env.example` to `.env` (Azure search endpoint + admin key, `IQ_VERDICT_ENABLED=true`,
   `KB_REASONING_EFFORT=medium`, `GITHUB_MODELS_TOKEN=$(gh auth token)`), then `npm start`.
2. In another shell: `cd evidence-engine/web && npm run dev` → open the app.
3. Interrogate the witness in free-form chat, then challenge the time claim — wait for the
   live verdict and confirm the engine tap shows the `AZURE` step before capturing.
4. For `03`, press the **IQ off ⇄ on** button on the first claim (before challenging it) to stage the split-screen.
5. For `05`, switch to **Bring Your Own Trial**, paste demo-safe text, interrogate the
   inferred witness, and challenge a claim it invents.
6. For `06`, open VS Code with `evidence-engine/` loaded and the `evidence-engine` MCP
   server active in Copilot Chat (Agent mode); run `ground_on` then `check_claim`.
7. Screenshot each beat in full (include the surrounding UI / Copilot panel) and save with
   the filenames above.
