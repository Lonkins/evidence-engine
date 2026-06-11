# RiskRadar — Hackathon Submission

> Pre-filled submission form. Copy each section into the corresponding field on the submission portal.
> Fields marked [FILL] require a human action before submitting (URL, video link, tenant ID).

---

## Project Name

RiskRadar

---

## One-Line Description

A Microsoft 365 Copilot Declarative Agent that helps school IT administrators systematically assess the safety and privacy risks of AI tools before deploying them to students.

---

## Short Description (tweet-length, ~280 characters)

RiskRadar is a Declarative Agent in M365 Copilot that gives school IT admins a structured, NIST AI RMF–grounded process for assessing AI tools before deployment to students — replacing ad hoc decisions with an auditable registry backed by Foundry IQ and SharePoint.

---

## Long Description (500–800 words)

### The Problem

Teachers are adopting AI tools into classrooms every week — AI writing assistants, adaptive tutoring platforms, behaviour management tools. School IT administrators and Data Protection Officers have no systematic process for evaluating whether those tools are safe for students. Data handling, age appropriateness under the ICO Children's Code, GDPR compliance, EU AI Act classification, bias risk — these decisions happen ad hoc, inconsistently, and without any auditable record. No credible, free substitute exists for this workflow in the UK school context.

Every week a school skips this evaluation is another week students may be sharing behavioural data with vendors who have no Data Processing Agreement in place, using tools that store data in jurisdictions outside the UK and EU, or accessing systems that fall under the EU AI Act's prohibited category.

### What RiskRadar Does

RiskRadar is a Declarative Agent running inside Microsoft 365 Copilot Chat. An IT admin or DPO opens Copilot Chat, names an AI tool they are considering, and RiskRadar conducts a structured assessment:

1. **Registry check** — calls `getAssessment` (MCP tool) to surface any prior assessment from the SharePoint Approved Tools Registry, preventing duplicate work and surfacing reassessment triggers when vendor policies have changed
2. **Structured conversation** — 6-step NIST AI RMF–grounded dialogue covering data handling, age appropriateness, vendor credentials, deployment context, decision impact, and existing use
3. **Grounded scoring** — scores across 5 dimensions (Data Privacy, Age Appropriateness, Transparency, Bias & Fairness, Vendor Accountability), each justified with a citation from the Foundry IQ knowledge base referencing NIST AI RMF sub-categories, ICO Children's Code articles, or EU AI Act provisions
4. **Independent vendor rating** — calls `vendorLookup` (MCP tool) to retrieve the Common Sense Media EdTech Privacy grade for 18 pre-loaded tools
5. **Registry write** — calls `saveAssessment` (MCP tool) to persist the outcome to the SharePoint Approved Tools Registry via Microsoft Graph API
6. **Human-first output** — delivers a risk rating (Low / Medium / High / Critical), decision, AUP clause for approved tools, and an explicit statement that the output supports human judgment — it does not replace it

High and Critical ratings automatically escalate to DPO or DSL review. This is a design principle, not a disclaimer.

### IQ Integration

**Foundry IQ (knowledge base grounding):** Four knowledge documents — NIST AI RMF framework with scoring rubric, OWASP AI Top 10, ICO Children's Code summary, and AI security certification pathways for school roles — are uploaded to Azure AI Foundry and indexed via Azure AI Search. Every dimension score the agent produces cites a specific framework section from this knowledge base. The agent cannot hallucinate scoring criteria; they are retrieved, not generated.

**Work IQ (tenant context):** The SharePoint Approved Tools Registry is configured as an `OneDriveAndSharePoint` capability in the DA manifest. The agent surfaces existing assessments from the school's own M365 tenant — this is organisational memory, not a generic database.

Both IQ layers are explicitly declared in the `declarativeAgent.json` capabilities block.

### Responsible AI Design

- Human-in-the-loop is structural: the agent produces evidence for human review, never a final decision
- High/Critical ratings require DPO or DSL sign-off before any action is taken
- Reassessment triggers fire automatically when vendor privacy policies change
- All scoring criteria are grounded in the knowledge base — no free-text generation of regulatory claims
- All assessment data is written to the school's own SharePoint tenant, not a third-party store

### Hack for Good

RiskRadar gives every school in the country a systematic, free process for protecting students from harmful AI tools — replacing ad hoc decisions with a credible, auditable framework that scales without consultancy cost. The target beneficiaries are the millions of students whose schools currently have no formal AI procurement evaluation process. The agent is free to any school with an M365 licence, which covers the majority of UK secondary schools.

---

## IQ Tools Integration Summary (for Best Use of IQ Tools prize)

| IQ Layer | Implementation | Evidence |
|----------|---------------|---------|
| **Foundry IQ** | 4 knowledge documents (NIST AI RMF + ICO + OWASP + cert guide) indexed in Azure AI Foundry via AI Search | `declarativeAgent.json` capabilities block — `GraphConnectors` with Azure AI Search connection ID; every agent response cites a framework section from these docs |
| **Work IQ** | SharePoint Approved Tools Registry as `OneDriveAndSharePoint` capability | `declarativeAgent.json` capabilities block; `getAssessment` MCP tool reads from SharePoint list via Microsoft Graph API (`graph-store.ts`); `saveAssessment` writes back |

Both layers are active simultaneously. Foundry IQ provides the scoring criteria; Work IQ provides the organisational memory. The agent uses both in every assessment conversation.

---

## Enterprise M365 Integration Summary (for Best Enterprise Agent prize)

| Component | Implementation |
|-----------|---------------|
| **Declarative Agent** | DA manifest v1.7 with conversation starters, IQ capabilities, and action linked to MCP tools |
| **SharePoint Approved Tools Registry** | PnP PowerShell provisioning script (`provision-registry.ps1`) creates a 17-column SharePoint list with choice fields for risk rating and decision, typed columns for all 5 dimension scores, and date fields for review scheduling |
| **Microsoft Graph API store** | `graph-store.ts` — full client_credentials token flow, site/list ID resolution (cached), field mapping both directions, create/PATCH upsert. One-line swap from file store to live SharePoint |
| **OAuth 2.0 on MCP server** | Bearer token middleware (`auth.ts`) validates Azure AD–issued JWTs via JWKS; `OAuthPluginVault` declared in `ai-plugin.json`; `OAUTH_REFERENCE_ID` env var wires the Teams Developer Portal OAuth config |
| **M365 Agents Toolkit** | DA scaffolded via ATK; `m365agents.yml` provision/publish pipeline; `MCP_SERVER_URL` env var substitution in `ai-plugin.json` for ngrok/Railway deploy |

---

## Hack for Good Rationale (150 words)

Schools are deploying AI tools to students without any systematic privacy or safety evaluation process. A teacher can introduce a new AI writing assistant to 30 students this morning — before any data handling check has been done. The consequences fall on children: their personal data processed without a lawful basis, their essays used to train AI models without consent, their behaviours profiled by systems with no age-appropriate design controls.

RiskRadar addresses this directly. It gives any school IT admin or DPO a structured, free process for evaluating AI tools against the NIST AI RMF, ICO Children's Code, and EU AI Act — grounded in a knowledge base, not guesswork. Every assessment produces an auditable record in the school's own SharePoint tenant. The re-assessment trigger means protection doesn't expire when a vendor quietly updates their privacy policy.

The direct beneficiaries are students. The mechanism is credible, specific, and deployable today on existing M365 infrastructure.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Agent type | Microsoft 365 Copilot Declarative Agent (v1.7 manifest) |
| Scaffolding | Microsoft 365 Agents Toolkit (ATK) |
| Knowledge grounding | Azure AI Foundry + Azure AI Search (Foundry IQ) |
| Tenant context | SharePoint via OneDriveAndSharePoint capability (Work IQ) |
| MCP server | TypeScript, Express, Node.js |
| MCP tools | `getAssessment`, `saveAssessment`, `vendorLookup` (3 tools) |
| SharePoint integration | Microsoft Graph API (`@azure/identity`, `@microsoft/microsoft-graph-client`) |
| SharePoint provisioning | PnP PowerShell (`provision-registry.ps1`) |
| OAuth | Azure AD JWT validation via JWKS (`jsonwebtoken`, `jwks-rsa`); OAuthPluginVault in ai-plugin.json |
| Test suite | Vitest, 56 tests, 97% coverage |
| Knowledge documents | 4 docs: NIST AI RMF, OWASP AI Top 10, ICO Children's Code, AI security cert guide |
| Vendor ratings | Common Sense Media EdTech Privacy — 18 tools pre-loaded |
| Hosting | [FILL: ngrok / Railway / Render URL for MCP server] |

---

## Demo Video

[FILL: YouTube / Loom link after recording — target June 13]

See `docs/demo-script.md` for the full narrated recording guide.

**Annotated conversation transcript (available now, pending video):** `docs/demo-transcript.md` documents the complete expected agent dialogue for both scenarios, including all MCP tool calls with request/response JSON, dimension-by-dimension scoring with framework citations, and the EU AI Act REDLINE halt. Judges can evaluate agent capability from this transcript without requiring a live provisioned instance.

**Recommended demo flow (3–4 minutes):**
1. Opening narration: the problem (30 seconds)
2. Scenario A: Grammarly assessment — full 6-step workflow, `getAssessment` → `saveAssessment` (2.5 minutes)
3. Scenario B (60-second add-on if time permits): EU AI Act prohibited category — attention-tracking tool with webcam. Agent flags Article 5 prohibition, refuses standard assessment, escalates to DPO/legal review.

---

## GitHub Repository

[FILL: public GitHub URL — ensure repo is public before submitting]

Key files for judges:
- `riskradar/appPackage/declarativeAgent.json` — DA manifest with capabilities block
- `riskradar/appPackage/instruction.txt` — full agent instructions and 6-step workflow
- `riskradar/appPackage/ai-plugin.json` — 3 MCP tool definitions + OAuthPluginVault
- `riskradar/server/src/` — MCP server: auth.ts, store.ts, graph-store.ts, ratings.ts, routes.ts
- `riskradar/sharepoint/provision-registry.ps1` — SharePoint registry provisioning script
- `data/knowledge/` — 4 knowledge documents (ready for Foundry upload)
- `riskradar/evals/prompts.json` — 17 evaluation prompts (incl. 3 REDLINES tests + incomplete-information refusal)

---

## Team

Solo submission.

Contact: babkek1337@gmail.com

---

## Prize Categories Entered

- [x] Best Overall Agent
- [x] Best Enterprise Agent
- [x] Best Use of IQ Tools
- [x] Hack for Good

---

## Submission Checklist

- [ ] Demo video recorded and uploaded
- [ ] GitHub repo set to public
- [ ] DA provisioned in M365 dev tenant (TEAMS_APP_ID populated)
- [ ] Knowledge docs uploaded to Azure AI Foundry
- [ ] TODO values filled in `declarativeAgent.json` (SharePoint URL + AI Search connection ID)
- [ ] OAuth App Registration complete; OAUTH_REFERENCE_ID set in .env.dev
- [ ] MCP server deployed to public HTTPS URL; MCP_SERVER_URL set in .env.dev
- [ ] Discord post submitted (see `docs/discord-post.md` for templates)
- [ ] This form submitted before June 14, 2026 EOD
