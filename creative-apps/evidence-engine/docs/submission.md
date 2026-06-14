# Evidence Engine — Hackathon Submission

> Pre-filled submission form for the Creative Apps track.
> Copy each section into the corresponding field on the submission portal.
> Fields marked [FILL] require a human action before submitting.

---

## Project Name

Evidence Engine

---

## One-Line Description

A live web detective game where an AI witness lies to your face — and Foundry IQ catches it in real time, returning the verdict with a verbatim cited receipt. Then bring your own source and put the AI on the stand grounded in your material.

---

## Short Description (~280 characters)

Evidence Engine is a hosted web app where a live model plays witnesses who drift and lie. Challenge a claim and Azure AI Search's Foundry IQ knowledge base reasons over the case file with answer synthesis, returning GROUNDED / CONTRADICTED / UNVERIFIABLE with the deciding passage quoted verbatim. It also ships as an MCP server for GitHub Copilot.

---

## Long Description (500–800 words)

### The Concept

Most AI games have the same problem: you cannot trust what the AI says. Evidence Engine turns that problem into the game mechanic — and the lie detector is **Foundry IQ**, not our code.

The hero product is a hosted web app. A live model plays the witnesses in *The Holbrooke Gallery Affair*: a gallery owner is found dead, three suspects were present, and the model is deliberately allowed to drift and invent beyond the evidence. You interrogate them in open chat. When a story sounds wrong, you challenge the claim — and the Azure AI Search knowledge base retrieves the relevant case documents, a bound model (`gpt-4.1-mini`, medium reasoning effort) reasons over them with **answer synthesis**, and the knowledge base itself returns the verdict: **GROUNDED**, **CONTRADICTED**, or **UNVERIFIABLE** — with the deciding passage quoted verbatim. Foundry IQ is the brain. A deterministic check runs alongside only as a disclosed cross-check, and as the fallback when IQ is unavailable — never the headline decision.

The win condition is **a contradiction with a cited receipt.** An "engine tap" panel shows the live Azure call that produced it, so the reasoning is on screen, not merely asserted. **Pull the plug** on Foundry IQ and the catch collapses — the witness's word stands. That toggle is in the UI, staged as a side-by-side split screen: the same sentence with grounding off (no record) next to grounding on (CONTRADICTED, cited).

### Bring Your Own Trial

Then bring your *own* source. Paste a doc, your notes, a story, or a chunk of code. Foundry IQ indexes it into an isolated partition, **infers 1–3 witnesses** from the material, and puts them on the stand grounded only in what you pasted. The lies here are **emergent, not scripted** — the model invents, and Foundry IQ checks every claim against *your* source. This is real hallucination detection on text we never saw. Because there is no ground-truth killer in your own material, the close is honestly bounded to **CASE_MADE / UNPROVEN** — the murder-accusation `SOLVED` ending is structurally unreachable here, an honesty guard.

### One Flow, Two Scenarios

Both scenarios share the same engine and the same parallel features: a witness rail, **"Take the stand"** (Foundry IQ interrogates *you*), a unified **"Deliver your verdict"** close, and a growing, exportable **Grounding Record** — kept / contradicted / unverifiable, each cited — so you leave an interrogation with a cited dossier, not just a stamp. Holbrooke additionally carries the murder accusation that can reach `SOLVED` (the true killer).

### Copilot Receipts (MCP)

The same verdict engine ships as an **MCP server for GitHub Copilot** with five tools: `load_case`, `interrogate`, `ground_on`, `check_claim`, and `accuse`. `@ground_on` indexes *your own* file or PR diff into Foundry IQ; `@check_claim` then audits a statement — including one Copilot just made about your code — against it, returning GROUNDED / CONTRADICTED / UNVERIFIABLE plus a **faithfulness gate** (PASS/HELD). *"Adds retry on 500s"* when the diff deletes the retry → CONTRADICTED (HELD), the removed line cited verbatim. The verification engine lives where developers already work.

### Responsible AI Design

Verdicts are **evidence-relative**: "unsupported by the case file" or "conflicts with their earlier statement", never "false", "lying", or "guilty" as findings of fact. **UNVERIFIABLE is first-class** — "the source is silent" is never scored as a caught hallucination, because absence is not contradiction. The report shows **counts, not trust-scores**. Every disclaimer is bound to its artifact, and the engine tap tags each step `AZURE`, `MODEL`, or `LOCAL` so the split is disclosed, not discovered. The built-in case is entirely synthetic; pasted text is indexed only to run that trial, in an isolated partition, and purged on reset.

### GitHub Copilot Usage

Copilot was used across all modes during development: inline suggestions for MCP SDK scaffolding and Foundry IQ API calls, Chat for the tool architecture and citation-integrity requirement, and the responsible-AI framing ("the citations let you catch them"). Full documentation is in `COPILOT_USAGE.md`.

---

## IQ Tools Integration Summary

| IQ Layer | Implementation | Evidence |
|----------|---------------|---------|
| **Foundry IQ** | Azure AI Search knowledge base (`evidence-kb`), 15 synthetic documents. On a challenge the KB runs **answer synthesis** (`outputMode: answerSynthesis`, reasoning effort `medium`, `gpt-4.1-mini` bound to `evidence-kb`) and *produces the verdict* — GROUNDED / CONTRADICTED / UNVERIFIABLE — with the verbatim deciding passage and `references[]`. The live web app calls this on every verdict; `check_claim` (MCP) and `ground_on` (Bring-Your-Own source) use the same path. | `spike/output/08-retrieve-verdict.json` — raw end-to-end KB answer-synthesis response (`VERDICT: CONTRADICTED` + verbatim passage + `agenticReasoning` 10,155 reasoning tokens); `evidence-engine/docs/live-mode-proof.json` — sanitized live trace; `spike/README.md` — full Azure provisioning trail |

---

## GitHub Copilot Integration Summary

| Mode | Usage |
|------|-------|
| Inline suggestions | MCP SDK boilerplate, `ListToolsRequestSchema` handler, `StdioServerTransport` setup, tool `inputSchema` enum constraints |
| Copilot Chat | MCP server architecture (five-tool design); the citation-integrity / faithfulness-gate requirement; responsible-AI framing for the `UNVERIFIABLE` state |
| Agent mode | Building the 15-document case corpus — Copilot suggested phone records as a second corroborating evidence thread for Helena's lie |
| Plan mode | `check_claim` verdict design — three-state GROUNDED / CONTRADICTED / UNVERIFIABLE with the deterministic cross-check (explicit-negation + clock-time conflict) running alongside IQ answer synthesis |

Full documentation: `COPILOT_USAGE.md`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Hero surface | Hosted web app (`evidence-engine/web/`) — static front end, no keys in the browser |
| Live backend | `evidence-engine/live-server/` (Node) — holds the search admin key + GitHub Models token |
| Witness model | GitHub Models free tier (`gpt-4o-mini`) — plays the witnesses, allowed to drift |
| Verdict engine | Azure AI Search knowledge base (`evidence-kb`), answer synthesis, REST API `2026-05-01-preview` |
| MCP surface | `@modelcontextprotocol/sdk`, stdio transport (registered via `.vscode/mcp.json`), five tools |
| Knowledge base | 15 hand-authored synthetic documents (Markdown) + per-session testimony / Bring-Your-Own partitions |
| Local fallback | Deterministic cross-check (negation + clock-time conflict) over corpus files — clearly labelled |
| Copilot integration | GitHub Copilot Chat in VS Code, Agent mode |

---

## Demo Video

[FILL: YouTube / Loom link after recording — target June 13]

See `docs/demo-script.md` for the full 3-minute narrated recording guide.

**Annotated walkthrough (available now, pending video):** `docs/game-walkthrough.md` documents the complete expected session, including the live challenge, the `CONTRADICTED` verdict with the security-log citation (`09-security-log.md`, timestamp `20:47:33`) quoted verbatim, the Grounding Record export, and the accusation reaching `SOLVED`. Judges can evaluate the mechanic from this transcript without a live provisioned instance.

**Recommended demo flow (3 minutes):**
1. Hook: open the hosted web app, explain the premise — a live witness who lies (20s)
2. Interrogate Helena in open chat; she drifts on when she left (30s)
3. Challenge the claim → **Foundry IQ returns CONTRADICTED, badge-log passage cited verbatim, engine tap shows the live AZURE call** (40s, hero moment)
4. **Pull the plug** split screen: grounding off (her word stands) vs grounding on (CONTRADICTED) (25s)
5. **Bring your own trial**: paste a doc, witnesses are inferred, challenge a claim → cited verdict on text we never saw (35s)
6. Deliver the verdict + export the Grounding Record; show the same engine as a Copilot MCP tool (`@check_claim`) (30s)

---

## GitHub Repository

[FILL: public GitHub URL — ensure repo is public before submitting]

Key files for judges:
- `evidence-engine/web/` — hosted web app (hero surface: live interrogation + Bring Your Own Trial)
- `evidence-engine/live-server/src/` — live backend holding both secrets; per-turn Foundry IQ retrieve + verdict
- `evidence-engine/server/src/index.ts` — MCP server with the five tool definitions
- `evidence-engine/server/src/foundry-client.ts` — Foundry IQ answer-synthesis / retrieval integration
- `evidence-engine/corpus/` — 15 synthetic case documents
- `evidence-engine/.vscode/mcp.json` — VS Code MCP server registration
- `evidence-engine/COPILOT_USAGE.md` — documented Copilot interactions
- `spike/output/08-retrieve-verdict.json` — raw KB answer-synthesis response producing a verdict
- `evidence-engine/docs/live-mode-proof.json` — sanitized live end-to-end trace
- `evidence-engine/docs/game-walkthrough.md` — annotated judge's transcript

---

## Team

Solo submission.

Contact: babkek1337@gmail.com

---

## Prize Categories Entered

- [x] Creative Apps Winner

---

## Submission Checklist

- [ ] Demo video recorded and uploaded (see `docs/demo-script.md`)
- [ ] GitHub repo set to public
- [ ] Azure AI Search free tier provisioned with `evidence-kb` knowledge base (see `spike/` directory and `HANDOFF.md` in the spike worktree)
- [ ] Corpus documents uploaded to `evidence-kb` index; live partition fields added (`spike/07-add-live-fields.sh`)
- [ ] `live-server/.env` filled with `AZURE_SEARCH_ENDPOINT`, `AZURE_SEARCH_ADMIN_KEY`, `GITHUB_MODELS_TOKEN`, `IQ_VERDICT_ENABLED=true`
- [ ] End-to-end live verdict validated against the KB (`live-server: npm run test:live` writes `live-mode-proof.json`)
- [ ] Web app deployed / hosting link live, or run locally (`web: npm run dev`)
- [ ] Screenshots captured for submission: `docs/screenshots/` (beats listed in `docs/screenshots/README.md`)
- [ ] Discord post submitted in `#creative-apps` with demo video (see `docs/discord-post.md` Template A)
- [ ] This form submitted before June 14, 2026 EOD

---

## June 14 Execution Order

Copy this if you are doing everything on the last day:

1. `cd evidence-engine/live-server && npm install && npm run build` — verify clean build
2. `cd evidence-engine/web && npm run dev` — confirm the web app loads; run the live verdict end to end
3. Confirm `.vscode/mcp.json` loads and the five MCP tools appear in Copilot Chat
4. Record demo (3 min) following `docs/demo-script.md` — lead with the live web hero, then Bring Your Own Trial, then the Copilot MCP surface
5. Upload demo to YouTube (unlisted is fine) or Loom
6. Fill [FILL] values in this document (video URL, GitHub URL)
7. Make GitHub repo public
8. Submit form on hackathon portal — copy each section from this file
9. Post Template A from `docs/discord-post.md` in `#creative-apps` on Discord (with video link)
10. Reply to your own Discord post within 1 hour (engagement bump)
