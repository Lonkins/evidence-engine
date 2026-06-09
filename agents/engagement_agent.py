"""
Engagement Agent — Foundry Agents API + Work IQ context.

Uses work signals (teaching periods, meeting load, focus windows) to design
a contextually appropriate engagement and reminder strategy.

Work IQ note: In production this connects to Microsoft 365 for live calendar
signals. Here we inject equivalent synthetic organisational signals as Work IQ
context — this is the pattern recommended in the challenge brief for demos.
"""
from azure.ai.projects.models import MessageTextContent

from agents.base import AgentRequest, AgentResponse, get_project_client
from config.settings import AZURE_AI_MODEL_DEPLOYMENT


INSTRUCTIONS = """
You are the Engagement Agent for an AI security training programme for schools
and educational institutions. Design a contextually appropriate reminder and
engagement strategy for each learner.

Rules:
- Never schedule reminders during confirmed teaching periods or high-meeting windows.
- For learners with more than 20 combined teaching and meeting hours per week,
  use micro-session nudges only (30 minutes max).
- Adapt tone to role: professional and direct for IT staff, encouraging for students.
- Recommend a sustainable cadence — not daily — to avoid notification fatigue.
- Explicitly state the work-context reasoning behind each scheduling decision.
- Account for term phase: mid-term teachers have very different capacity than during holidays.
"""


class EngagementAgent:
    AGENT_NAME = "engagement-agent"

    def run(self, req: AgentRequest, study_plan: AgentResponse) -> AgentResponse:
        learner = req.context["learner"]
        signals = req.context["work_signals"]

        total_load = (
            signals.get("teaching_periods_per_week", 0)
            + signals.get("meeting_hours_per_week", 0)
        )
        high_load = total_load > 20

        user_message = (
            f"Learner: {learner['role']}, studying for {learner['target_certification']}\n\n"
            f"Work IQ signals:\n"
            f"- Total weekly load: {total_load} hours ({'HIGH — use micro-sessions' if high_load else 'manageable'})\n"
            f"- Focus hours: {signals.get('focus_hours_per_week', 10)} hrs/wk\n"
            f"- Preferred slot: {signals.get('preferred_learning_slot', 'Flexible')}\n"
            f"- Available days: {', '.join(signals.get('available_days', []))}\n"
            f"- Term phase: {signals.get('term_phase', 'Unknown')}\n"
            f"- Notes: {signals.get('notes', '')}\n\n"
            f"Study plan summary:\n{study_plan.output['study_plan']}\n\n"
            f"Design an engagement and reminder strategy."
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
            agent="EngagementAgent",
            learner_id=req.learner_id,
            output={"engagement_plan": response_text},
            reasoning_trace=[
                f"Total weekly load: {total_load} hrs",
                "Micro-session cadence applied (high load)" if high_load else "Standard cadence",
                f"Preferred slot: {signals.get('preferred_learning_slot')} on {signals.get('available_days')}",
                f"Term phase: {signals.get('term_phase')}",
                f"Run ID: {run.id}",
            ],
            citations=["work_signals.json (synthetic Work IQ context)"],
        )
