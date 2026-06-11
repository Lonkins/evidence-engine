# Evidence Engine — Demo Screenshots

Screenshots from the WP4 live Copilot Chat session, captured 2026-06-11.

## Required beats (per game-walkthrough.md)

| File | Beat | Status |
|------|------|--------|
| `01-load-case.png` | `load_case` — case briefing with Foundry IQ mode shown | pending |
| `02-interrogate-helena-departure.png` | `interrogate Helena Voss "When did you leave?"` — citations visible | pending |
| `03-interrogate-felix-departure.png` | `interrogate Felix Drummond "What time did you leave?"` | pending |
| `04-interrogate-helena-conversation.png` | `interrogate Helena Voss "What was your conversation about?"` | pending |
| `05-check-claim-contradicted.png` | `check_claim "Helena Voss left the gallery at approximately 7:45pm"` — **CONTRADICTED verdict + security log citation visible** | pending |
| `06-check-claim-supported.png` | `check_claim "Victor Holt planned to confront Helena about a forged provenance certificate"` — SUPPORTED | pending |
| `07-accuse-solved.png` | `accuse Helena Voss` with evidence keys — CASE SOLVED | pending |

The `05-check-claim-contradicted.png` screenshot is the submission's hero image — it must show:
- The CONTRADICTED verdict header
- The `09-security-log.md` citation with the `20:47:33` timestamp visible

## Instructions

1. Open VS Code with the `evidence-engine/` folder
2. Ensure `.vscode/mcp.json` is loaded (VS Code prompts for Azure endpoint + key on first use)
3. Open Copilot Chat → select Agent mode → choose `evidence-engine` from the agent list
4. Follow the beats in `docs/game-walkthrough.md` step by step
5. Screenshot each tool response in full (include the Copilot Chat panel)
6. Save screenshots here with the filenames above
