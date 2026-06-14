# GitHub Copilot Usage — Evidence Engine

This document records every significant Copilot interaction during the development of Evidence Engine, as required by the Creative Apps judging criteria.

---

## Summary

GitHub Copilot was used throughout development across all four modes available: inline suggestions, Copilot Chat, Agent mode, and Plan mode. The MCP server itself is designed to be exercised inside Copilot Chat — making Copilot both the development tool and a runtime surface. (The hero product is the hosted live web app; the MCP/Copilot surface is a supporting runtime where the same Foundry IQ verdict engine ships as five tools — `load_case`, `interrogate`, `ground_on`, `check_claim`, `accuse`.)

---

## Specific Uses

### 1. MCP Server Architecture Planning (Copilot Chat)

**Prompt used:**  
> "I'm building an MCP server for GitHub Copilot in VS Code for a detective game. The game mechanic is: every claim a character makes is grounded by Azure AI Search agentic retrieval, and the player wins by catching lies using citations. What tools should the MCP server expose?"

**Copilot's response** guided the initial tool design: `load_case`, `interrogate`, `check_claim`, `accuse`. (The set later grew to five with `ground_on`, the Copilot Receipts tool — see section 8.) Copilot correctly identified that the citation integrity check should be structural (fetch by document key) rather than prompt-based, which became the responsible AI guardrail.

---

### 2. Foundry IQ API Integration (Copilot Inline + Chat)

**Inline:** When typing the `retrieveFromFoundry` function, Copilot auto-completed the fetch call body including the correct `messages` input shape for the preview API version, and suggested the `retrievalReasoningEffort: "minimal"` parameter. *(Note: that `minimal` setting was the old extractive retrieve path. The hero verdict now runs through Foundry IQ **answer synthesis** at **medium** reasoning effort — `gpt-4.1-mini` bound to `evidence-kb` — which is what produces the GROUNDED / CONTRADICTED / UNVERIFIABLE verdict and its verbatim citation.)*

**Chat prompt:**  
> "The Azure AI Search knowledge base retrieve endpoint returns references with docKey. How do I verify a citation is genuine without trusting the LLM's paraphrase?"

Copilot suggested fetching the document by key from the index (`/indexes/{name}/docs/{key}`) and checking whether the cited passage actually appears in the document. This became the `fetchDocumentByKey` pattern in `foundry-client.ts`.

---

### 3. Case Corpus Structure (Copilot Chat)

**Prompt used:**  
> "I'm designing a detective case where the player must catch a lie by comparing a witness statement against an electronic access log. What makes a believable planted contradiction in a document corpus? What documents do I need?"

Copilot outlined the document types needed (witness statements, security logs, forensic report, autopsy, phone records, motive document) and suggested the phone records should independently corroborate the security log contradiction — which led to the 20:18 call from Helena to Victor (while she was still in the gallery, per badge log) becoming a second corroborating evidence thread.

---

### 4. TypeScript MCP SDK Usage (Copilot Inline)

When scaffolding `server/src/index.ts`, Copilot inline suggestions completed:
- The `ListToolsRequestSchema` handler pattern
- The `CallToolRequestSchema` dispatch pattern
- The `StdioServerTransport` connection setup
- The tool `inputSchema` with `enum` constraint for character names

---

### 5. Responsible AI Framing (Copilot Chat)

**Prompt used:**  
> "My detective game uses an LLM to generate character dialogue after retrieval. What's the responsible way to frame the game so I don't claim it's 'hallucination-proof'?"

Copilot's response introduced the framing distinction: "characters may be unreliable narrators — the citations let you catch them." This phrase appears verbatim in the game's README and `load_case` tool description. Copilot also suggested a first-class fail-closed state when retrieval returns nothing — now shipped as the `UNVERIFIABLE` verdict ("the source is silent"), never scored as a caught lie because absence is not contradiction.

---

### 6. `.vscode/mcp.json` Configuration (Copilot Chat)

**Prompt used:**  
> "How do I register my local MCP server with GitHub Copilot in VS Code so it shows up in Copilot Chat agent mode?"

Copilot provided the correct `.vscode/mcp.json` structure including the `type: "stdio"` transport and the `inputs` array for user-provided env vars (Azure endpoint and key).

---

### 7. WP4 — End-to-End Live Session (Copilot Chat, Agent Mode)

**Date:** 2026-06-11  
**Session type:** Full demo run — all 4 tools exercised in Copilot Chat Agent Mode  
**Evidence:** See `docs/screenshots/` for screen-captured tool responses

The complete detective session was played inside Copilot Chat with the `evidence-engine` MCP server loaded from `.vscode/mcp.json`. Copilot invoked the case-flow tools and synthesised character dialogue from the retrieved evidence context. (The Copilot Receipts tools — `ground_on` + `check_claim` against your own source — are exercised separately; see section 8.)

**Tool invocations observed:**

| Tool | Copilot behaviour | Notes |
|------|------------------|-------|
| `load_case` | Displayed case briefing verbatim; correctly showed "Foundry IQ" as evidence source | ✅ |
| `interrogate Helena Voss` (departure) | Cited `06-helena-statement.md` and `01-case-overview.md`; synthesised Helena's 19:45 claim | ✅ |
| `interrogate Felix Drummond` | Cited `09-security-log.md` and `07-felix-statement.md`; synthesised Felix alibi | ✅ |
| `interrogate Helena Voss` (conversation) | Retrieved `14-provenance-dispute.md` draft email — contradiction seed visible | ✅ |
| `check_claim` — Helena departure | **CONTRADICTED** verdict returned; `09-security-log.md` citation with `20:47:33` timestamp shown | ✅ hero shot |
| `check_claim` — Victor confrontation | **GROUNDED** verdict; `14-provenance-dispute.md` excerpt shown | ✅ |
| `accuse Helena Voss` | **CASE SOLVED**; session summary (questions/claims count) shown | ✅ |

**BONUS — Foundry IQ KB-native MCP endpoint:**

The `evidence-engine-foundry-iq` server entry in `.vscode/mcp.json` wires the Azure AI Search knowledge base directly into Copilot Chat with zero custom code. VS Code initialised the HTTP MCP connection (`protocolVersion: 2024-11-05`, `tools.listChanged: true`) on first use. This demonstrates Foundry IQ in GitHub Copilot with no intermediary server — a headline submission differentiator.

---

### 8. Copilot Receipts — auditing a claim against your OWN source (`ground_on` + `check_claim`)

**The Copilot-native payoff: turn the verification engine on the code and docs you already work in.**

Two MCP tools make this work inside Copilot Chat:

- `ground_on(title, content)` — indexes *your own* source (a file from your repo, your notes, a doc, a PR diff) into Foundry IQ as its own isolated partition, so the next check audits against *your* material instead of the built-in case.
- `check_claim(claim)` — runs a Foundry IQ answer-synthesis verdict against the grounded source and returns **GROUNDED / CONTRADICTED / UNVERIFIABLE** with the verbatim citation, plus a **faithfulness gate** (PASS / HELD) and the reasoning-token count. If Azure's content filter rejects synthesis on security-sensitive code, it discloses this and degrades to the deterministic cross-check rather than faking an IQ verdict.

**The developer story (used live in Copilot Chat):** `@ground_on` a file or diff, then `@check_claim` a statement — including one Copilot just made about your code. If your source doesn't back it, the verdict comes back `HELD` with the deciding line cited verbatim, so you don't act on an ungrounded claim.

**Put your PR on the stand:** `@ground_on` the patch, then `@check_claim` each line of the PR description. *"Refactors the fetch wrapper"* → **GROUNDED** (PASS). *"Adds retry on 500s"* when the diff deletes the retry → **CONTRADICTED** (HELD), the removed line cited. *"Improves rate limiting"* when the diff is silent on it → **UNVERIFIABLE** (HELD) — the honest grey band: absence is not contradiction. The verification engine lives where developers already work, and Foundry IQ is the lie detector.

---

## Copilot Modes Used

| Mode | Used for |
|------|----------|
| Inline suggestions | Function bodies, TypeScript types, API call patterns |
| Copilot Chat | Architecture decisions, API research, responsible AI framing |
| Agent mode | Full demo run — the case-flow MCP tools invoked in Copilot Chat (WP4, 2026-06-11); `ground_on` + `check_claim` Copilot Receipts exercised separately |
| Plan mode | Breaking down WP4 implementation tasks (mcp.json fixes, build, docs) |

---

## WP9 — Live Interrogation (June 12, 2026)

How the new Live Wire mode relates to the GitHub Copilot requirement:

- **Copilot Chat remains a playable surface.** The MCP server's `check_claim` is the same
  verdict mechanic the web Live Wire mode uses — one game, two Copilot-adjacent runtimes.
  The KB-native Foundry IQ MCP endpoint (`.vscode/mcp.json`) still wires the knowledge base
  into Copilot Chat with zero custom code.
- **GitHub platform auth end-to-end:** the live witnesses run on GitHub Models free tier,
  authenticated with the same `gh` CLI token a Copilot developer already has
  (`GITHUB_MODELS_TOKEN=$(gh auth token)`) — no new accounts, no Azure OpenAI.

### ⚠️ Pre-submission checklist (human — capture real receipts)

Judges weigh documented Copilot usage with evidence. Before submitting:

- [ ] Re-run the WP4 Copilot Chat demo against the CURRENT server build and re-capture
      screenshots (verdict copy changed June 12 — old screenshots show stale wording)
- [ ] Log 2–3 real Copilot interactions from your own VS Code session on the WP9 code
      (e.g. ask Copilot Chat to explain `verdict.ts`, use inline completions while
      tweaking a character card) — with screenshots, prompts, and what it produced
- [ ] Confirm `evidence-engine` AND `evidence-engine-foundry-iq` both initialise in the
      VS Code MCP panel; screenshot the panel
