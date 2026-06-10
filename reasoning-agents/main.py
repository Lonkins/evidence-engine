"""
Entry point — run the full pipeline for a learner or team.

Usage:
    python main.py --learner L-1001
    python main.py --learner L-1001 --manager
    python main.py --team
"""
import argparse
import json

from rich.console import Console
from rich.panel import Panel
from rich.pretty import Pretty

from agents.orchestrator import run_pipeline
from agents.manager_insights import ManagerInsightsAgent

console = Console()


def show_learner(learner_id: str, manager_mode: bool = False) -> None:
    console.print(Panel(f"Running pipeline for [bold]{learner_id}[/bold]", style="blue"))
    result = run_pipeline(learner_id, manager_mode=manager_mode)
    console.print(Pretty(result))

    audit = result.get("audit_summary", {})
    if audit.get("flagged"):
        console.print(Panel(
            f"[bold red]Security Audit flagged outputs for:[/bold red] {audit['flagged']}\n\n"
            + "\n".join(audit.get("notes", [])),
            title="Audit Alert",
            style="red",
        ))
    else:
        console.print(Panel("[green]Security Audit: all outputs passed[/green]", style="green"))


def show_team() -> None:
    console.print(Panel("Running Manager Insights for full team", style="magenta"))
    agent = ManagerInsightsAgent()
    result = agent.run()
    console.print(Panel(result.output["insights"], title="Manager Insights"))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Security Readiness — Schools Programme")
    parser.add_argument("--learner", type=str, help="Learner ID (e.g. L-1001)")
    parser.add_argument("--manager", action="store_true", help="Include manager insights")
    parser.add_argument("--team", action="store_true", help="Run team-level insights only")
    args = parser.parse_args()

    if args.team:
        show_team()
    elif args.learner:
        show_learner(args.learner, manager_mode=args.manager)
    else:
        parser.print_help()
