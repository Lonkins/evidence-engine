# Handoff: MCP Server Test Suite + CLAUDE.md Sync

## Context — Read This First

You are working on **RiskRadar**, a hackathon submission for the Agents League competition (Microsoft, Enterprise Agents track, deadline June 14 2026). The mandate for every decision in this project is:

> **THE ONLY GOAL IS TO WIN.**

Prize structure (prizes stack):
- Best Overall Agent: $16,468
- Best Enterprise Agent: $6,468
- Best Use of IQ Tools: $6,468
- Hack for Good: $1,468
- **Maximum reachable: ~$30,404**

Judging weights:
- Accuracy & Relevance: 20%
- Reasoning & Multi-step Thinking: 20%
- **Reliability & Safety: 20%** ← primary beneficiary of this task
- Creativity & Originality: 15%
- User Experience & Presentation: 15%
- Community Vote (Discord): 10%

Working directory: `/Users/tomprice/Documents/Projects/agents-league/`

---

## Current State

The MCP server is a TypeScript Express server at `riskradar/server/`. It has 4 source files:

| File | What it does |
|------|-------------|
| `src/auth.ts` | OAuth 2.0 Bearer token middleware — JWKS validation against Azure AD. Dev mode bypass when env vars absent. |
| `src/store.ts` | File-persisted assessment store. CRUD against `data/assessments.json`. |
| `src/ratings.ts` | Common Sense Media EdTech privacy ratings for 18 tools. Pure lookup. |
| `src/index.ts` | Express app. Three POST endpoints: `/api/getAssessment`, `/api/saveAssessment`, `/api/vendorLookup`. Auth middleware applied to all `/api/*` routes. |

The build is clean (`npm run build` passes). There are **zero test files** in the project. No test framework is installed.

Other completed work (done by overnight autonomous loops, not yet reflected in CLAUDE.md):
- OAuth middleware (`src/auth.ts`) — JWKS + Azure AD RS256 validation, dev bypass
- `appPackage/ai-plugin.json` — `OAuthPluginVault` auth block added to runtime spec
- `env/.env.dev` — `OAUTH_REFERENCE_ID` placeholder added
- `server/.env.example` — Azure App Registration setup instructions
- `riskradar/README.md` — full project README with Mermaid architecture diagram
- `data/knowledge/risk_assessment_frameworks.md` — 580 lines including 3 sample assessments (ChatGPT 16/25 Medium, Grammarly 17/25 Medium, CompanionAI 7/25 Critical Not Approved)
- `docs/demo-script.md` — full video recording guide
- `docs/discord-post.md` — Discord post templates

---

## Mandatory Pre-Implementation Step

**Before writing a single line of code, spawn the four mandatory critical personas in parallel.** Present each with the decision: "Should writing a comprehensive test suite for the MCP server be the highest-priority autonomous action right now given 4 days to deadline?" Each argues from their perspective:

**Persona 1 — Skeptical Microsoft Engineer:** Senior M365 Copilot expert looking for fake integrations and claims that don't hold up technically. Evaluate whether the test suite actually demonstrates what it claims, whether mocking JWKS correctly is technically credible, and whether there are higher-priority technical gaps judges will see.

**Persona 2 — Competing Team:** A rival Enterprise Agents team with a strong submission. Identify what weakness a test suite addresses and whether a competing team without tests would still beat this submission. What else would you do instead?

**Persona 3 — Conservative Responsible AI Judge:** Focused on Reliability & Safety (20%). Does a test suite move this score meaningfully? Does it test the right things — safety-critical paths, malformed inputs, auth failures? Would the absence of tests embarrass a winner?

**Persona 4 — Prize Strategist (tiebreaker):** Purely expected prize value. Does writing tests increase the probability of winning each prize? Quantify. Is this the best use of the remaining autonomous cycles before the deadline?

Wait for all four responses. If they disagree, Persona 4 breaks the tie. Document the consensus in `.claude/memory/overnight-log.md` before proceeding.

---

## Task 1: MCP Server Test Suite

### Requirements

- **Framework:** Add **Vitest** (`vitest`, `@vitest/coverage-v8`) — TypeScript-native, fast, no separate config needed, works with the existing `tsconfig.json`
- **Supertest** (`supertest`, `@types/supertest`) for route integration tests
- **Coverage target:** ≥80% line coverage across all 4 source files
- Add `"test": "vitest run"` and `"test:coverage": "vitest run --coverage"` to `server/package.json` scripts

### What to test

#### `src/auth.ts` — OAuth middleware

The middleware has two modes:

**Dev mode (env vars absent):**
- `OAUTH_TENANT_ID` and `OAUTH_AUDIENCE` not set
- Middleware calls `next()` and logs a warning
- Should NOT return 401

**Prod mode (env vars set):**
- No Authorization header → 401 `{ error: "Unauthorized — Bearer token required" }`
- Authorization header without "Bearer " prefix → 401
- Malformed JWT (not a valid JWT string) → 401 `{ error: "Unauthorized — invalid token structure" }`
- JWT missing `kid` header → 401
- Valid-looking JWT but JWKS signing key retrieval fails → 401 `{ error: "Unauthorized — token validation failed" }`
- Valid JWT, correct audience/issuer → calls `next()`

For prod mode tests, mock `jwks-rsa` to control `getSigningKey` behaviour without hitting Azure. Use `vi.mock('jwks-rsa')` and inject a spy on `jwt.verify`. Do NOT make real network calls to Azure AD in tests.

#### `src/store.ts` — Assessment store

The store reads from disk at module load. Tests must isolate from the real `data/assessments.json` — use `vi.mock('fs')` or a temporary test directory via `os.tmpdir()`. Reset the in-memory store between tests.

Tests required:
- `getAssessment` returns `null` when store is empty
- `getAssessment` returns matching record by exact name (case-insensitive)
- `getAssessment` returns matching record by partial name
- `getAssessment` returns `null` for no match
- `saveAssessment` adds a new record and persists it
- `saveAssessment` updates an existing record (same `toolName`) and preserves the `id`
- `saveAssessment` sets `assessedBy` to `"RiskRadar via M365 Copilot"` and `assessedAt` to current ISO timestamp
- `getAllAssessments` returns all stored records

#### `src/ratings.ts` — CSM ratings lookup

Pure lookup — no mocking needed:
- Returns correct rating object for known tools (test at least: `chatgpt`, `ChatGPT`, `CHATGPT` — case-insensitive)
- Returns `null` for unknown tool
- Returns rating object with expected shape: `{ tool, grade, score, safeForChildren, dataCollection, notes }`
- Verify at least 5 specific tools return expected grades (e.g. Khan Academy → A, Turnitin → D)

#### `src/index.ts` — Express routes

Use `supertest(app)` — export `app` from `index.ts` without calling `app.listen()` (the server should already support this pattern or you'll need to refactor `index.ts` to export the app separately from the `listen()` call).

In dev mode (no OAuth env vars), auth is bypassed. Test all routes without mocking auth:

**POST /api/getAssessment**
- Missing `toolName` → 400 or returns `{ found: false }` (check what the actual handler returns and test that)
- Unknown tool → `{ found: false }` (or equivalent)
- Known tool (after saving one) → returns the saved assessment

**POST /api/saveAssessment**
- Missing required fields → 400
- Valid payload → 200, returns the saved assessment record
- Saving same tool twice → second call updates, returns same `id`

**POST /api/vendorLookup**
- Missing `toolName` → 400 or `{ found: false }`
- Known tool → 200, returns CSM rating
- Unknown tool → `{ found: false }` or `{ error: ... }` (check actual handler)

**GET /**
- Returns `{ name: "RiskRadar MCP Server", status: "running", ... }`

### File structure

```
riskradar/server/
├── src/
│   ├── __tests__/
│   │   ├── auth.test.ts
│   │   ├── store.test.ts
│   │   ├── ratings.test.ts
│   │   └── routes.test.ts
│   ├── auth.ts
│   ├── index.ts
│   ├── ratings.ts
│   └── store.ts
```

### Constraints

- Do NOT make real network calls to Azure AD or any external service
- Do NOT read from or write to the real `data/assessments.json` during tests
- Do NOT break the existing build (`npm run build` must still pass)
- Do NOT modify the actual business logic in any source file except to separate app creation from `listen()` in `index.ts` if needed for supertest
- Use `vi.restoreAllMocks()` in `afterEach` to prevent test pollution

---

## Task 2: Sync CLAUDE.md Build Status

After the test suite is working, update `CLAUDE.md` at `agents-league/CLAUDE.md` to reflect what the overnight loops actually built.

**Bonus Criteria table** — change OAuth row:
```
| OAuth on MCP | ✅ Built | Bearer token middleware + OAuthPluginVault in ai-plugin.json |
```

**Current Build Status table** — update these rows:
- DA instructions → ✅ Complete (already correct)
- MCP server → ✅ Built and tested (update notes: "Express, TypeScript, OAuth middleware, file persistence")
- Common Sense Media ratings → ✅ 18 tools (was showing 12)
- Evaluation prompts → ✅ 14 prompts (was showing 7)
- OAuth on MCP server → ✅ Built (was ❌)
- Test suite → ✅ Built (add this row)

Add a row for items that overnight loops completed but weren't in the original status table:
- README → ✅ Complete
- Demo script → ✅ Complete (`docs/demo-script.md`)
- Discord post templates → ✅ Complete (`docs/discord-post.md`)
- Knowledge base (Foundry IQ docs) → ✅ 4 documents, 580+ lines (pending upload)

---

## Task 3: Update overnight-log.md

Add a new cycle entry to `.claude/memory/overnight-log.md` documenting:
- What the 4 personas recommended
- What was built
- The coverage result
- Next cycle priority

---

## Definition of Done

- [ ] `npm test` (or `npm run test`) runs and all tests pass
- [ ] `npm run test:coverage` shows ≥80% line coverage
- [ ] `npm run build` still passes with no TypeScript errors
- [ ] All 4 source files have test coverage (auth, store, ratings, routes)
- [ ] No real network calls made in any test
- [ ] `CLAUDE.md` build status table is accurate
- [ ] All changes committed with message: `test: add MCP server test suite and sync build status`
- [ ] `overnight-log.md` updated with this cycle

---

## Hard Constraints (Never Violate)

- Never commit `.env` files or secrets
- Never commit Azure API keys, OAUTH_TENANT_ID, or real credentials
- Use synthetic data only in tests — no real student names, emails, or PII
- Do not modify `riskradar/env/.env.dev` or any `.env*` file
- Do not run `teamsapp provision`, `teamsapp publish`, or `teamsapp deploy`
- Do not run `git push`
