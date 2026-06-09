"""
Engagement Agent — Work IQ context layer.

Uses synthetic work signals (meeting load, focus windows, teaching schedule)
to suggest appropriate study reminder timing and keep learners on track.

Work IQ integration note: In a production deployment this would connect to
Microsoft 365 via Work IQ for live calendar and collaboration signals.
For this demo, equivalent signals are injected as synthetic work context.
"""
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

from agents.base import AgentRequest, AgentResponse
from config.settings import AZURE_AI_PROJECT_ENDPOINT, AZURE_AI_MODEL_DEPLOYMENT


SYSTEM_PROMPT = """
You are the Engagement Agent for an AI security training programme for schools
and educational institutions. Your role is to keep learners on track with their
study plan using contextually appropriate reminders.

Rules:
- Never schedule reminders during confirmed teaching periods or high-meeting windows.
- For learners with 20+ teaching/meeting hours, suggest micro-session reminders only.
- Adapt tone to role: professional for IT staff, supportive for students.
- Do not send daily reminders — recommend a sustainable engagement cadence.
- Be explicit about the work context reasoning behind your scheduling decisions.
- Mention if term phase affects the recommended approach.
"""


class EngagementAgent:
    def __init__(self) -> None:
        self._client = AIProjectClient(
            endpoint=AZURE_AI_PROJECT_ENDPOINT,
            credential=DefaultAzureCredential(),
        )

    def run(self, req: AgentRequest, study_plan: AgentResponse) -> AgentResponse:
        learner = req.context["learner"]
        signals = req.context["work_signals"]

        total_load = (
            signals.get("teaching_periods_per_week", 0)
            + signals.get("meeting_hours_per_week", 0)
        )
        high_load = total_load > 20

        user_message = (
            f"Learner: {learner['role']}, studying for {learner['target_certification']}\n"
            f"Work context (Work IQ signals):\n"
            f"- Total weekly load: {total_load} hours\n"
            f"- Focus hours: {signals.get('focus_hours_per_week', 10)} hrs/wk\n"
            f"- Preferred slot: {signals.get('preferred_learning_slot', 'Flexible')}\n"
            f"- Available days: {', '.join(signals.get('available_days', []))}\n"
            f"- Term phase: {signals.get('term_phase', 'Unknown')}\n"
            f"- High load learner: {'Yes — use micro-sessions' if high_load else 'No'}\n"
            f"- Notes: {signals.get('notes', '')}\n\n"
            f"Study plan summary:\n{study_plan.output['study_plan']}\n\n"
            f"Design an engagement and reminder strategy."
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
            agent="EngagementAgent",
            learner_id=req.learner_id,
            output={"engagement_plan": content},
            reasoning_trace=[
                f"Total weekly load: {total_load} hrs",
                "High load detected — micro-session cadence recommended" if high_load else "Standard engagement cadence",
                f"Work IQ signals: preferred slot = {signals.get('preferred_learning_slot')}, available = {signals.get('available_days')}",
                f"Term phase consideration: {signals.get('term_phase')}",
            ],
            citations=["work_signals.json — synthetic Work IQ context"],
        )
