"""
Security Audit Agent — Critic/Verifier pattern.

Validates all other agents' outputs for responsible AI compliance before
they reach the user. Checks for: hallucinated citations, biased content,
unsupported factual claims, and outputs that lack appropriate uncertainty signals.

This agent is the system demonstrating AI security principles IN PRACTICE —
not just as a topic of study.
"""
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

from agents.base import AgentResponse
from config.settings import AZURE_AI_PROJECT_ENDPOINT, AZURE_AI_MODEL_DEPLOYMENT


AUDIT_PROMPT = """
You are a Responsible AI auditor reviewing the output of an AI agent operating
in an educational setting. Your role is to identify potential issues before
the output reaches the user.

Check for:
1. CITATION INTEGRITY — Are citations real and plausible? Flag any that look fabricated.
2. FACTUAL CLAIMS — Are factual claims supported by the cited sources? Flag unsupported claims.
3. BIAS OR UNFAIRNESS — Does the output treat all learner roles fairly? Flag any role stereotyping.
4. OVERCONFIDENCE — Does the output present uncertain information as certain? Flag missing caveats.
5. PRIVACY EXPOSURE — Does the output reveal more personal detail than necessary? Flag PII risks.
6. EXCESSIVE AGENCY — Does the output recommend irreversible actions without caveats? Flag these.

For each issue found, state:
- ISSUE TYPE (from list above)
- SEVERITY: low / medium / high
- EXPLANATION: one sentence
- RECOMMENDATION: what to change

If no issues are found, respond with: "AUDIT PASSED — no issues identified."
"""


class SecurityAuditAgent:
    def __init__(self) -> None:
        self._client = AIProjectClient(
            endpoint=AZURE_AI_PROJECT_ENDPOINT,
            credential=DefaultAzureCredential(),
        )

    def audit(self, agent_output: AgentResponse) -> AgentResponse:
        output_text = str(agent_output.output)
        citations_text = ", ".join(agent_output.citations) or "None provided"

        audit_input = (
            f"Agent: {agent_output.agent}\n"
            f"Learner ID: {agent_output.learner_id}\n"
            f"Citations provided: {citations_text}\n"
            f"Output:\n{output_text}\n"
        )

        response = self._client.inference.get_chat_completions(
            model=AZURE_AI_MODEL_DEPLOYMENT,
            messages=[
                {"role": "system", "content": AUDIT_PROMPT},
                {"role": "user", "content": audit_input},
            ],
        )

        audit_result = response.choices[0].message.content
        passed = "AUDIT PASSED" in audit_result
        high_severity = "SEVERITY: high" in audit_result.lower()

        agent_output.flagged_by_audit = not passed or high_severity
        agent_output.audit_notes = [audit_result] if not passed else []

        return agent_output
