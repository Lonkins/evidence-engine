---
name: tech-decisions
description: Technical decisions made for the hackathon project — API patterns, agent architecture, dependencies
metadata:
  type: project
---

## API Pattern: Azure AI Agents Service (not raw inference)

All agents use `client.agents.create_agent(...)` → `client.agents.threads.create()` → `client.agents.runs.create_and_process(...)`. This is the Foundry-native pattern that gives us built-in telemetry, run IDs in traces, and is what Microsoft judges expect to see.

**Why:** Raw `inference.get_chat_completions` would work but produces no Foundry telemetry and doesn't demonstrate the Agents Service. Judges value observability explicitly.

**How to apply:** Every agent creates a named agent, runs it on a thread, deletes it after. Run IDs go into `reasoning_trace` for traceability.

## Agent Client Pattern

`get_project_client()` in `agents/base.py` returns `AIProjectClient` using `DefaultAzureCredential`. This requires `az login` to be run once locally. No credentials ever go in code.

## Agent Lifecycle

Create-on-demand pattern: agent is created, used, and deleted per request. This is simpler than persistent agents for a demo and avoids quota accumulation on free tier.

## Foundry IQ Integration (TODO — needs Azure provisioned)

Next step after credentials are wired:
1. Upload `data/knowledge/*.md` files to Foundry project as knowledge base
2. Connect knowledge base to `LearningPathCurator` and `AssessmentAgent` via `azure_ai_search` tool resource
3. This gives real grounded citations with source metadata

For now, citation strings are authored manually in each agent — accurate but not live retrieval.

## Work IQ: Synthetic Signals

No M365 tenant available. Work IQ context injected as structured synthetic data from `data/synthetic/work_signals.json`. This is the pattern the brief recommends for demos. README will be explicit about this.

## Fabric IQ: Semantic Seed via JSON

Fabric IQ represented by `data/synthetic/certifications.json` — the role-cert mapping, recommended hours, skill lists, prerequisites. This is passed as structured context to `StudyPlanGenerator` and `ManagerInsightsAgent`.

## Python Version and Tooling

- Python 3.10+ (challenge requirement)
- `azure-ai-projects>=1.0.0b11` — Agents API
- `azure-identity>=1.19.0` — DefaultAzureCredential
- `openai>=1.55.0` — required peer dependency
- `pydantic>=2.0.0` — AgentRequest/AgentResponse models
- `rich>=13.0.0` — CLI output display

## Entry Point

`python main.py --learner L-1001` — runs full pipeline
`python main.py --learner L-1001 --manager` — includes manager insights
`python main.py --team` — team-level insights only

## Next Step Blocking on Tom

Tom must complete Azure setup and provide .env before any agents can actually run:
1. ai.azure.com → create Hub (East US) → create Project
2. Deploy gpt-4o model
3. Copy project endpoint to .env
4. `brew install azure-cli && az login`
5. `python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
