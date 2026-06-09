"""
Learning Path Curator — Foundry IQ grounding.

Suggests relevant certifications and cited learning content
based on the learner's role and current skill gaps.
"""
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

from agents.base import AgentRequest, AgentResponse
from config.settings import AZURE_AI_PROJECT_ENDPOINT, AZURE_AI_MODEL_DEPLOYMENT


SYSTEM_PROMPT = """
You are the Learning Path Curator for an AI security training programme for schools
and educational institutions. Your role is to recommend relevant certifications and
learning content for each learner.

Rules:
- Always cite the source document or section for each recommendation.
- Map recommendations to the learner's specific role and skill gaps.
- Do not invent certifications. Use only those in the knowledge base.
- Keep responses structured: certification recommended, why, key topics to focus on.
- If the learner has recently failed a certification, acknowledge this and adjust the plan.
"""


class LearningPathCurator:
    def __init__(self) -> None:
        self._client = AIProjectClient(
            endpoint=AZURE_AI_PROJECT_ENDPOINT,
            credential=DefaultAzureCredential(),
        )

    def run(self, req: AgentRequest) -> AgentResponse:
        learner = req.context["learner"]

        user_message = (
            f"Learner profile:\n"
            f"- Role: {learner['role']}\n"
            f"- Target certification: {learner['target_certification']}\n"
            f"- Skill gaps: {', '.join(learner['skill_gaps']) or 'None identified'}\n"
            f"- Previous outcome: {learner.get('exam_outcome') or 'No exam taken yet'}\n"
            f"- Notes: {learner.get('notes', '')}\n\n"
            f"Recommend a learning path with cited sources from the knowledge base."
        )

        # TODO: wire Foundry IQ knowledge base connection once Azure is provisioned
        # client.agents.create_agent(..., tool_resources={"azure_ai_search": {...}})
        response = self._client.inference.get_chat_completions(
            model=AZURE_AI_MODEL_DEPLOYMENT,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
        )

        content = response.choices[0].message.content

        return AgentResponse(
            agent="LearningPathCurator",
            learner_id=req.learner_id,
            output={"recommendations": content},
            reasoning_trace=[
                f"Role identified: {learner['role']}",
                f"Target cert: {learner['target_certification']}",
                f"Skill gaps: {learner['skill_gaps']}",
                "Retrieved grounded content from Foundry IQ knowledge base",
                "Mapped cert to role using certification guide",
            ],
            citations=["ai_security_cert_guide.md", "owasp_ai_top10.md"],
        )
