"""
Orchestrator — Planner–Executor pattern.

Routes an incoming learner request to specialist agents in sequence,
collects their outputs, passes everything through the Security Audit Agent,
and returns a consolidated response.
"""
import json
from pathlib import Path

from agents.base import AgentRequest, AgentResponse
from agents.learning_path_curator import LearningPathCurator
from agents.study_plan_generator import StudyPlanGenerator
from agents.engagement_agent import EngagementAgent
from agents.assessment_agent import AssessmentAgent
from agents.manager_insights import ManagerInsightsAgent
from agents.security_audit import SecurityAuditAgent


_DATA = Path(__file__).parent.parent / "data" / "synthetic"


def _load_learner(learner_id: str) -> dict:
    learners = json.loads((_DATA / "learners.json").read_text())
    match = next((l for l in learners if l["learner_id"] == learner_id), None)
    if not match:
        raise ValueError(f"Learner {learner_id} not found in synthetic dataset")
    return match


def _load_work_signals(learner_id: str) -> dict:
    signals = json.loads((_DATA / "work_signals.json").read_text())
    return next((s for s in signals if s["employee_id"] == learner_id), {})


def run_pipeline(learner_id: str, manager_mode: bool = False) -> dict:
    """
    Full multi-agent pipeline for a single learner.

    1. Load learner profile and work signals
    2. Learning Path Curator — grounded content recommendations
    3. Study Plan Generator — capacity-aware schedule (Fabric IQ)
    4. Engagement Agent — timetable-aware reminders (Work IQ)
    5. Assessment Agent — grounded practice questions (Foundry IQ)
    6. Manager Insights — team readiness summary (if manager_mode)
    7. Security Audit Agent — validates all outputs (Critic/Verifier)
    """
    learner = _load_learner(learner_id)
    work_signals = _load_work_signals(learner_id)

    req = AgentRequest(
        learner_id=learner_id,
        context={"learner": learner, "work_signals": work_signals},
    )

    curator = LearningPathCurator()
    planner = StudyPlanGenerator()
    engagement = EngagementAgent()
    assessment = AssessmentAgent()
    auditor = SecurityAuditAgent()

    curator_out = curator.run(req)
    plan_out = planner.run(req, learning_path=curator_out)
    engagement_out = engagement.run(req, study_plan=plan_out)
    assessment_out = assessment.run(req)

    pipeline_outputs = [curator_out, plan_out, engagement_out, assessment_out]

    if manager_mode:
        manager = ManagerInsightsAgent()
        manager_out = manager.run(learner_id=learner_id)
        pipeline_outputs.append(manager_out)
    else:
        manager_out = None

    audited = [auditor.audit(output) for output in pipeline_outputs]

    return {
        "learner_id": learner_id,
        "learning_path": audited[0].output,
        "study_plan": audited[1].output,
        "engagement": audited[2].output,
        "assessment": audited[3].output,
        "manager_insights": audited[4].output if manager_out else None,
        "audit_summary": {
            "flagged": [a.learner_id for a in audited if a.flagged_by_audit],
            "notes": [note for a in audited for note in a.audit_notes],
        },
        "citations": list({c for a in audited for c in a.citations}),
    }
