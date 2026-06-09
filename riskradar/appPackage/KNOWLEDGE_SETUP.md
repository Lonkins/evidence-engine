# RiskRadar — Knowledge Source Setup

The `declarativeAgent.json` manifest contains two `capabilities` blocks that need real resource IDs before provisioning. Fill in the TODOs below, then run `teamsapp provision`.

---

## Why Both Sources Matter for Judging

| Capability | IQ Layer | Prize impact |
|-----------|----------|-------------|
| `OneDriveAndSharePoint` | Work IQ | Demonstrates M365-native knowledge grounding |
| `GraphConnectors` (Azure AI Search) | Foundry IQ | Required for "Best Use of IQ Tools" ($6,468) |

---

## TODO 1 — OneDriveAndSharePoint (Work IQ)

**What to fill in:** The SharePoint URL where the 4 knowledge documents will live.

### Steps

1. In your M365 dev tenant, go to `https://TODO_TENANT_NAME.sharepoint.com`
2. Create a site called `RiskRadar` (or use any existing site)
3. In that site's `Documents` library, create a folder called `RiskRadar-Knowledge`
4. Upload all 4 files from `/data/knowledge/` into that folder:
   - `risk_assessment_frameworks.md`
   - `owasp_ai_top10.md`
   - `ai_security_cert_guide.md`
   - `team_readiness_report.md`
5. Copy the folder URL from the browser address bar — it should look like:
   `https://contoso.sharepoint.com/sites/RiskRadar/Shared%20Documents/RiskRadar-Knowledge`
6. Replace the TODO value in `declarativeAgent.json`:
   ```json
   "url": "https://YOUR_TENANT.sharepoint.com/sites/YOUR_SITE/Shared%20Documents/RiskRadar-Knowledge"
   ```

---

## TODO 2 — GraphConnectors / Azure AI Search (Foundry IQ)

**What to fill in:** The connection ID of the Microsoft Graph connector pointing to your Azure AI Search index.

### Steps

#### A. Create the Azure AI Foundry knowledge base

1. Go to [https://ai.azure.com](https://ai.azure.com) → create a Hub and Project
2. In the Project, go to **Data + indexes** → **New index**
3. Upload the 4 knowledge documents from `/data/knowledge/`
4. Azure AI Foundry will create an Azure AI Search index automatically
5. Note the **Azure AI Search resource name** and **index name**

#### B. Register the Graph connector in M365

1. In the [Microsoft 365 admin center](https://admin.microsoft.com), go to **Search & intelligence** → **Data sources**
2. Click **Add a connected source** → **Azure AI Search**
3. Connect your Azure AI Search resource (you'll need the endpoint URL and API key from step A)
4. Set the **connection ID** — use a short, lowercase, no-spaces identifier like `riskradardocs`
5. Complete the connector configuration and wait for indexing to finish

#### C. Update `declarativeAgent.json`

Replace the TODO value:
```json
"connection_id": "riskradardocs"
```

Use exactly the connection ID you set in step B.

---

## Verification

After provisioning, test in M365 Copilot Chat:
- Ask: "What does the NIST AI RMF say about data privacy scoring for AI tools?"
- The response should cite `risk_assessment_frameworks.md` by name
- If the response cites the document, both IQ layers are working

---

## Troubleshooting

**"I don't have an Azure subscription"** — The Azure AI Search free tier (F0) has zero cost. Create a free subscription at [azure.microsoft.com/free](https://azure.microsoft.com/free).

**The DA works without the knowledge source** — It will respond, but from base model knowledge, not from your curated documents. Answers citing "NIST AI RMF section X" without a real knowledge source are ungrounded and will score poorly on Accuracy & Relevance (20%).

**GraphConnectors connection doesn't appear** — Indexing can take 10–30 minutes after connector setup. Wait and try again.

---

## Knowledge Documents Summary

| File | Key Content | Why It Matters |
|------|------------|---------------|
| `risk_assessment_frameworks.md` | NIST AI RMF four functions, 5-dimension scoring rubric with criteria at each level (1–5), ICO Children's Code, EU AI Act categories | **Most critical** — the DA cites this for every score justification |
| `owasp_ai_top10.md` | OWASP LLM01–LLM10 | Security grounding for transparency/bias questions |
| `ai_security_cert_guide.md` | Cert pathways for school roles | Supports vendor accountability scoring |
| `team_readiness_report.md` | Synthetic readiness report | Demonstrates org-context capability (Work IQ signal) |
