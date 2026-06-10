# RiskRadar — SharePoint Integration

This directory contains the provisioning script and integration guide for connecting the RiskRadar MCP server to the real SharePoint Approved Tools Registry.

## Why this matters

The MCP server ships with a local file store (`server/data/assessments.json`) as its development backend. This is the dev stub — real deployments write to a SharePoint list so assessments persist across restarts, are visible to the school's IT team in SharePoint, and benefit from M365 permissions, audit logging, and version history.

---

## Step 1 — Provision the SharePoint list

**Prerequisites:** Install PnP PowerShell and have a SharePoint site URL.

```powershell
Install-Module PnP.PowerShell -Scope CurrentUser

.\provision-registry.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/IT"
```

The script creates the **Approved Tools Registry** list with these columns:

| Column | Internal Name | Type | Notes |
|--------|--------------|------|-------|
| Tool Name | `Title` | Text (required) | Renamed from SharePoint default |
| Vendor Name | `VendorName` | Text (required) | |
| Assessment Date | `AssessmentDate` | DateTime | |
| Risk Score (5–25) | `RiskScore` | Number | Sum of 5 dimension scores |
| Data Privacy Score | `DataPrivacyScore` | Number 1–5 | |
| Age Appropriateness Score | `AgeAppropScore` | Number 1–5 | |
| Transparency Score | `TransparencyScore` | Number 1–5 | |
| Bias Risk Score | `BiasScore` | Number 1–5 | |
| Vendor Accountability Score | `VendorAcctScore` | Number 1–5 | |
| Risk Rating | `RiskRating` | Choice | Low / Medium / High / Critical |
| Decision | `Decision` | Choice | Approved / Approved with Controls / Not Approved / Escalate to DPO/DSL |
| Review Date | `ReviewDate` | DateTime | Auto-set: Low→12 months, others→6 months |
| Assessed By | `AssessedBy` | Person | |
| AUP Clause | `AUPClause` | Multiline Text | Suggested policy clause when Approved |
| Notes | `Notes` | Multiline Text | |
| CSM Privacy Rating | `CSMRating` | Text | Grade from Common Sense Media |
| Reassessment Triggered | `ReassessmentTriggered` | Boolean | Set when vendor updates terms |

---

## Step 2 — Register an Azure App Registration

The MCP server connects to SharePoint using the [client credentials OAuth 2.0 flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow) — no user interaction needed.

1. Azure Portal → **Azure Active Directory → App registrations → New registration**
   - Name: `RiskRadar MCP Server`
   - Supported account types: Accounts in this organizational directory only
2. Under **API permissions → Add a permission → Microsoft Graph → Application permissions:**
   - Add `Sites.ReadWrite.All`
   - Click **Grant admin consent**
3. Under **Certificates & secrets → New client secret:**
   - Set an expiry (12 months recommended)
   - Copy the secret **value** immediately — it won't be shown again

---

## Step 3 — Configure the MCP server

Add to `server/.env`:

```env
SP_SITE_URL=https://contoso.sharepoint.com/sites/IT
SP_LIST_NAME=Approved Tools Registry
SP_TENANT_ID=<Directory (tenant) ID from Azure AD>
SP_CLIENT_ID=<Application (client) ID>
SP_CLIENT_SECRET=<Client secret value>
```

---

## Step 4 — Switch store.ts to the Graph API backend

Open `server/src/store.ts`. At the bottom of the file, the local-file functions are exported.

Replace the three export lines with a one-line swap:

```typescript
// BEFORE (local file store — development only):
export { getAssessment, saveAssessment, getAllAssessments };

// AFTER (SharePoint via Microsoft Graph — production):
export {
  getAssessmentFromSharePoint as getAssessment,
  saveAssessmentToSharePoint as saveAssessment,
  getAllAssessmentsFromSharePoint as getAllAssessments,
} from "./graph-store";
```

The Graph API store lives in `server/src/graph-store.ts`. It:
- Uses client credentials to obtain a Graph token automatically
- Resolves the site ID and list ID from the env vars on first call (cached per process)
- Performs exact + partial-match lookups matching the local store behaviour
- Handles create vs update transparently

---

## Architecture — data flow with SharePoint enabled

```
M365 Copilot Chat
      │
      │  (DA invokes MCP action)
      ▼
RiskRadar MCP Server
      │
      ├─ POST /api/getAssessment ──► graph-store.getAssessmentFromSharePoint()
      │                                  │
      │                                  └─ GET Graph /sites/{id}/lists/{id}/items?$filter=...
      │                                     ◄─ SharePoint Approved Tools Registry
      │
      ├─ POST /api/saveAssessment ──► graph-store.saveAssessmentToSharePoint()
      │                                  │
      │                                  └─ POST/PATCH Graph /sites/{id}/lists/{id}/items
      │                                     ──► SharePoint Approved Tools Registry
      │
      └─ POST /api/vendorLookup ──► ratings.lookupRating() (local, no SharePoint)
```

---

## Security notes

- The App Registration should have only `Sites.ReadWrite.All` — not tenant-wide read, not user impersonation
- Store the client secret in a Key Vault or Azure App Service managed identity in production; env vars are acceptable for a dev/demo deployment
- The `AssessedBy` field defaults to `"RiskRadar via M365 Copilot"` — SharePoint audit logging provides the actual user identity from the DA session context
