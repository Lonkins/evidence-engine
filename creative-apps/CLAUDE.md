# Creative Apps Track — Strategy & Context

> **THE ONLY GOAL IS TO WIN.** See parent `../CLAUDE.md` for the shared mandate, four mandatory personas, and autonomous loop protocol. This file contains track-specific context.

---

## Track: Creative Apps with GitHub Copilot

**Challenge:** Build innovative creative applications using AI-assisted development with GitHub Copilot and VS Code.

**Required elements (all three are mandatory):**
1. **GitHub Copilot usage** — meaningful use during development, documented in README
2. **Microsoft IQ Integration** — at least one: Foundry IQ, Work IQ, or Fabric IQ
3. **Creative application** — unique concept, value/entertainment/utility, thoughtful UX

**Especially welcomed:** MCP servers that integrate with GitHub Copilot in VS Code or Copilot CLI tools.

---

## Judging Criteria

| Criterion | Weight | What Moves This Score |
|-----------|--------|-----------------------|
| Technical Excellence | ? | Clean code, working integration, MCP/IQ properly wired |
| Creative Innovation | ? | Novel concept, unexpected approach, imaginative UX |
| GitHub Copilot Integration | Required | Demonstrated in README, Copilot CLI or VS Code MCP |
| Microsoft IQ Integration | Required | At least one IQ layer genuinely connected |
| User Experience | ? | Demo quality, interaction design, polish |

*Exact weights are not published. Optimise for visible technical depth + memorable creative concept.*

---

## Strategic Positioning

Given that the Enterprise Agents track already covers **Foundry IQ** and **Work IQ** deeply, this track should:
- Consider **Fabric IQ** for differentiation (semantic layer over business data — unexplored)
- OR use Foundry IQ in a genuinely different creative context (not risk assessment)
- Build an **MCP server for GitHub Copilot in VS Code** — explicitly called out as desired in the challenge

### Concept Selection — Open

Concept has not been locked. Use the four mandatory personas before finalising any concept. Prize Strategist is tiebreaker.

**Categories to consider:**
- Content generation (story, script, music)
- Visual creativity (generative art, design tools)
- Game development (procedural generation, interactive fiction)
- Creative productivity (remixing, brainstorming)
- Interactive experiences (character chatbots, educational games)

### IQ Layer Options

| IQ Layer | What It Does | Creative Angle |
|----------|-------------|----------------|
| Foundry IQ | Knowledge retrieval, cited grounded answers | Ground a creative tool in real-world knowledge |
| Work IQ | M365 org signals (emails, meetings, docs) | Personalised creative tools drawing on work context |
| Fabric IQ | Semantic layer over enterprise data | Creative tools that reason over structured business concepts |

---

## Build Principles (Track-Specific)

1. **MCP server is the differentiator** — a standalone creative app is table stakes; an MCP server that brings creativity into Copilot Chat is differentiated
2. **Show Copilot usage explicitly** — document in README which features used Copilot (inline, chat, agent mode), with example prompts
3. **IQ integration must be genuine** — not a README mention, not a mocked API call — actually connected
4. **Demo video matters** — Creative track rewards presentation quality; plan the demo from day one
5. **Community vote (10%)** — post in `#creative-apps` Discord channel as soon as a concept is locked

---

## Project Structure (to be filled in once concept is locked)

```
creative-apps/
├── CLAUDE.md               ← This file
├── README.md               ← Architecture, Copilot usage documentation, setup guide
├── src/                    ← Application source
├── .claude/
│   └── memory/             ← Track memory files (read before starting work)
│       ├── MEMORY.md
│       ├── strategy.md
│       └── competition-context.md
└── docs/
    ├── demo-script.md      ← Video recording guide (create once concept locked)
    └── discord-post.md     ← Community vote post templates
```

---

## Overnight Loop Instructions

When running an autonomous development cycle for this track:

1. **Orient** — read this CLAUDE.md and all files in `.claude/memory/`
2. **Spawn four personas in parallel** (see `../CLAUDE.md` for persona descriptions) with the current decision or next action as context
3. **Safety check** — confirm no destructive operations needed
4. **Implement** the consensus action
5. **Update** `.claude/memory/overnight-log.md` with cycle summary, persona recommendations, and next priority
6. **Commit** with a descriptive conventional commit message
7. **Never push** to remote

---

## Memory Files

Read before starting work. Update when decisions are made.

| File | Content |
|------|---------|
| `.claude/memory/strategy.md` | Concept decision, build status, prize vectors |
| `.claude/memory/competition-context.md` | Full Creative Apps challenge requirements |
| `.claude/memory/overnight-log.md` | Autonomous cycle log |

---

## Hard Constraints

All constraints from `../CLAUDE.md` apply. Additionally:
- Document every significant Copilot interaction for the README's "How I used Copilot" section
- Do not claim IQ integration unless it is actually wired (not stubbed)
- Demo video must show the actual application working, not a simulation
