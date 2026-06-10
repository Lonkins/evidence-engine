---
name: competition-context
description: Core facts about the Agents League Reasoning Agents track — judging, requirements, allowed patterns, synthetic data rules
metadata:
  type: project
---

Competition: Agents League Hackathon, hosted by Microsoft. June 4–14 2026. **5 days remain.** Winners announced June 30.

**Why:** Time-boxed sprint. Every architectural decision must account for a 4-day build + 1-day polish window.

## Track: Reasoning Agents (Microsoft Foundry)

Track-specific judging rubric (note: DIFFERENT from the general rubric):
- 25% Accuracy & Relevance
- 25% Reasoning & Multi-step Thinking
- 20% Reliability & Safety
- 15% Creativity & Originality
- 15% User Experience & Presentation
- NO community vote component listed in track rubric (general rubric has 10% community vote)

**50% of score = accuracy + reasoning.** Build something that *works* and makes its reasoning *visible*.

## Challenge Scenario

Enterprise learning/certification management system. Must include multi-agent orchestration. Suggested agents:
1. Learning Path Curator
2. Study Plan Generator
3. Engagement Agent
4. Assessment Agent
5. Manager Insights Agent

Note: "You do not need to follow the suggested architecture exactly." — creative deviation is permitted and rewarded (15% creativity).

## Required Microsoft IQ Integration (at least 1, all 3 encouraged)

- **Foundry IQ**: Knowledge base from uploaded docs, Azure Blob, SharePoint, OneLake. Returns cited, grounded answers. Uses Azure AI Search.
- **Work IQ**: M365 intelligence — meetings, focus time, work patterns. Use as context layer for scheduling/engagement logic.
- **Fabric IQ**: Semantic ontology layer — entities (learner, role, cert, skill gap), relationships (prerequisites, role alignment), rules (pass thresholds, recommended hours).

## Highly Valued by Judges (stated explicitly in brief)
- Evaluations, telemetry, or observability
- Advanced reasoning patterns (Planner–Executor, Critic/Verifier, Self-reflection, Role-based specialisation)
- Responsible AI controls and fallbacks
- Hosted deployment story (Foundry Agent Service)

## Reasoning Patterns (named in brief — use these terms)
- Planner–Executor
- Critic / Verifier
- Self-reflection and iteration
- Role-based specialisation

## Submission Requirements (hard)
- Multi-agent system aligned to the challenge scenario
- Uses Microsoft Foundry (UI or SDK) and/or Microsoft Agent Framework
- Demonstrates reasoning and multi-step decision-making across agents
- Integrates external tools, APIs, and/or MCP where they add real value
- Integrates at least one Microsoft IQ layer
- Uses **synthetic data and synthetic documents only**
- Demoable with clear explanation of agent interactions
- Clear documentation of agent responsibilities, orchestration flow, tools, data sources
- Public repo with README

## Synthetic Data Rules
- Use fabricated identifiers: L-1001, EMP-001, TEAM-A
- No real names, emails, document titles, customer records
- Seed datasets from brief: learner performance, work activity signals, Fabric IQ semantic model seed
- README must state the dataset is synthetic and for demonstration only

## Prohibited (Disclaimer)
- Azure API keys, connection strings, credentials in repo
- Customer data or PII
- Confidential/proprietary company information
- Pre-release info under NDA
- Trade secrets or proprietary algorithms

## Legal
By submitting, contributor grants Microsoft a perpetual, worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute the submission. Contributor retains copyright. Repository must be made public before submission.

## Tech Requirements
- Python 3.10+
- Visual Studio Code recommended
- Azure subscription (free tier has limitations — quota, rate limits, regional restrictions)
- Free tier warning: may need pay-as-you-go for fuller access to orchestration/evaluation features

## MCP Integration Opportunity
Microsoft Learn MCP server is explicitly mentioned. Integrating it for content retrieval adds a real tool use demonstration and is directly relevant to a learning system.

## Helpful Resources (from brief)
- Microsoft Foundry documentation
- Microsoft Agent Framework GitHub repository
- Microsoft Learn MCP server repository
- Foundry Agent Service (Hosted Agents)
- Evaluate AI agents with the Microsoft Foundry SDK
- Generate synthetic data with Microsoft Foundry (Preview)
