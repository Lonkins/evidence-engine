---
name: strategy
description: Evolving hackathon strategy — locked decisions, current track, prize vectors, build schedule
metadata:
  type: project
---

## Status: TRACK PIVOTED — IDEA SELECTION IN PROGRESS
Session 2 (June 9, 2026)

## Locked Decisions

### Track: Enterprise Agents (Microsoft 365 Copilot)
**Why:** Reasoning Agents required Azure OpenAI API calls × 6 agents per run = ongoing cost risk on free tier. Enterprise Agents Declarative Agent approach uses M365 Copilot's built-in AI — zero compute cost. 120 vs 287 projects = less competition. Domain knowledge carries over.

### Approach: Declarative Agent + TypeScript MCP Server
- Declarative Agent (DA) is manifest-based — no custom AI compute
- MCP server in TypeScript adds the bonus criteria explicitly scored higher by judges
- OAuth on MCP server adds a third bonus tier

### IQ Layer: Work IQ (primary) + Foundry IQ (knowledge base)
- Work IQ is native to M365 and most compelling for an Enterprise agent — real organisational signals without synthetic workarounds
- Foundry IQ provides the knowledge base for grounded, cited answers

### Domain: AI security for schools — still the lead candidate
Subject to judge-persona review — see `ideas.md`

### Prize Vectors (unchanged)
1. Best Overall Agent ($15k cash)
2. Best Enterprise Agent ($5k cash)
3. Best Use of IQ Tools ($5k cash)
4. Hack for Good ($1,468)
Total reachable: ~$30,404

## Open Decisions
- [ ] Final idea selection (pending judge-persona agent review)
- [ ] M365 Developer tenant confirmed and active
- [ ] Node.js + M365 Agents Toolkit installed

## Build Schedule

| Day | Goal |
|-----|------|
| June 9 | Idea locked, M365 Dev tenant, VS Code + ATK installed |
| June 10 | DA scaffold via ATK, Foundry IQ knowledge base live |
| June 11 | TypeScript MCP server (read + write) |
| June 12 | OAuth on MCP, Work IQ wired, end-to-end demo flow |
| June 13 | Demo video, README, architecture diagram |
| June 14 | Submit |

## Risks

| Risk | Mitigation |
|------|-----------|
| M365 Developer tenant takes time to activate | Sign up immediately; usually instant |
| MCP server is net-new work | Simple TypeScript server, well-documented in challenge resources |
| DA limits on custom reasoning depth | Instructions + knowledge base + MCP tools compensate |
| Community vote (10%) | Post to Discord today with concept, post demo when ready |

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| June 9 | Reasoning Agents track | 50% score on accuracy+reasoning, stackable prizes |
| June 9 | AI Security for schools | Differentiated, Hack for Good, Security Audit concept |
| June 9 | **PIVOT: Enterprise Agents** | Cost control, less competition, domain knowledge carries over |
| June 9 | Declarative Agent approach | Zero API cost, fastest to build, all computation on M365 |
| June 9 | TypeScript MCP server bonus | Bonus criteria, leverages existing skills |
