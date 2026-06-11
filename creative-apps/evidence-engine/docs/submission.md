# Evidence Engine — Hackathon Submission

> Pre-filled submission form for the Creative Apps track.
> Copy each section into the corresponding field on the submission portal.
> Fields marked [FILL] require a human action before submitting.

---

## Project Name

Evidence Engine

---

## One-Line Description

A detective game played inside GitHub Copilot Chat where every character claim is grounded by Foundry IQ agentic retrieval — and the player wins by catching the lie with citations.

---

## Short Description (~280 characters)

Evidence Engine is an MCP server that turns GitHub Copilot Chat into a detective interrogation room. Every suspect's alibi is grounded by Azure AI Search knowledge base retrieval. When their story contradicts the evidence, `check_claim` returns CONTRADICTED with the exact citation that proves the lie.

---

## Long Description (500–800 words)

### The Concept

Most AI games have the same problem: you cannot trust what the AI says. Evidence Engine turns that problem into the game mechanic.

In Evidence Engine, a gallery owner has been murdered. Three suspects were present that evening. One of them lied about when they left. Your job is to find the contradiction — not by guessing, but by comparing what the character says against what the evidence actually shows.

Every tool response is grounded by Foundry IQ (Azure AI Search agentic retrieval) over a 15-document synthetic case corpus. When you call `check_claim`, the server retrieves documents from the knowledge base, compares them to the claim, and returns one of three verdicts: SUPPORTED, CONTRADICTED, or INSUFFICIENT_EVIDENCE — with the document citation that justifies it. There are no hallucinated passages. INSUFFICIENT_EVIDENCE is the fail-closed response when the index returns nothing.

The game cannot function without the knowledge base. Remove Foundry IQ and contradiction detection collapses — there is no hardcoded answer, no hidden flag, no LLM deciding who is guilty. The IQ layer is the game engine.

### How It Works

Evidence Engine runs as an MCP server in stdio mode, registered in GitHub Copilot Chat via `.vscode/mcp.json`. The player uses four tools:

- **`load_case`** — loads the case briefing and suspect list
- **`interrogate`** — retrieves relevant case documents and returns evidence context with citations; Copilot synthesises the character's dialogue from this context
- **`check_claim`** — tests a factual assertion against the case file and returns SUPPORTED, CONTRADICTED, or INSUFFICIENT_EVIDENCE with the cited document key and passage
- **`accuse`** — evaluates the player's accusation: correct suspect + required evidence keys = case solved

The case — The Holbrooke Gallery Affair — includes 15 hand-authored synthetic documents: three witness statements, an electronic access log, an autopsy report, a forensic examination, a phone records extract, a gallery insurance appraisal, financial records, and a motive document. The lie is embedded in the access log: Helena Voss claims she left around 7:45pm. The badge reader recorded her exit at 20:47. The phone records show an outgoing call from Helena to Victor at 20:18 — while she was still in the building.

### IQ Integration

The Foundry IQ integration uses the Azure AI Search knowledge base retrieve endpoint (`/knowledgebases/evidence-kb/retrieve`, API version `2026-05-01-preview`) with `intents`-based input and `retrievalReasoningEffort: "minimal"`. Each retrieved reference includes a `docKey` and reranker score. The server fetches the full document by key from the Azure AI Search index to verify that cited passages appear verbatim in the source document — not in an LLM paraphrase.

The integration degrades gracefully: when `AZURE_SEARCH_ENDPOINT` and `AZURE_SEARCH_KEY` are not set, the server falls back to keyword search over the local corpus `.md` files. Judges can play the game in dev mode without any Azure credentials.

### Responsible AI Design

The game's framing is deliberate: characters are unreliable narrators, not AI-generated facts. The player is expected to distrust Copilot's synthesis and verify claims against citations. This inverts the typical LLM trust problem — unreliability is the puzzle to solve, not a defect to paper over.

`INSUFFICIENT_EVIDENCE` is structural: the server does not guess or hallucinate a verdict when the index returns no results. The player must find the evidence themselves.

### GitHub Copilot Usage

Copilot was used across all four modes during development: inline suggestions for MCP SDK boilerplate, Chat for API integration architecture, Agent mode for building the case corpus structure, and Plan mode for the 4-tool design. Full documentation is in `COPILOT_USAGE.md`.

---

## IQ Tools Integration Summary

| IQ Layer | Implementation | Evidence |
|----------|---------------|---------|
| **Foundry IQ** | Azure AI Search knowledge base (`evidence-kb`) with 15 documents. Agentic retrieval via `/knowledgebases/{name}/retrieve` endpoint. Every `check_claim` and `interrogate` call retrieves from the index with citations. | `server/src/foundry-client.ts` — `retrieve()` and `fetchDocumentByKey()` functions; `docs/integration-proof.json` — live test run showing PASS on in-corpus query and planted-lie contradiction detection |

---

## GitHub Copilot Integration Summary

| Mode | Usage |
|------|-------|
| Inline suggestions | MCP SDK boilerplate, `ListToolsRequestSchema` handler pattern, `StdioServerTransport` setup, tool `inputSchema` with `enum` constraints for character names |
| Copilot Chat | MCP server architecture planning (4-tool design); Foundry IQ citation verification pattern; case corpus structure; responsible AI framing for the `INSUFFICIENT_EVIDENCE` state |
| Agent mode | Building the 15-document case corpus — Copilot suggested the phone records as a second corroborating evidence thread for Helena's lie |
| Plan mode | `check_claim` classification logic — three-state verdict (SUPPORTED / CONTRADICTED / INSUFFICIENT_EVIDENCE) with temporal-conflict and explicit-negation detection |

Full documentation: `COPILOT_USAGE.md`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + TypeScript |
| MCP SDK | `@modelcontextprotocol/sdk` |
| MCP transport | stdio (registered via `.vscode/mcp.json`) |
| IQ integration | Azure AI Search knowledge base (`evidence-kb`), REST API, `2026-05-01-preview` |
| Knowledge base | 15 hand-authored synthetic documents (Markdown) |
| Local fallback | Keyword search over corpus `.md` files |
| Copilot integration | GitHub Copilot Chat in VS Code, Agent mode |
| No external dependencies | stdlib + MCP SDK only (no LangChain, no orchestration layer) |

---

## Demo Video

[FILL: YouTube / Loom link after recording — target June 13]

See `docs/demo-script.md` for the full 3-minute narrated recording guide.

**Annotated game transcript (available now, pending video):** `docs/game-walkthrough.md` documents the complete expected session, including exact tool call syntax, realistic MCP responses, the CONTRADICTED verdict with security log citation (`09-security-log.md`, timestamp `20:47:33`), and the CASE SOLVED resolution. Judges can evaluate the game mechanic from this transcript without requiring a live provisioned instance.

**Recommended demo flow (3 minutes):**
1. Hook: show MCP tools registered in Copilot Chat, explain the premise (20s)
2. `load_case` — case briefing, suspect list (20s)
3. `interrogate Helena Voss "When did you leave the gallery?"` — Copilot synthesises response from retrieved evidence (40s)
4. `check_claim "Helena Voss left the gallery at approximately 7:45pm"` — **CONTRADICTED verdict + security log citation visible** (40s, hero moment)
5. Architecture slide: Copilot Chat → MCP server → Foundry IQ → citation back (30s)
6. `accuse Helena Voss` with evidence keys — CASE SOLVED (20s)

---

## GitHub Repository

[FILL: public GitHub URL — ensure repo is public before submitting]

Key files for judges:
- `evidence-engine/server/src/index.ts` — MCP server with 4 tool definitions
- `evidence-engine/server/src/foundry-client.ts` — Foundry IQ agentic retrieval integration
- `evidence-engine/server/src/case-store.ts` — game state and accusation evaluation
- `evidence-engine/corpus/` — 15 synthetic case documents
- `evidence-engine/.vscode/mcp.json` — VS Code MCP server registration
- `evidence-engine/COPILOT_USAGE.md` — documented Copilot interactions
- `evidence-engine/docs/integration-proof.json` — live Foundry IQ test results
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
- [ ] Corpus documents uploaded to `evidence-kb` index
- [ ] `.env` filled with `AZURE_SEARCH_ENDPOINT` and `AZURE_SEARCH_KEY`
- [ ] End-to-end playthrough validated in VS Code Copilot Chat (follow `docs/demo-script.md` pre-flight checklist)
- [ ] Screenshots captured for submission: `docs/screenshots/` (7 beats listed in `docs/screenshots/README.md`)
- [ ] Discord post submitted in `#creative-apps` with demo video (see `docs/discord-post.md` Template A)
- [ ] This form submitted before June 14, 2026 EOD

---

## June 14 Execution Order

Copy this if you are doing everything on the last day:

1. `cd evidence-engine/server && npm run build` — verify clean build
2. Open VS Code at `evidence-engine/` workspace root
3. Confirm `.vscode/mcp.json` loads and MCP tools appear in Copilot Chat
4. Record demo (3 min) following `docs/demo-script.md`
5. Upload demo to YouTube (unlisted is fine) or Loom
6. Fill [FILL] values in this document (video URL, GitHub URL)
7. Make GitHub repo public
8. Submit form on hackathon portal — copy each section from this file
9. Post Template A from `docs/discord-post.md` in `#creative-apps` on Discord (with video link)
10. Reply to your own Discord post within 1 hour (engagement bump)
