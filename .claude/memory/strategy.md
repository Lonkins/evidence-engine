---
name: strategy
description: Evolving hackathon strategy — locked decisions, critical path, build schedule, prize vectors
metadata:
  type: project
---

## Status: STRATEGY LOCKED — ENTERING BUILD PHASE
Session 1 (June 9, 2026)

## Locked Decisions

### Track: Reasoning Agents (Microsoft Foundry)
One track, one excellent submission. Splitting effort across tracks with 5 days and zero Azure setup is a losing move.

### Domain: AI Security Readiness for Schools and Educational Institutions
Target users:
- School IT admins and technicians (manage AI tools, often untrained in AI security)
- CS/IT teachers wanting to embed AI security literacy into curriculum
- Sixth form / college students (16-18) working toward entry-level certs: SC-900, CompTIA Security+, CC

Hack for Good framing: public education sector is under-resourced for AI security training. This is a real gap, emotionally resonant, and doesn't compromise technical sophistication.

Note: framing is "schools and educational institutions" not "children" — the users are adults and near-adults, the certs are real.

### Python via Claude Code agents
Tom is not the Python author — Claude Code agents write it. Tom validates, directs, and operates the tooling.

### Work IQ: Synthetic signals (no M365 tenant)
Inject synthetic work signals (meeting hours, focus windows) as contextual inputs to the Engagement Agent. Document honestly in README. Valid demo pattern per the brief.

### IQ Strategy: All Three Layers
- Foundry IQ: Knowledge base — OWASP AI Top 10, NIST AI RMF, SC-900 guide, responsible AI principles
- Work IQ: Synthetic school timetable signals — teaching periods, free periods, prep time
- Fabric IQ: Semantic ontology — Teacher/Student → Role → Cert → Skill Gap → Readiness Score

### Prize Vectors: 4 targets from one project
1. Best Overall Agent ($15k cash) — strongest submission across all tracks
2. Best Reasoning Agent ($5k cash) — win the track category
3. Best Use of IQ Tools ($5k cash) — creative use of all 3 IQ layers
4. Hack for Good ($1,468) — democratising AI security training for schools
Total reachable: ~$30,404

## Critical Path

**Tom must do (only Tom can):**
1. Create Azure free account: azure.microsoft.com/free (15 min)
2. Create Microsoft Foundry project once Azure is live (30 min)
3. Deploy GPT-4o model in Foundry
4. Copy project endpoint → paste into .env file

**Claude does in parallel:**
- Python project scaffold, venv, requirements.txt
- All synthetic data files
- Knowledge documents for Foundry IQ (OWASP AI Top 10, SC-900, responsible AI)
- Agent stubs with defined interfaces
- Orchestration logic
- Fabric IQ semantic model

Tom provides .env credentials → Claude wires live connections.

## Agent Architecture

| Agent | Role | IQ | Pattern |
|-------|------|-----|---------|
| Orchestrator | Routes requests to specialists | — | Planner–Executor |
| Learning Path Curator | Certs + content for role | Foundry IQ | Role-based specialisation |
| Study Plan Generator | Capacity-aware schedule | Fabric IQ | Planner–Executor |
| Engagement Agent | Timetable-aware reminders | Work IQ (synthetic) | Role-based specialisation |
| Assessment Agent | Grounded cited questions | Foundry IQ | Self-reflection (loop back if low confidence) |
| Manager Insights Agent | Team readiness + gaps | Fabric IQ + Work IQ | Role-based specialisation |
| **Security Audit Agent** | Validates all outputs for responsible AI | Meta (all IQs) | Critic/Verifier |

Security Audit Agent is the differentiator — it demonstrates AI security *in* the system, not just as a topic. Cut it last if time runs out, but do not cut it first.

## MVP vs Stretch Scope

**MVP (must ship by June 13):**
- All 5 challenge agents functional (simpler internals, clear interfaces)
- Foundry IQ knowledge base live with grounded citations
- Fabric IQ semantic model seeded
- Work IQ via synthetic signals
- Visible multi-step reasoning in traces
- Demo-able end-to-end flow
- README with architecture diagram

**Should have (ship by June 12):**
- Security Audit Agent (Critic/Verifier pattern)
- Evaluation suite (rubric tests)
- Telemetry/trace logging

**Nice to have (if June 12 has slack):**
- Hosted Agents deployment to Foundry Agent Service
- Microsoft Learn MCP server integration

## Build Schedule

| Day | Tom does | Claude does |
|-----|----------|-------------|
| June 9 | Azure account + Foundry project + .env | Python scaffold + synthetic data + knowledge docs + agent stubs |
| June 10 | Review + direct agent 1-2 | Learning Path Curator + Study Plan Generator (wired to Foundry IQ + Fabric IQ) |
| June 11 | Review + direct agent 3-4-5 | Engagement Agent + Assessment Agent + Manager Insights |
| June 12 | Review full flow | Security Audit Agent + evaluation suite + telemetry |
| June 13 | Record demo video | README + architecture diagram + final polish |
| June 14 | Submit | — |

## Risks

| Risk | Mitigation |
|------|-----------|
| Azure free tier quota limits | Provision today; pay-as-you-go if needed for fuller access |
| Foundry IQ indexing takes time | Prepare all knowledge docs today so indexing runs overnight |
| 5 days is tight | Security Audit Agent is last cut; agents can be simpler internally |
| Community vote (10%) | Post to Discord daily — progress updates, screenshots |

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| June 9 | Reasoning Agents track | 50% score on accuracy+reasoning, stackable prizes |
| June 9 | AI Security for schools | Differentiated, Hack for Good, Security Audit Agent concept |
| June 9 | All 3 IQ layers | Targets Best Use of IQ Tools prize |
| June 9 | 6-agent architecture | Security Audit Agent as differentiator |
| June 9 | Work IQ = synthetic signals | No M365 tenant available; brief supports this pattern |
| June 9 | Single track focus | 5 days from zero — depth over breadth |
| June 9 | Schools/educators not children | Credible users for certification scenario |
