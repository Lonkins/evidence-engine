# Discord Post Templates — Evidence Engine

**Post in:** #creative-apps channel  
**When:** June 12–13 (post with demo video, not before)  
**Goal:** Community vote (10% of judging score)

---

## Template A — Full Post (Recommended)

Post this with the demo video attached or linked.

---

🕵️ **Evidence Engine** — a detective game where you catch AI in the act of lying

Built for the Creative Apps track. Here's the twist: every character's claim is grounded in the actual case file via **Foundry IQ** (Azure AI Search agentic retrieval) — and when their story doesn't match the evidence, **the game knows**.

The core mechanic: `check_claim` returns `CONTRADICTED` and shows you the exact document passage that proves the lie. You win by citing evidence, not by guessing.

**How it works:**
- 🔌 MCP server (stdio) — runs inside GitHub Copilot Chat in VS Code
- 📚 15-document synthetic case corpus — the Holbrooke Gallery Affair
- 🔎 Foundry IQ agentic retrieval — retrieves case documents with citations on every tool call
- ✅ `INSUFFICIENT_EVIDENCE` when the index is silent — no hallucinated passages

The case: a gallery owner found dead. Three suspects. One lied about when they left. The security access log disagrees with the witness statement by over an hour. Find the contradiction, cite the evidence, solve the case.

**No hallucination-resistant claims without the knowledge base** — remove Foundry IQ and the contradiction detection collapses. The IQ layer is the game engine, not a decoration.

Demo video 👇

GitHub: [link]

---

## Template B — Short (Under 280 chars for X/Discord one-liners)

```
🕵️ Evidence Engine: a detective game in Copilot Chat where you catch suspects lying
using actual evidence citations. check_claim returns CONTRADICTED when their alibi
doesn't match the security log. MCP server + Foundry IQ. Demo 👇 #AgentsLeague
```

---

## Template C — Technical Developer Audience

Use in a follow-up thread or if the channel skews technical.

---

Built an MCP server for the Creative Apps track — the full source is on GitHub.

The interesting part is the `check_claim` tool architecture:

```
Player types a claim →
  retrieve(claim) via Foundry IQ agentic retrieval API →
  fetchDocumentByKey() for each returned reference →
  classify: SUPPORTED / CONTRADICTED / INSUFFICIENT_EVIDENCE
  (CONTRADICTED = retrieval found the document; document contains contradiction signals)
```

The Foundry IQ API used is the **2026-05-01-preview** `/knowledgebases/{name}/retrieve` endpoint with `messages` input format and `retrievalReasoningEffort: minimal`. Local fallback is keyword search over the 15 corpus `.md` files.

The game runs in **dev mode** (local corpus) without any Azure config. Set `AZURE_SEARCH_ENDPOINT` and `AZURE_SEARCH_KEY` in the server `.env` to switch to Foundry IQ semantic retrieval.

`.vscode/mcp.json` is in the repo — open the workspace and the MCP server auto-registers in VS Code.

---

## Timing and Strategy

| Timing | Action |
|--------|--------|
| When demo video is ready | Post Template A with video in #creative-apps |
| 1–2 hours later | Reply with Template C (technical detail) to attract developer votes |
| June 13 (last day before deadline) | Reminder post: "Last day to vote — Evidence Engine for Creative Apps" |

**Avoid posting before the demo video is ready.** A text-only post in a creative track gets lost. The video is the hook.

**Tag the hackathon organiser** if the channel allows — visibility matters for community vote.

**Engagement tip:** Ask a specific question at the end of the post — "What would you interrogate Helena about first?" — to encourage replies, which bumps Discord visibility.
