# Agents League Hackathon — Claude Code Context

## Competition Overview

- **Event**: Agents League Hackathon, hosted by Microsoft
- **Dates**: June 4–14, 2026 — **5 days remaining** (today is June 9)
- **Track**: 🧠 Reasoning Agents (Microsoft Foundry)
- **Winners announced**: June 30, 2026

## Multi-Prize Strategy

We are targeting **four prize vectors** from one submission:

| Prize | Value | How |
|-------|-------|-----|
| 🏆 Best Overall Agent | $16,468 | Strongest overall submission across all tracks |
| 🧠 Best Reasoning Agent | $6,468 | Win the Reasoning Agents track |
| 💡 Best Use of IQ Tools | $6,468 | Deep, creative integration of all 3 IQ layers |
| 🎗️ Hack for Good | $1,468 | AI security education as societal benefit |

**Maximum reachable: ~$30,404 from one project.**

The Best Overall Agent is explicitly stackable with category prizes. Hack for Good adds a separate low-competition vector if the project framing is right.

## Project Concept: AI Security Certification Training System

The challenge provides a suggested scenario (enterprise learning/certification) but allows creative interpretation. Our angle:

**Build the enterprise learning system specifically for AI Security certifications and Responsible AI training.**

Why this wins:
- Most teams will build generic HR/corporate training — this is differentiated
- AI security is timely, technically credible, and has clear societal value (Hack for Good framing)
- The system can demonstrate AI security principles *within itself* (meta-layer via a Security Audit Agent)
- All 3 Microsoft IQ layers have a natural, non-forced role
- Assessment questions grounded in real AI security frameworks (OWASP AI Top 10, NIST AI RMF) hit the "cited, grounded answers" Foundry IQ requirement directly

## Agent Architecture (5 + 1 agents)

| Agent | Role | IQ Layer |
|-------|------|----------|
| Learning Path Curator | Maps AI security certs to roles, returns cited content | Foundry IQ |
| Study Plan Generator | Builds capacity-aware schedule | Fabric IQ |
| Engagement Agent | Calendar-aware study reminders | Work IQ |
| Assessment Agent | Grounded questions from AI security frameworks | Foundry IQ |
| Manager Insights Agent | Team readiness, skill gap analysis | Work IQ + Fabric IQ |
| **Security Audit Agent** | Validates agent outputs for responsible AI compliance | Meta-layer — all IQs |

The Security Audit Agent is the differentiator: it demonstrates AI security *in practice*, not just as a topic. It scans question quality, checks for bias, and validates citations — directly showcasing "Reliability & Safety" (20% of score).

## IQ Layer Mapping

| IQ Layer | Role in Our System |
|----------|-------------------|
| **Foundry IQ** | Knowledge base: OWASP AI Top 10, NIST AI RMF, MS Responsible AI Standard, SC-200/AZ-500 study guides (all synthetic/public) |
| **Work IQ** | Work context: meeting load, focus windows → drives Engagement Agent scheduling |
| **Fabric IQ** | Semantic layer: Learner → Role → Cert → Skill Gap → Readiness Score ontology |

## Track-Specific Judging (Reasoning Agents)

| Criterion | Weight |
|-----------|--------|
| Accuracy & Relevance | **25%** |
| Reasoning & Multi-step Thinking | **25%** |
| Reliability & Safety | 20% |
| Creativity & Originality | 15% |
| User Experience & Presentation | 15% |

50% of score is accuracy + reasoning. Build something that *works and reasons visibly*. Telemetry and trace logs are "highly valued" — they make reasoning visible to judges.

## Technical Stack

- **Language**: Python 3.10+ (challenge requirement)
- **Framework**: Microsoft Agent Framework (local) + Foundry Agent Service (hosted)
- **IQ Layers**: All three (Foundry IQ, Work IQ, Fabric IQ)
- **Data**: Synthetic only — no PII, no real customer data
- **Deployment**: Hosted Agents in Foundry Agent Service (recommended for final solution)
- **Observability**: Foundry telemetry + trace logs (highly valued by judges)

## Submission Requirements

- [ ] Public GitHub repository
- [ ] README explaining agent responsibilities, orchestration flow, tools, data sources
- [ ] Demo video
- [ ] All 3 Microsoft IQ layers integrated
- [ ] Synthetic data only (no PII, no credentials)
- [ ] Multi-agent system with visible reasoning and orchestration
- [ ] Code of Conduct compliance + CLA

## Highly Valued by Judges

- Evaluations, telemetry, observability
- Advanced reasoning patterns (Planner–Executor, Critic/Verifier, Self-reflection)
- Responsible AI controls and fallbacks
- Hosted deployment story (Foundry Agent Service)

## Reasoning Patterns to Use

| Pattern | Where |
|---------|-------|
| Planner–Executor | Top-level orchestrator dispatches to specialist agents |
| Critic / Verifier | Security Audit Agent validates outputs before delivery |
| Role-based specialisation | Each agent has a single clear responsibility |
| Self-reflection | Assessment Agent loops back if confidence is low |

## Synthetic Data Required

All data must be fabricated. Use identifiers like `L-1001`, `EMP-001`, `TEAM-A`. No real names, emails, document titles, or customer records.

Seed datasets needed:
- Learner performance records (role, cert, practice score, outcome)
- Work activity signals (meeting hours, focus hours, preferred slot)
- Fabric IQ semantic model (certifications, skills, recommended hours)
- Knowledge documents: AI security frameworks, study guides

## Key Dates

| Date | Milestone |
|------|-----------|
| June 9 (today) | Strategy locked, setup complete |
| June 10 | Core agent framework + Foundry IQ live |
| June 11 | All 3 IQ layers integrated, orchestration working |
| June 12 | Security Audit Agent + telemetry |
| June 13 | Demo video + README polish |
| June 14 | **Submission deadline** |

## Open Questions (resolve with Tom before coding)

- [ ] Azure subscription confirmed and Foundry project created?
- [ ] Python comfort level — primary language or need scaffolding?
- [ ] Confirm Hack for Good angle (AI security education for underserved orgs)?
- [ ] Student status? (Top Student Award — separate $1,468 low-competition vector)
- [ ] Discord account joined? (10% community vote — needs early engagement)

## File Structure (target)

```
agents-league/
├── CLAUDE.md
├── README.md
├── .env.example
├── .gitignore
├── requirements.txt
├── agents/
│   ├── orchestrator.py
│   ├── learning_path_curator.py
│   ├── study_plan_generator.py
│   ├── engagement_agent.py
│   ├── assessment_agent.py
│   ├── manager_insights.py
│   └── security_audit.py
├── data/
│   ├── synthetic/
│   │   ├── learners.json
│   │   ├── work_signals.json
│   │   └── certifications.json
│   └── knowledge/
│       ├── ai_security_guide.md
│       ├── owasp_ai_top10.md
│       └── responsible_ai_standard.md
├── config/
│   └── foundry_config.py
├── evaluation/
│   └── rubric_tests.py
└── .claude/
    └── memory/
```
