# Discord Post Templates — Evidence Engine

**Post in:** #creative-apps channel  
**When:** June 12–13 (post with demo video, not before)  
**Goal:** Community vote (10% of judging score)

---

> ⚠️ **Templates A / B / C below are SUPERSEDED.** They lead with the MCP/Copilot-Chat
> surface as the headline product — the hero is now the hosted live web app. Use
> **Template 4** above. A/B/C are kept for reference (labels corrected) only.

## Template A — Full Post (superseded — see Template 4)

Post this with the demo video attached or linked.

---

🕵️ **Evidence Engine** — a detective game where you catch AI in the act of lying

Built for the Creative Apps track. Here's the twist: every character's claim is grounded in the actual case file via **Foundry IQ** (Azure AI Search agentic retrieval) — and when their story doesn't match the evidence, **the game knows**.

The core mechanic: `check_claim` returns `CONTRADICTED` and shows you the exact document passage that proves the lie. You win by citing evidence, not by guessing.

**How it works:**
- 🔌 MCP server (stdio) — runs inside GitHub Copilot Chat in VS Code
- 📚 15-document synthetic case corpus — the Holbrooke Gallery Affair
- 🔎 Foundry IQ agentic retrieval — retrieves case documents with citations on every tool call
- ✅ `UNVERIFIABLE` when the source is silent — no hallucinated passages

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

## Template C — Technical Developer Audience (superseded — see Template 4)

Use in a follow-up thread or if the channel skews technical.

---

The hosted web app is the hero; it also ships as an MCP server for the Creative Apps track — the full source is on GitHub.

The interesting part is the `check_claim` tool architecture:

```
Player types a claim →
  retrieve(claim) via Foundry IQ knowledge base →
  answer synthesis (gpt-4.1-mini bound to evidence-kb, reasoning effort medium) →
  the KB ITSELF returns the verdict: GROUNDED / CONTRADICTED / UNVERIFIABLE
  + the deciding passage quoted verbatim + a faithfulness gate (PASS/HELD)
  (a deterministic check runs alongside as a DISCLOSED cross-check, never the headline)
```

The Foundry IQ API used is the **2026-05-01-preview** `/knowledgebases/{name}/retrieve` endpoint with `outputMode: answerSynthesis`. Local fallback is the deterministic cross-check over the 15 corpus `.md` files when answer synthesis is unavailable — clearly labelled, never faked as an IQ verdict.

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

---

## Template 4 — Live Wire launch (June 12, USE THIS ONE)

> 🕵️ **Catch the AI lying — live, in your browser.**
>
> Evidence Engine is a hosted noir detective game where the suspects are played
> by a live LLM, grounded through **Foundry IQ on every turn** — and deliberately
> allowed to drift. Challenge any sentence and **the knowledge base itself returns
> the verdict** — `GROUNDED` / `CONTRADICTED` / `UNVERIFIABLE` — with the deciding
> passage quoted verbatim. The engine-tap panel shows the live Azure call that
> produced it. Press hard enough and they contradict their own indexed testimony.
>
> 🔥 **Then put your OWN doc on trial.** Paste a spec, your notes, or a chunk of
> code — Foundry IQ indexes it, infers the witnesses, and checks every claim they
> make against *your* source. Real hallucination detection on text we never saw.
>
> 🎮 Play in your browser (no install, no keys): [hosted link]
> 🎬 60-second kill shot: [video/GIF — challenge → verdict + cited receipt]
> 🔧 Also ships as an MCP server for Copilot Chat. Azure AI Search free tier, $0 stack: [repo]
>
> Built with GitHub Copilot · Foundry IQ answer synthesis · GitHub Models

**Attach:** the challenge→CONTRADICTED GIF (cut from the demo video, <10s loop).
**Timing:** post as soon as hosting + video exist — votes compound; don't wait
for the deadline crowd.

**Alt stretch hook** (swap the 🔥 line if BYO isn't demo-ready): *"Pull the plug
on Foundry IQ and watch the catch collapse — split-screen, the same sentence with
grounding ON vs OFF. With the KB in the loop: CONTRADICTED, cited. Without it: her
word stands."*
