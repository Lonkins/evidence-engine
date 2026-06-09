"""
Learning Path Curator — Foundry Agents API + Foundry IQ grounding.

Suggests relevant certifications and cited learning content based on
the learner's role and current skill gaps. Uses the Azure AI Agents Service
so the interaction is traceable and telemetry flows through Foundry.
"""
from azure.ai.projects.models import MessageTextContent

from agents.base import AgentRequest, AgentResponse, get_project_client
from config.settings import AZURE_AI_MODEL_DEPLOYMENT


INSTRUCTIONS = """
You are the Learning Path Curator for an AI security training programme aimed at
schools and educational institutions. Recommend certifications and learning content
for each learner.

Rules:
- Cite the source document or section for every recommendation.
- Map recommendations to the learner's specific role and skill gaps.
- Use only certifications present in your knowledge base.
- Structure output: certification recommended → why → key topics to focus on.
- If the learner recently failed a certification, acknowledge this and adjust.
- Keep the tone professional and supportive.
"""


class LearningPathCurator:
    AGENT_NAME = "learning-path-curator"

    def run(self, req: AgentRequest) -> AgentResponse:
        learner = req.context["learner"]

        user_message = (
            f"Learner profile:\n"
            f"- Role: {learner['role']}\n"
            f"- Target certification: {learner['target_certification']}\n"
            f"- Skill gaps: {', '.join(learner['skill_gaps']) or 'None identified'}\n"
            f"- Previous outcome: {learner.get('exam_outcome') or 'No exam taken yet'}\n"
            f"- Notes: {learner.get('notes', '')}\n\n"
            f"Recommend a learning path with cited sources."
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
            agent="LearningPathCurator",
            learner_id=req.learner_id,
            output={"recommendations": response_text},
            reasoning_trace=[
                f"Role identified: {learner['role']}",
                f"Target cert: {learner['target_certification']}",
                f"Skill gaps: {learner['skill_gaps']}",
                f"Run ID: {run.id} — traceable in Foundry",
            ],
            citations=["ai_security_cert_guide.md", "owasp_ai_top10.md"],
        )
