"""
Manager Insights Agent — Fabric IQ + Work IQ.

Provides team-level visibility into certification readiness and workforce
development across a school or educational institution. Surfaces risk areas
without exposing sensitive personal data.
"""
import json
from pathlib import Path

from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

from agents.base import AgentResponse
from config.settings import AZURE_AI_PROJECT_ENDPOINT, AZURE_AI_MODEL_DEPLOYMENT


_DATA = Path(__file__).parent.parent / "data" / "synthetic"

SYSTEM_PROMPT = """
You are the Manager Insights Agent for an AI security training programme for
schools and educational institutions. Your role is to give managers a clear,
honest view of their team's certification readiness and risk areas.

Rules:
- Summarise at team level — do not expose individual personal details.
- Use role-level aggregates, not individual names, unless the learner_id is public.
- Flag capacity-constrained learners as 'at risk' — not as underperforming.
- Recommend specific actions the manager can take (e.g., schedule release time).
- Cite the readiness report and semantic model sources.
- Be constructive and forward-looking.
"""


class ManagerInsightsAgent:
    def __init__(self) -> None:
        self._client = AIProjectClient(
            endpoint=AZURE_AI_PROJECT_ENDPOINT,
            credential=DefaultAzureCredential(),
        )

    def run(self, learner_id: str | None = None) -> AgentResponse:
        learners = json.loads((_DATA / "learners.json").read_text())
        signals = json.loads((_DATA / "work_signals.json").read_text())

        # Aggregate synthetic team metrics
        avg_score = sum(l["practice_score_avg"] for l in learners) / len(learners)
        avg_hours = sum(l["hours_studied"] for l in learners) / len(learners)
        at_risk = [
            l["learner_id"] for l in learners
            if l["practice_score_avg"] < 70 or l.get("exam_outcome") == "Fail"
        ]
        high_load = [
            s["employee_id"] for s in signals
            if s.get("teaching_periods_per_week", 0) + s.get("meeting_hours_per_week", 0) > 20
        ]

        user_message = (
            f"Team AI security certification summary:\n"
            f"- Total learners: {len(learners)}\n"
            f"- Average practice score: {avg_score:.1f}%\n"
            f"- Average hours studied: {avg_hours:.1f}\n"
            f"- Learners below 70% practice score or failed: {len(at_risk)} ({', '.join(at_risk)})\n"
            f"- Capacity-constrained learners (>20hrs/wk load): {len(high_load)} ({', '.join(high_load)})\n\n"
            f"Certifications in progress: {list(set(l['target_certification'] for l in learners))}\n\n"
            f"Generate a manager insights summary with risk areas and recommended actions."
        )

        response = self._client.inference.get_chat_completions(
            model=AZURE_AI_MODEL_DEPLOYMENT,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
        )

        content = response.choices[0].message.content

        return AgentResponse(
            agent="ManagerInsightsAgent",
            learner_id=learner_id or "TEAM",
            output={"insights": content},
            reasoning_trace=[
                f"Team size: {len(learners)} learners",
                f"Average practice score: {avg_score:.1f}%",
                f"At-risk learners: {at_risk}",
                f"Capacity-constrained: {high_load}",
                "Applied Fabric IQ semantic model: role alignment, readiness thresholds",
                "Applied Work IQ signals: capacity load per learner",
            ],
            citations=["team_readiness_report.md", "certifications.json — Fabric IQ semantic seed"],
        )
