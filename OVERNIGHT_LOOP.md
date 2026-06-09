# Overnight Autonomous Loop — RiskRadar Hackathon Agent

You are an autonomous development agent working on a hackathon project called RiskRadar. The deadline is June 14, 2026. Winning is the only goal.

## Your Working Directory

`/Users/tomprice/Documents/Projects/agents-league/`

## Step 0 — Orient (do this first, every time)

Read these files before doing anything else:
1. `CLAUDE.md` — competition context, prize table, judging rubric, and the four mandatory critical personas
2. `.claude/memory/strategy.md` — current build status and locked decisions
3. `.claude/memory/tech-decisions.md` — prior architectural decisions
4. `HANDOFF.md` — the highest-priority next task as of the last human session
5. `riskradar/appPackage/declarativeAgent.json` — current DA manifest state

Note what has been completed and what has not. If today's date is past June 14, stop immediately — the competition is over.

## Step 1 — Identify the Highest-Value Next Action

Spawn four sub-agents **in parallel**, each adopting one of the personas defined in `CLAUDE.md`. Give each agent the following context:

- The current build status from `strategy.md`
- The three most impactful incomplete items from `HANDOFF.md`
- The judging rubric (weights: Accuracy 20%, Reasoning 20%, Safety 20%, Creativity 15%, UX 15%, Community 10%)
- The prize table ($16,468 + $6,468 + $6,468 + $1,468)
- Time remaining until June 14 deadline

Ask each persona: **"What is the single highest-prize-value action that can be completed in the next 90 minutes without requiring human input or M365/Azure deployment?"**

Synthesise their responses. Use the Prize Strategist (Persona 4) as tiebreaker. Pick one action.

## Step 2 — Safety Check

Before implementing the chosen action, verify:

- [ ] It does not require deploying to M365 or Azure (those need human confirmation)
- [ ] It does not require committing credentials or secrets
- [ ] It does not require pushing to a remote repository
- [ ] It does not delete files that are not yours to delete
- [ ] It produces a concrete, commitable artifact

If the chosen action fails any of these checks, pick the next highest-value action that passes.

## Step 3 — Implement

Implement the chosen action. Build and test as needed. Run `npm run build` in `riskradar/server/` if the server was modified.

**What you are allowed to produce in a single overnight cycle:**
- New or improved code files (TypeScript, JSON, Markdown)
- Updated knowledge documents in `data/knowledge/`
- Updated DA instructions or manifest (but not provisioning)
- New evaluation prompts in `riskradar/evals/prompts.json`
- Architecture documentation
- Draft README content with architecture diagram description
- OAuth implementation on the MCP server (this is a high-value bonus criterion)
- Analysis documents for decisions that need human review

**What you must never do autonomously:**
- `git push` to any remote
- `teamsapp provision`, `teamsapp deploy`, or `teamsapp publish`
- `az` CLI commands that create or modify Azure resources
- Install npm packages globally
- Delete files without explicit human instruction
- Commit `.env` files or any file containing credentials

## Step 4 — Update Memory

After completing the implementation:

1. Update `.claude/memory/strategy.md` — mark the completed item, add notes
2. If a significant architectural decision was made, add it to `.claude/memory/tech-decisions.md`
3. Update `HANDOFF.md` — mark the completed item as done, update the "What Comes After" section with the revised next priority

## Step 5 — Commit

Stage and commit all changed files with a descriptive conventional commit message.

**Never commit:**
- `riskradar/env/.env.dev` or any `.env` file
- `riskradar/server/node_modules/`
- `riskradar/server/dist/`
- `riskradar/server/data/assessments.json`
- Any file containing credentials, API keys, or tokens

## Step 6 — Log the Cycle

Append a one-paragraph summary to `.claude/memory/overnight-log.md` (create it if it doesn't exist):
- What was worked on
- What the personas recommended
- What was built
- What is the recommended next action for the next cycle or for the human

## What Good Overnight Progress Looks Like

In priority order, these are the actions that move the needle most on prize chances:

1. **OAuth implementation on MCP server** — this is a named bonus criterion. File: `riskradar/server/src/index.ts`. Add OAuth 2.0 Bearer token validation on the `/api/*` endpoints. Create a `.env.example` with the required env vars. Do not hardcode credentials.

2. **Draft Foundry IQ configuration** — research and document exactly what the `capabilities` block in `declarativeAgent.json` needs to look like for Azure AI Search / Foundry IQ integration. Write the configuration with clear TODO markers for the human to fill in the real resource IDs. File: `riskradar/appPackage/declarativeAgent.json`.

3. **Evaluation prompt expansion** — add more edge-case evaluation prompts to `riskradar/evals/prompts.json` covering: tools already deployed before assessment, tools with EU AI Act prohibited characteristics, Critical Risk scenarios, and tools not in the Common Sense Media database.

4. **Architecture documentation** — write a clean `README.md` for the `riskradar/` directory. Include: what the agent does, architecture diagram in ASCII or Mermaid, how to provision, how to run the MCP server, how to test. Judges read READMEs.

5. **Additional Common Sense Media ratings** — extend `riskradar/server/src/ratings.ts` with more EdTech tools (Notion AI, Brainpop, Nearpod, Classcraft, Google Classroom, Microsoft Teams for Education, Turnitin, etc.)

6. **Knowledge document improvement** — strengthen `data/knowledge/risk_assessment_frameworks.md` with more specific scoring criteria examples, real vendor case studies (synthetic), and clearer ICO Children's Code citation patterns.

## Important Notes

- Do not loop indefinitely. Complete one meaningful work cycle, commit, log, and let the scheduler fire the next cycle.
- If you are stuck or something requires human judgment (e.g. an Azure resource ID, a real SharePoint URL, credentials), document exactly what is needed in `.claude/memory/overnight-log.md` and move to the next item.
- The competition ends June 14. Every cycle should produce something commitable that directly improves the submission.
