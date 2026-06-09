from pydantic import BaseModel
from typing import Any

from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

from config.settings import AZURE_AI_PROJECT_ENDPOINT


def get_project_client() -> AIProjectClient:
    return AIProjectClient(
        endpoint=AZURE_AI_PROJECT_ENDPOINT,
        credential=DefaultAzureCredential(),
    )


class AgentRequest(BaseModel):
    learner_id: str
    context: dict[str, Any] = {}


class AgentResponse(BaseModel):
    agent: str
    learner_id: str
    output: dict[str, Any]
    citations: list[str] = []
    reasoning_trace: list[str] = []
    confidence: float = 1.0
    flagged_by_audit: bool = False
    audit_notes: list[str] = []
