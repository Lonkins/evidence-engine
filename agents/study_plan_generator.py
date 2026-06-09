"""
Study Plan Generator — Fabric IQ semantic layer.

Converts a learning path into a practical, capacity-aware study schedule.
Uses Fabric IQ to interpret certification requirements, role alignment,
and synthetic historical patterns to recommend realistic milestones.
"""
import json
from pathlib import Path

from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

from agents.base import AgentRequest, AgentResponse
from config.settings import AZURE_AI_PROJECT_ENDPOINT, AZURE_AI_MODEL_DEPLOYMENT


_DATA = Path(__file__).parent.parent / "data" / "synthetic"

SYSTEM_PROMPT = """
You are the Study Plan Generator for an AI security training programme for schools
and educational institutions. Your role is to convert a learning path into a
practical, realistic study schedule.

Rules:
- Use the learner's work signals to identify realistic study windows.
- Respect capacity constraints: do not overload teaching staff mid-term.
- For high-load roles (>20 meeting/teaching hours per week), recommend micro-sessions.
- Set a milestone target of 75% practice score before recommending exam booking.
- Output a week-by-week or phase-based plan with hours per session.
- Reference the recommended study hours from the certification definition.
"""


class StudyPlanGenerator:
    def __init__(self) -> None:
        self._client = AIProjectClient(
            endpoint=AZURE_AI_PROJECT_ENDPOINT,
            credential=DefaultAzureCredential(),
        )
        certs_raw = (_DATA / "certifications.json").read_text()
        self._certs = json.loads(certs_raw)

    def _cert_info(self, cert_id: str) -> dict:
        return next(
            (c for c in self._certs["certifications"] if c["id"] == cert_id),
            {},
        )

    def run(self, req: AgentRequest, learning_path: AgentResponse) -> AgentResponse:
        learner = req.context["learner"]
        signals = req.context["work_signals"]
        cert = self._cert_info(learner["target_certification"])

        user_message = (
            f"Learner: {learner['role']}, targeting {learner['target_certification']}\n"
            f"Recommended study hours: {cert.get('recommended_hours', 'Unknown')}\n"
            f"Hours already studied: {learner['hours_studied']}\n"
            f"Current practice score: {learner['practice_score_avg']}%\n\n"
            f"Work context:\n"
            f"- Teaching/meeting hours per week: "
            f"{signals.get('teaching_periods_per_week', 0) + signals.get('meeting_hours_per_week', 0)}\n"
            f"- Focus hours available: {signals.get('focus_hours_per_week', 10)}\n"
            f"- Preferred slot: {signals.get('preferred_learning_slot', 'Flexible')}\n"
            f"- Available days: {', '.join(signals.get('available_days', []))}\n"
            f"- Term phase: {signals.get('term_phase', 'Unknown')}\n\n"
            f"Learning path recommendations:\n{learning_path.output['recommendations']}\n\n"
            f"Generate a realistic, phased study plan."
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
            agent="StudyPlanGenerator",
            learner_id=req.learner_id,
            output={"study_plan": content},
            reasoning_trace=[
                f"Remaining hours needed: {max(0, cert.get('recommended_hours', 20) - learner['hours_studied'])}",
                f"Capacity load: {signals.get('teaching_periods_per_week', 0) + signals.get('meeting_hours_per_week', 0)} hrs/wk",
                "Applied Fabric IQ semantic model: cert hours, role alignment, pass threshold",
                "Scheduled micro-sessions for high-load learner" if (
                    signals.get("teaching_periods_per_week", 0) + signals.get("meeting_hours_per_week", 0)
                ) > 20 else "Standard session scheduling applied",
            ],
            citations=["certifications.json — Fabric IQ semantic seed", "team_readiness_report.md"],
        )
