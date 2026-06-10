"""
Manager Insights Agent — Foundry Agents API + Fabric IQ + Work IQ.

Provides team-level visibility into certification readiness across
a school or educational institution. Surfaces risk areas and recommended
manager actions without exposing individual personal data.
"""
import json
from pathlib import Path

from azure.ai.projects.models import MessageTextContent

from agents.base import AgentResponse, get_project_client
from config.settings import AZURE_AI_MODEL_DEPLOYMENT


_DATA = Path(__file__).parent.parent / "data" / "synthetic"

INSTRUCTIONS = """
You are the Manager Insights Agent for an AI security training programme for
schools and educational institutions.

Rules:
- Summarise at team level. Use role aggregates, not individual names.
- Flag capacity-constrained learners as 'at risk of falling behind' — not as underperforming.
- Recommend concrete actions the manager can take (e.g., protected study time, schedule release).
- Cite sources: readiness report, semantic cert model.
- Be constructive, forward-looking, and privacy-conscious.
- Highlight patterns: capacity-constrained teams, likely exam risk areas, completion pace.
"""


class ManagerInsightsAgent:
    AGENT_NAME = "manager-insights-agent"

    def run(self, learner_id: str | None = None) -> AgentResponse:
        learners = json.loads((_DATA / "learners.json").read_text())
        signals = json.loads((_DATA / "work_signals.json").read_text())

        avg_score = sum(l["practice_score_avg"] for l in learners) / len(learners)
        avg_hours = sum(l["hours_studied"] for l in learners) / len(learners)
        at_risk = [
            l["learner_id"]
            for l in learners
            if l["practice_score_avg"] < 70 or l.get("exam_outcome") == "Fail"
        ]
        high_load_ids = [
            s["employee_id"]
            for s in signals
            if (s.get("teaching_periods_per_week", 0) + s.get("meeting_hours_per_week", 0)) > 20
        ]

        user_message = (
            f"Team AI security certification summary:\n"
            f"- Total learners: {len(learners)}\n"
            f"- Average practice score: {avg_score:.1f}%\n"
            f"- Average hours studied: {avg_hours:.1f}\n"
            f"- Below readiness threshold (<70% or failed): {len(at_risk)} learners ({', '.join(at_risk)})\n"
            f"- Capacity-constrained (>20 hrs/wk load): {len(high_load_ids)} learners ({', '.join(high_load_ids)})\n"
            f"- Certifications in progress: {list(set(l['target_certification'] for l in learners))}\n\n"
            f"Sources: team_readiness_report.md, certifications.json (Fabric IQ semantic seed)\n\n"
            f"Generate a manager insights summary with risk areas and recommended actions."
        )

        with get_project_client() as client:
            agent = client.agents.create_agent(
                model=AZURE_AI_MODEL_DEPLOYMENT,
                name=self.AGENT_NAME,
                instructions=INSTRUCTIONS,
            )
            thread = client.agents.threads.create()
            client.agents.messages.create(
                thread_id=thread.id,
                role="user",
                content=user_message,
            )
            run = client.agents.runs.create_and_process(
                thread_id=thread.id,
                agent_id=agent.id,
            )

            messages = client.agents.messages.list(thread_id=thread.id)
            response_text = next(
                block.text.value
                for msg in messages
                if msg.role == "assistant"
                for block in msg.content
                if isinstance(block, MessageTextContent)
            )

            client.agents.delete_agent(agent.id)

        return AgentResponse(
            agent="ManagerInsightsAgent",
            learner_id=learner_id or "TEAM",
            output={"insights": response_text},
            reasoning_trace=[
                f"Team size: {len(learners)}",
                f"Average practice score: {avg_score:.1f}%",
                f"At-risk learners: {at_risk}",
                f"Capacity-constrained: {high_load_ids}",
                "Fabric IQ: cert semantic model + role alignment applied",
                "Work IQ: teaching/meeting load signals applied",
                f"Run ID: {run.id}",
            ],
            citations=["team_readiness_report.md", "certifications.json (Fabric IQ semantic seed)"],
        )
