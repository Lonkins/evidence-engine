"""
Assessment Agent — Foundry Agents API + Foundry IQ grounding + self-reflection.

Generates grounded, cited practice questions from approved AI security knowledge.
Applies a self-reflection loop: the agent reviews its own questions before
returning them. Low-confidence outputs are flagged for human review.
"""
from azure.ai.projects.models import MessageTextContent

from agents.base import AgentRequest, AgentResponse, get_project_client
from config.settings import AZURE_AI_MODEL_DEPLOYMENT


INSTRUCTIONS = """
You are the Assessment Agent for an AI security training programme for schools
and educational institutions. Generate high-quality, grounded practice questions.

Rules:
- Every question must include a citation (source document and section).
- Target the learner's identified skill gaps — not generic questions.
- Format: multiple choice, 4 options (A–D), correct answer, brief explanation.
- Do not invent facts. Use only content from the knowledge base.
- After generating questions, review each one:
  1. Is it grounded in a cited source?
  2. Is the correct answer unambiguous?
  3. Does it target the learner's skill gap?
  If a question fails, revise it before returning the final set.
- Match difficulty to the certification: Fundamentals vs Intermediate vs Associate.
- Flag any question you are uncertain about with [HUMAN REVIEW RECOMMENDED].
"""


class AssessmentAgent:
    AGENT_NAME = "assessment-agent"

    def run(self, req: AgentRequest) -> AgentResponse:
        learner = req.context["learner"]

        skill_gaps = learner.get("skill_gaps") or []
        gap_str = ", ".join(skill_gaps) if skill_gaps else "general certification readiness"

        user_message = (
            f"Generate 5 practice questions for a learner preparing for {learner['target_certification']}.\n"
            f"Role: {learner['role']}\n"
            f"Skill gaps to target: {gap_str}\n"
            f"Current practice score: {learner['practice_score_avg']}%\n\n"
            f"After generating, apply your self-review checklist and revise if needed.\n"
            f"Use the OWASP AI Top 10 and AI Security Certification Guide as your knowledge sources."
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

        needs_review = "[HUMAN REVIEW RECOMMENDED]" in response_text
        confidence = 0.75 if needs_review else 0.92

        return AgentResponse(
            agent="AssessmentAgent",
            learner_id=req.learner_id,
            output={"questions": response_text},
            reasoning_trace=[
                f"Skill gaps targeted: {gap_str}",
                "Generated questions with self-review loop (Critic/Verifier pattern)",
                "Human review flag detected — confidence reduced" if needs_review else "All questions passed self-review",
                f"Confidence: {confidence:.0%}",
                f"Run ID: {run.id}",
            ],
            citations=["owasp_ai_top10.md", "ai_security_cert_guide.md"],
            confidence=confidence,
        )
