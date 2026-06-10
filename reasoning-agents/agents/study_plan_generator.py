"""
Study Plan Generator — Foundry Agents API + Fabric IQ semantic layer.

Converts a learning path into a practical, capacity-aware study schedule.
Fabric IQ semantic data (cert hours, role alignment, thresholds) is injected
as structured context since Fabric IQ is represented here via our synthetic
semantic seed.
"""
import json
from pathlib import Path

from azure.ai.projects.models import MessageTextContent

from agents.base import AgentRequest, AgentResponse, get_project_client
from config.settings import AZURE_AI_MODEL_DEPLOYMENT


_DATA = Path(__file__).parent.parent / "data" / "synthetic"

INSTRUCTIONS = """
You are the Study Plan Generator for an AI security training programme for schools
and educational institutions. Convert a learning path into a practical, realistic
study schedule.

Rules:
- Use the learner's work signals to identify realistic study windows.
- For learners with more than 20 combined teaching and meeting hours per week,
  recommend micro-sessions of 30–45 minutes, not 2-hour blocks.
- Set a milestone target of 75% practice score before recommending exam booking.
- Reference the certification's recommended study hours.
- Output a phased plan: Phase 1 (foundation) → Phase 2 (targeted gaps) → Phase 3 (exam readiness).
- Explain your scheduling decisions in terms of the learner's capacity.
"""


class StudyPlanGenerator:
    AGENT_NAME = "study-plan-generator"

    def __init__(self) -> None:
        raw = (_DATA / "certifications.json").read_text()
        self._certs = json.loads(raw)

    def _cert_info(self, cert_id: str) -> dict:
        return next(
            (c for c in self._certs["certifications"] if c["id"] == cert_id),
            {},
        )

    def run(self, req: AgentRequest, learning_path: AgentResponse) -> AgentResponse:
        learner = req.context["learner"]
        signals = req.context["work_signals"]
        cert = self._cert_info(learner["target_certification"])

        total_load = (
            signals.get("teaching_periods_per_week", 0)
            + signals.get("meeting_hours_per_week", 0)
        )
        remaining_hours = max(
            0, cert.get("recommended_hours", 20) - learner["hours_studied"]
        )

        # Fabric IQ semantic context — cert definition, role alignment, thresholds
        fabric_context = json.dumps({
            "certification": cert,
            "role_cert_map": self._certs.get("role_cert_map", {}),
        }, indent=2)

        user_message = (
            f"Learner: {learner['role']}, targeting {learner['target_certification']}\n"
            f"Remaining study hours needed: {remaining_hours}\n"
            f"Current practice score: {learner['practice_score_avg']}%\n\n"
            f"Work context (Work IQ signals):\n"
            f"- Total weekly load: {total_load} hours\n"
            f"- Focus hours available: {signals.get('focus_hours_per_week', 10)} hrs/wk\n"
            f"- Preferred slot: {signals.get('preferred_learning_slot', 'Flexible')}\n"
            f"- Available days: {', '.join(signals.get('available_days', []))}\n"
            f"- Term phase: {signals.get('term_phase', 'Unknown')}\n"
            f"- Scheduling notes: {signals.get('notes', '')}\n\n"
            f"Fabric IQ semantic context:\n{fabric_context}\n\n"
            f"Learning path:\n{learning_path.output['recommendations']}\n\n"
            f"Generate a phased study plan."
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
            agent="StudyPlanGenerator",
            learner_id=req.learner_id,
            output={"study_plan": response_text},
            reasoning_trace=[
                f"Remaining hours: {remaining_hours}",
                f"Total weekly load: {total_load} hrs — {'micro-sessions' if total_load > 20 else 'standard sessions'}",
                "Fabric IQ semantic context: cert definition, role alignment, pass threshold",
                f"Run ID: {run.id}",
            ],
            citations=["certifications.json (Fabric IQ semantic seed)", "team_readiness_report.md"],
        )
