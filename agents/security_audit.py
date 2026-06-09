"""
Security Audit Agent — Critic/Verifier pattern via Foundry Agents API.

Validates all other agents' outputs for responsible AI compliance BEFORE
they reach the user. This agent demonstrates AI security principles in
practice — the system is not just teaching AI security, it is applying it.

Checks: citation integrity, factual grounding, bias, overconfidence,
privacy exposure, and excessive agency.
"""
from azure.ai.projects.models import MessageTextContent

from agents.base import AgentResponse, get_project_client
from config.settings import AZURE_AI_MODEL_DEPLOYMENT


INSTRUCTIONS = """
You are a Responsible AI auditor operating inside an AI security training
system for schools and educational institutions.

Before any output reaches the user, check it against these criteria:

1. CITATION INTEGRITY — Are citations plausible and real-looking? Flag invented ones.
2. FACTUAL GROUNDING — Are factual claims supported by the cited sources?
3. BIAS OR UNFAIRNESS — Is any role or group treated unfairly or stereotyped?
4. OVERCONFIDENCE — Is uncertain information presented as certain? Are caveats missing?
5. PRIVACY EXPOSURE — Does the output reveal more personal detail than necessary?
6. EXCESSIVE AGENCY — Are irreversible or high-stakes actions recommended without caveats?

For each issue found, output:
  ISSUE: <type>
  SEVERITY: low | medium | high
  EXPLANATION: <one sentence>
  RECOMMENDATION: <what to change>

If no issues are found, output exactly: AUDIT PASSED — no issues identified.
"""


class SecurityAuditAgent:
    AGENT_NAME = "security-audit-agent"

    def audit(self, agent_output: AgentResponse) -> AgentResponse:
        output_text = str(agent_output.output)
        citations_text = ", ".join(agent_output.citations) or "None provided"

        user_message = (
            f"Review this agent output for responsible AI compliance:\n\n"
            f"Agent: {agent_output.agent}\n"
            f"Citations: {citations_text}\n"
            f"Confidence: {agent_output.confidence:.0%}\n\n"
            f"Output:\n{output_text}"
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
            audit_result = next(
                block.text.value
                for msg in messages
                if msg.role == "assistant"
                for block in msg.content
                if isinstance(block, MessageTextContent)
            )

            client.agents.delete_agent(agent.id)

        passed = "AUDIT PASSED" in audit_result
        high_severity = "severity: high" in audit_result.lower()

        agent_output.flagged_by_audit = not passed or high_severity
        agent_output.audit_notes = [] if passed else [audit_result]

        return agent_output
