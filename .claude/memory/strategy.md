---
name: strategy
description: Evolving strategy for the Agents League Hackathon — track, prize vectors, project concept, architecture decisions
metadata:
  type: project
---

## Current Status: STRATEGY LOCKED (pending Tom confirmation on 5 open questions)
Session 1 (June 9, 2026)

**Why this matters:** 5-day window. Every decision needs to serve delivery within that constraint.
**How to apply:** Do not start writing code until the 5 open questions in CLAUDE.md are answered. Update this file after each decision point.

## Locked Decisions

### Track: Reasoning Agents (Microsoft Foundry)
Rationale: 50% of track-specific score (25% accuracy + 25% reasoning) rewards what we do best. Best Reasoning Agent ($6,468) + Best Overall Agent ($16,468) are stackable from one submission.

### Project Domain: AI Security Certification Training
Rationale: Differentiates from generic HR/corporate training submissions. Timely domain with genuine societal value. Enables Hack for Good framing. Can demonstrate AI security principles *within* the system itself via a Security Audit Agent — directly scoring against Reliability & Safety (20%).

### IQ Strategy: All Three Layers
- Foundry IQ → knowledge base of AI security frameworks (OWASP AI Top 10, NIST AI RMF)
- Work IQ → calendar/meeting context for Engagement Agent scheduling
- Fabric IQ → semantic ontology (Learner → Role → Cert → Skill Gap → Readiness)
Rationale: Using all three targets Best Use of IQ Tools ($6,468) as a separate prize vector.

### Prize Vectors: 4 targets
1. Best Overall Agent ($15k cash) — strongest submission overall
2. Best Reasoning Agent ($5k cash) — win the track
3. Best Use of IQ Tools ($5k cash) — deep creative use of all 3 IQ layers
4. Hack for Good ($1,468 no cash) — AI security education as societal benefit
Total reachable: ~$30,404

### Key Differentiator: Security Audit Agent (6th agent)
The challenge suggests 5 agents. We add a 6th: a Security Audit Agent that validates all other agents' outputs for responsible AI compliance. This is meta — it demonstrates AI security IN the system, not just as a topic. Directly hits: Reliability & Safety (20%), Responsible AI controls (highly valued extra), Creativity (15%).

### Reasoning Pattern: Planner–Executor + Critic/Verifier
Top-level orchestrator dispatches to specialist agents (Planner–Executor). Security Audit Agent acts as Critic/Verifier before any output reaches the user. Named patterns are explicitly listed in the challenge brief as valued.

## Open Decisions (blocking code start)
- [ ] Azure/Foundry access confirmed
- [ ] Python comfort level
- [ ] Hack for Good framing confirmed with Tom
- [ ] Student status (Top Student Award eligibility)
- [ ] Discord joined (10% community vote)

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| June 9 | Reasoning Agents track | 50% score on accuracy+reasoning, stackable prizes |
| June 9 | AI Security domain | Differentiated, Hack for Good angle, Security Audit Agent concept |
| June 9 | All 3 IQ layers | Targets Best Use of IQ Tools prize |
| June 9 | 6-agent architecture | Security Audit Agent as differentiator |

## Build Schedule (target)

| Day | Goal |
|-----|------|
| June 9 | Azure setup, Foundry project, venv, synthetic data |
| June 10 | Core orchestrator + Learning Path Curator with Foundry IQ |
| June 11 | All 5 challenge agents wired, Work IQ + Fabric IQ integrated |
| June 12 | Security Audit Agent, telemetry/observability, evaluation suite |
| June 13 | Demo video, README, final polish |
| June 14 | Submit |

## Risks

| Risk | Mitigation |
|------|-----------|
| Azure quota limits on free tier | Pay-as-you-go or Azure for Students; provision today |
| Work IQ requires M365 tenant access | Use synthetic work signals if tenant not available |
| 5 days is tight for 6 agents | Cut Security Audit Agent last if time runs out; it's differentiator not core |
| Python unfamiliarity | Scaffold early with Copilot; Microsoft Agent Framework has good examples |
| Community vote (10%) | Join Discord today, post progress updates |
