---
name: strategy
description: Creative Apps track strategy — concept decision, build status, locked choices, prize vectors
metadata:
  type: project
---

## Status: CONCEPT LOCKED + MCP SERVER BUILT

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

| Component | Status | Notes |
|-----------|--------|-------|
| Concept | ✅ Locked | Evidence Engine — unanimous 4/4 persona consensus |
| IQ integration | ✅ Wired (dev + Azure) | foundry-client.ts: Azure AI Search REST, local fallback |
| MCP server | ✅ Built + verified | 4 tools, TypeScript, stdlib, tsc clean build |
| Case corpus | ✅ Built | 15 documents — statements, security log, forensics, motive doc |
| README | ✅ Done | Architecture Mermaid diagram, setup guide, responsible AI section |
| COPILOT_USAGE.md | ✅ Done | 6 specific Copilot interactions documented |
| .vscode/mcp.json | ✅ Done | stdio transport, env var inputs for Azure |
| Demo script | ✅ Done | `docs/demo-script.md` — 3-min shooting script, 7 segments, pre-flight checklist |
| Discord post | ✅ Done | `docs/discord-post.md` — 3 templates + timing strategy |
| Game walkthrough | ✅ Done | `docs/game-walkthrough.md` — full transcript with exact tool calls + expected outputs |
| Web UI | ✅ Built + verified (June 11) | `evidence-engine/web/` — React/Vite noir detective desk. Pressable claim chips → stamped verdicts (VERIFIED/CONTRADICTED/NO RECORD) with verbatim citations; evidence board fills in via citations; sealed questions unlock on discovery; archive search fails closed ("the evidence is silent"); full-screen accusation set-piece. Fully static (no keys), 76 kB gz JS, 34 unit tests incl. citation-integrity (every quote verified verbatim vs corpus). Same win condition as MCP server. Playthrough verified in browser end-to-end. |
| Live Interrogation (WP9) | ✅ Built + verified live (June 11) | "Live Wire" mode: open free-form chat with the suspects. `evidence-engine/live-server/` (Node) holds the only two secrets (search admin key + GitHub Models token — `gh auth token` works); browser keyless. Every turn = live Foundry IQ retrieve (filterAddOn `doc_type eq 'evidence'`, knowledge source `evidence-ks`) → gpt-4o-mini in character (drift allowed BY DESIGN) → each sentence indexed as `testimony` doc (session_id/speaker/turn_no) in the same single index. Challenge = two live retrieves: evidence partition (SUPPORTED/UNSUPPORTED/CONTRADICTED; claim-calibrated threshold 2.0 — grounded ≥2.2, fabricated ≤1.5, measured live) + speaker's own testimony partition (SELF_CONTRADICTION on clock-time conflicts, earlier statement shown verbatim with turn number). Verdict heuristics gate on claim-relevant sentences/log-lines incl. speaker name. Wiretap "engine tap" panel renders every live call (step/latency/status) — judges SEE the IQ layer working in real time. Session reset filter-deletes testimony docs (index stays tiny). Full demo path verified vs LIVE KB: planted lie CONTRADICTED w/ citation, Helena cracks under badge-log press → SELF_CONTRADICTION, scorecard, cleanup of 13 docs. Proof artifact: `evidence-engine/docs/live-mode-proof.json`. Index migration: `spike/07-add-live-fields.sh` (additive, $0). Case File mode untouched (offline judge-without-keys path); backend down → "LINE DEAD" gate, never fakes live. 18 server unit tests; web 34 tests; both builds green (web 81 kB gz). |

## Prize Vectors

Creative Apps prize value TBC. Win probability est. 15–20% with a working Copilot demo.

## Open Items (Human-Gated)

- [ ] Run spike scripts 0-5 (in worktree `creative-apps/.claude/worktrees/hungry-cannon-81b457/creative-apps/spike/`) to provision Azure AI Search free tier — see HANDOFF.md in that worktree
- [ ] Upload corpus documents to Azure AI Search index once provisioned
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
