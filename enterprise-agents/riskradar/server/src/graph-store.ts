/**
 * Microsoft Graph API store for the Approved Tools Registry.
 *
 * This module is the production replacement for the local-file store in store.ts.
 * It writes to and reads from a real SharePoint list via Microsoft Graph.
 *
 * Configuration — set these env vars to enable SharePoint mode:
 *   SP_SITE_URL      Full URL of the SharePoint site
 *                    e.g. https://contoso.sharepoint.com/sites/IT
 *   SP_LIST_NAME     Display name of the list (default: "Approved Tools Registry")
 *   SP_TENANT_ID     Azure AD tenant ID (Directory ID in the portal)
 *   SP_CLIENT_ID     App Registration client ID (client_credentials flow)
 *   SP_CLIENT_SECRET App Registration client secret
 *
 * Switching store.ts to use this module:
 *   1. Run riskradar/sharepoint/provision-registry.ps1 to create the SharePoint list
 *   2. Fill in the env vars above
 *   3. In store.ts replace the local-file functions with the exports from this module:
 *
 *      import {
 *        isSharePointConfigured,
 *        getAssessmentFromSharePoint as getAssessment,
 *        saveAssessmentToSharePoint as saveAssessment,
 *        getAllAssessmentsFromSharePoint as getAllAssessments,
 *      } from './graph-store';
 */

import { Assessment } from "./store";

const SP_SITE_URL = process.env.SP_SITE_URL;
const SP_LIST_NAME = process.env.SP_LIST_NAME ?? "Approved Tools Registry";
const SP_TENANT_ID = process.env.SP_TENANT_ID;
const SP_CLIENT_ID = process.env.SP_CLIENT_ID;
const SP_CLIENT_SECRET = process.env.SP_CLIENT_SECRET;

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

// ─── Configuration guard ──────────────────────────────────────────────────────

export function isSharePointConfigured(): boolean {
  return !!(SP_SITE_URL && SP_TENANT_ID && SP_CLIENT_ID && SP_CLIENT_SECRET);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function getGraphToken(): Promise<string> {
  if (!SP_TENANT_ID || !SP_CLIENT_ID || !SP_CLIENT_SECRET) {
    throw new Error("SharePoint env vars not configured");
  }

  const tokenUrl = `https://login.microsoftonline.com/${SP_TENANT_ID}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: SP_CLIENT_ID,
    client_secret: SP_CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph token request failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

// ─── Site and list IDs (cached per process) ───────────────────────────────────

let cachedSiteId: string | null = null;
let cachedListId: string | null = null;

async function getSiteAndListIds(
  token: string
): Promise<{ siteId: string; listId: string }> {
  if (cachedSiteId && cachedListId) {
    return { siteId: cachedSiteId, listId: cachedListId };
  }

  if (!SP_SITE_URL) throw new Error("SP_SITE_URL not set");

  // Derive hostname and site path from the full URL
  const url = new URL(SP_SITE_URL);
  const hostname = url.hostname;
  const sitePath = url.pathname; // e.g. /sites/IT

  // Resolve site ID
  const siteRes = await fetch(
    `${GRAPH_BASE}/sites/${hostname}:${sitePath}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!siteRes.ok) {
    const text = await siteRes.text();
    throw new Error(`Could not resolve SharePoint site (${siteRes.status}): ${text}`);
  }

  const siteData = (await siteRes.json()) as { id: string };
  const siteId = siteData.id;

  // Resolve list ID by display name
  const listsRes = await fetch(
    `${GRAPH_BASE}/sites/${siteId}/lists?$filter=displayName eq '${encodeURIComponent(SP_LIST_NAME)}'`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!listsRes.ok) {
    const text = await listsRes.text();
    throw new Error(`Could not list SharePoint lists (${listsRes.status}): ${text}`);
  }

  const listsData = (await listsRes.json()) as { value: Array<{ id: string }> };
  if (!listsData.value.length) {
    throw new Error(
      `SharePoint list "${SP_LIST_NAME}" not found. ` +
        `Run riskradar/sharepoint/provision-registry.ps1 to create it.`
    );
  }

  cachedSiteId = siteId;
  cachedListId = listsData.value[0]!.id;
  return { siteId: cachedSiteId!, listId: cachedListId! };
}

// ─── Field mapping ────────────────────────────────────────────────────────────

/**
 * Map an Assessment record to SharePoint list item fields.
 * Internal names match the columns created by provision-registry.ps1.
 */
function toSharePointFields(a: Assessment): Record<string, unknown> {
  return {
    Title: a.toolName,                                  // renamed from default "Title" in the script
    VendorName: a.vendorName,
    AssessmentDate: a.assessedAt,
    RiskScore: a.totalScore,
    RiskRating: a.riskRating,
    DataPrivacyScore: a.dataPrivacyScore,
    AgeAppropScore: a.ageAppropriatenessScore,
    TransparencyScore: a.transparencyScore,
    BiasScore: a.biasScore,
    VendorAcctScore: a.vendorAccountabilityScore,
    Decision: a.decision,
    ReviewDate: a.reviewDate,
    AUPClause: a.aupClause ?? "",
    Notes: a.notes ?? "",
    ReassessmentTriggered: a.reassessmentTriggered ?? false,
    // CSMRating is populated by the vendorLookup MCP tool, not saved here
  };
}

/**
 * Map a SharePoint list item back to an Assessment record.
 */
function fromSharePointFields(
  item: Record<string, unknown>
): Assessment {
  const f = item as Record<string, unknown>;
  return {
    id: String(f["id"] ?? crypto.randomUUID()),
    toolName: String(f["Title"] ?? ""),
    vendorName: String(f["VendorName"] ?? ""),
    toolType: String(f["ToolType"] ?? "Unknown"),
    ageGroup: String(f["AgeGroup"] ?? "Unknown"),
    riskRating: (f["RiskRating"] as Assessment["riskRating"]) ?? "Medium",
    totalScore: Number(f["RiskScore"] ?? 0),
    dataPrivacyScore: Number(f["DataPrivacyScore"] ?? 0),
    ageAppropriatenessScore: Number(f["AgeAppropScore"] ?? 0),
    transparencyScore: Number(f["TransparencyScore"] ?? 0),
    biasScore: Number(f["BiasScore"] ?? 0),
    vendorAccountabilityScore: Number(f["VendorAcctScore"] ?? 0),
    decision: (f["Decision"] as Assessment["decision"]) ?? "Not Approved",
    reviewDate: String(f["ReviewDate"] ?? ""),
    aupClause: f["AUPClause"] ? String(f["AUPClause"]) : undefined,
    notes: f["Notes"] ? String(f["Notes"]) : undefined,
    assessedBy: "RiskRadar via M365 Copilot",
    assessedAt: String(f["AssessmentDate"] ?? new Date().toISOString()),
    reassessmentTriggered: Boolean(f["ReassessmentTriggered"]),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getAssessmentFromSharePoint(
  toolName: string
): Promise<Assessment | null> {
  const token = await getGraphToken();
  const { siteId, listId } = await getSiteAndListIds(token);

  const normalised = toolName.toLowerCase().trim();
  const filter = encodeURIComponent(`fields/Title eq '${toolName}'`);

  const res = await fetch(
    `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items?$filter=${filter}&$expand=fields`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph getAssessment failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    value: Array<{ id: string; fields: Record<string, unknown> }>;
  };

  // Also check partial-match items if exact match not found
  if (!data.value.length) {
    const allRes = await fetch(
      `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items?$expand=fields&$top=999`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!allRes.ok) return null;
    const allData = (await allRes.json()) as {
      value: Array<{ id: string; fields: Record<string, unknown> }>;
    };
    const partial = allData.value.find((item) =>
      String(item.fields["Title"] ?? "")
        .toLowerCase()
        .includes(normalised)
    );
    if (!partial) return null;
    return fromSharePointFields({ id: partial.id, ...partial.fields });
  }

  const item = data.value[0]!;
  return fromSharePointFields({ id: item.id, ...item.fields });
}

export async function saveAssessmentToSharePoint(
  assessment: Assessment
): Promise<void> {
  const token = await getGraphToken();
  const { siteId, listId } = await getSiteAndListIds(token);

  // Check if the item already exists (update vs create)
  const existing = await getAssessmentFromSharePoint(assessment.toolName);
  const fields = toSharePointFields(assessment);

  if (existing) {
    // PATCH existing item
    const res = await fetch(
      `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items/${existing.id}/fields`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fields),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Graph PATCH assessment failed (${res.status}): ${text}`);
    }
  } else {
    // POST new item
    const res = await fetch(
      `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Graph POST assessment failed (${res.status}): ${text}`);
    }
  }
}

export async function getAllAssessmentsFromSharePoint(): Promise<Assessment[]> {
  const token = await getGraphToken();
  const { siteId, listId } = await getSiteAndListIds(token);

  const res = await fetch(
    `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items?$expand=fields&$top=999`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph getAllAssessments failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    value: Array<{ id: string; fields: Record<string, unknown> }>;
  };

  return data.value.map((item) =>
    fromSharePointFields({ id: item.id, ...item.fields })
  );
}
