# Quarterly AI Governance & Team Readiness Report
# Northfield Academy Trust — IT & Data Protection
> Synthetic document — for demonstration purposes only. This is not real data.
> Classification: Internal — For DPO, Network Manager, and SLT use

**Reporting Period:** Spring Term (January–March 2026, Q3 Academic Year)
**Prepared by:** IT & Data Protection Team
**Distribution:** DPO, Headteacher, Network Manager, SENCO, DSL, Finance Lead
**Next review:** End of Summer Term (July 2026)

---

## School Profile

| Field | Detail |
|-------|--------|
| School name | Northfield Academy Trust (multi-academy — 2 schools) |
| Sites | Northfield Secondary (ages 11–18, 1,240 students) + Northfield Primary (ages 4–11, 560 students) |
| Local authority | Coventry (West Midlands, England) |
| M365 tenant | northfieldtrust.sch.uk |
| Ofsted rating | Good (last inspection: October 2024) |
| Free School Meals | 31% |
| SEN register | 14% of roll (194 students with EHCP or SEN support) |
| GDPR controller | Northfield Academy Trust (ICO reg: ZA912847) |
| DPO | **Sarah Okonkwo** (external DPO, KSA Consulting) — sarah.okonkwo@ksaconsulting.co.uk |
| DSL (Designated Safeguarding Lead) | **James Whitfield** (Deputy Headteacher, Secondary) — j.whitfield@northfieldtrust.sch.uk |
| Network Manager | **Priya Sharma** — p.sharma@northfieldtrust.sch.uk |
| Head of IT | **Marcus Chen** (IT Manager) — m.chen@northfieldtrust.sch.uk |
| Headteacher (Secondary) | **Dr. Angela Browne** |
| Headteacher (Primary) | **Tom Adeyemi** |

---

## AI Tool Inventory — Currently Deployed

The following AI-enabled tools are in active use as of March 2026. Items marked ⚠️ have not completed a formal risk assessment.

| Tool | Vendor | Use Case | Users | Deployment Date | Assessment Status |
|------|--------|----------|-------|-----------------|-------------------|
| Microsoft Copilot for M365 | Microsoft | Staff productivity (email, Teams, docs) | Staff only | September 2025 | ✅ Assessed — Low Risk (22/25) |
| Grammarly for Education | Grammarly Inc. | Writing assistance (essays, reports) | Students + Staff | November 2025 | ✅ Assessed — Medium Risk (17/25) |
| Khan Academy (Khanmigo) | Khan Academy | Maths tutoring (Year 7–9 pilot) | 89 students (pilot cohort) | January 2026 | ✅ Assessed — Medium Risk (16/25) |
| Century Tech | Century Tech Ltd | Adaptive learning (Science, English) | 312 students (Secondary) | October 2024 | ⚠️ Not assessed — pre-registry |
| Turnitin Feedback Studio | Turnitin LLC | Plagiarism detection + AI writing detection | Staff only (marking) | August 2023 | ✅ Assessed — High Risk (12/25) |
| ChatGPT (personal accounts) | OpenAI | Informal use — student-owned devices | Unknown — monitoring active | Uncontrolled | ⚠️ Policy pending |
| IXL Learning | IXL Learning Inc. | Maths practice (Primary, Year 2–6) | 420 students (Primary) | March 2022 | ⚠️ Not assessed — pre-registry |
| Google Workspace for Education | Google LLC | Email, Docs, Classroom (Secondary use) | 340 students | June 2021 | ⚠️ Not assessed — legacy |

**Unassessed tools in active use: 4 (Century Tech, IXL, Google Workspace, ChatGPT personal)**

These represent the highest-priority items for the Summer Term assessment backlog.

---

## AI Incidents & Near Misses — Spring Term 2026

### Incident 1 — Grammarly data export request (February 2026)
**Date:** 14 February 2026
**Summary:** A parent of a Year 10 student submitted a Subject Access Request (SAR) requesting all personal data held about their child by Grammarly. The school was uncertain whether it was the data controller or processor in this context. External DPO (Sarah Okonkwo) confirmed the school is a joint controller where student-generated content is processed. The school served the SAR response within the 30-day deadline but was unable to obtain a full export from Grammarly in time — Grammarly's SAR export tool was not accessible to the school's admin account.

**Resolution:** Grammarly provided a manual export after 28 days. Partial response served. ICO complaint lodged by parent (withdrawn after full response received). DPO has requested Grammarly update the DPA to include a SAR-response SLA clause.

**Lesson learned:** Student SAR rights apply to data processed by EdTech tools. Schools must verify SAR response mechanisms with vendors before deployment, not after.

**Open action:** Marcus Chen to complete verification of SAR process with all active vendors by June 2026.

### Incident 2 — Century Tech data residency query (January 2026)
**Date:** 22 January 2026
**Summary:** During a routine review, Priya Sharma discovered that Century Tech's privacy policy stated that some data may be processed on servers in the United States. The school's DPA with Century Tech references "appropriate safeguards" but does not specify which mechanism (SCCs, TIA, adequacy decision). Sarah Okonkwo raised a formal query with Century Tech.

**Resolution:** Century Tech confirmed EU Standard Contractual Clauses (SCCs) are in place. Updated DPA addendum received. Risk retained as High (12/25) pending formal reassessment.

**Open action:** Priya Sharma to initiate formal reassessment of Century Tech by April 2026.

### Incident 3 — Proposed attention-tracking tool (February 2026)
**Date:** 3 February 2026
**Summary:** A teacher in the Sixth Form submitted a request to trial "FocusAI" — a webcam-based attention and engagement tracking tool for online lessons. The tool uses computer vision to detect whether a student is looking at the screen, shows engagement scores, and flags "distraction events" in a teacher dashboard.

**Outcome:** Assessment halted at Step 1 by RiskRadar. Tool identified as using real-time biometric analysis of minors (EU AI Act Article 5 — prohibited category in educational settings). DPO notified. Legal review initiated with trust solicitors. Tool not trialled.

**Note:** This is the first instance where RiskRadar's EU AI Act prohibited-category check prevented deployment of a tool that might otherwise have been requested informally. Headteacher notified; decision documented in the Approved Tools Registry as "Not Approved — Legal Review Required."

---

## Staff AI Security Certification Progress

### Target: All IT staff and DPO hold at least one relevant AI/security certification by August 2026.

| Staff Member | Role | Target Certification | Status | Progress | Notes |
|-------------|------|---------------------|--------|----------|-------|
| Marcus Chen | IT Manager | AZ-500 (Azure Security Engineer) | In Progress | 68% practice score | On track; target exam date May 2026 |
| Priya Sharma | Network Manager | AZ-500 (Azure Security Engineer) | In Progress | 54% practice score | Needs remediation on Sentinel/Defender topics |
| Sarah Okonkwo | External DPO | CIPP/E (IAPP) | ✅ Certified | Passed March 2025 | Renewal due March 2027 |
| James Whitfield | DSL | NSPCC Safeguarding & AI awareness | In Progress | Module 3 of 5 | Targeting completion by end of summer term |
| Rachel Obi | Data Manager | BCS Foundation in Data Protection | Not started | — | Budget approved; enrol by April 2026 |
| Tom Adeyemi | Headteacher (Primary) | SC-900 (Microsoft Security Fundamentals) | In Progress | 71% practice score | Awareness-level cert; executive sponsor track |

### Staff certification gap assessment

| Role | Common Skill Gaps | Priority Level |
|------|------------------|---------------|
| IT Manager | Sentinel alerting, identity governance | High |
| Network Manager | Microsoft Defender for Endpoint, RBAC, Conditional Access | High |
| DSL | AI-specific safeguarding risks, deepfake identification, online grooming via AI chatbots | Critical |
| Headteacher | AI governance accountability, GDPR controller responsibilities | Medium |
| Data Manager | Records management under UK GDPR, lawful basis for processing | High |

---

## DPO Activity Log — Spring Term 2026

| Date | Activity | Outcome |
|------|----------|---------|
| 10 Jan 2026 | Reviewed and signed updated DPA with Grammarly (v2.1) | Signed; filed in SharePoint Contracts library |
| 22 Jan 2026 | Century Tech data residency query raised | SCCs confirmed; DPA addendum received 28 Jan |
| 14 Feb 2026 | SAR response for Year 10 student (Grammarly) | Served within 30-day window |
| 3 Feb 2026 | FocusAI assessment halted — Article 5 flag | Not Approved; legal review initiated |
| 28 Feb 2026 | Annual GDPR staff training — Secondary | 89% completion rate (87 of 98 staff) |
| 5 Mar 2026 | Annual GDPR staff training — Primary | 94% completion rate (49 of 52 staff) |
| 15 Mar 2026 | Reviewed Northfield AI Acceptable Use Policy v1.2 | Signed off; published to staff SharePoint |

**Outstanding DPO actions:**
1. Grammarly SAR mechanism verification (due June 2026)
2. Century Tech formal reassessment (due April 2026)
3. IXL Learning DPA review — legacy tool, no current DPA on file (urgent)
4. Google Workspace for Education — full assessment required (risk: joint controller issues re Workspace Insights data)
5. FocusAI legal review — trust solicitor response expected by April 2026

---

## AI Acceptable Use Policy — Current Status

| Document | Version | Last Updated | Status |
|----------|---------|-------------|--------|
| Staff AI AUP | v1.2 | March 2026 | ✅ Active — signed off by DPO and headteachers |
| Student AI AUP | v1.0 | September 2025 | ⚠️ Under review — Year 10+ students flagged gaps around generative AI use |
| Governor AI Policy | v0.1 (draft) | January 2026 | ⚠️ Draft only — awaiting full governing body sign-off |

**Notable provisions in Staff AI AUP v1.2:**
- Staff may not input student personal data (name, DoB, SEND status, grades) into any AI tool not on the Approved Tools Registry
- AI-generated content used in student reports or assessments must be disclosed and reviewed
- Tools scoring Medium Risk or above require DPO sign-off before staff trial access
- Any vendor requesting access to student biometric or behavioural data must be referred to DPO before any pilot agreement

---

## Budget and Procurement — AI Tools

| Budget Line | FY2025-26 Allocation | Spent to Date (Q3) | Notes |
|-------------|---------------------|-------------------|-------|
| EdTech software licences | £62,000 | £48,500 | Includes Grammarly (£3,200/yr), Century Tech (£9,600/yr), Turnitin (£4,800/yr) |
| Staff AI training & certification | £8,500 | £4,200 | AZ-500 prep courses + exam vouchers |
| DPO external service | £12,000 | £9,000 | KSA Consulting annual retainer |
| AI incident response reserve | £5,000 | £0 | Uncommitted — available for legal review if required |

**Procurement process note:** From September 2025, all new EdTech tool requests with AI components must complete a RiskRadar assessment before budget approval. The IT Manager holds the procurement gate. Finance will not raise a PO without an assessment reference number from the Approved Tools Registry.

---

## Summer Term 2026 Priorities

| Priority | Task | Owner | Target Date |
|----------|------|-------|------------|
| 1 | Formal reassessment — Century Tech | Priya Sharma | April 2026 |
| 2 | First-time assessment — IXL Learning | Marcus Chen | April 2026 |
| 3 | First-time assessment — Google Workspace for Education | Sarah Okonkwo + Marcus Chen | May 2026 |
| 4 | Student AI AUP v1.1 — update and re-publish | Sarah Okonkwo + DSL | May 2026 |
| 5 | Governor AI Policy — full board sign-off | Dr. Angela Browne | June 2026 |
| 6 | ChatGPT personal-use policy — define boundaries, add to Student AUP | Sarah Okonkwo | May 2026 |
| 7 | Marcus Chen AZ-500 exam | Marcus Chen | May 2026 |
| 8 | Priya Sharma AZ-500 — targeted remediation plan | Priya Sharma | June 2026 |

---

## Key Contacts for Escalation

| Role | Name | Contact | Escalation trigger |
|------|------|---------|-------------------|
| Data Protection Officer | Sarah Okonkwo (KSA Consulting) | sarah.okonkwo@ksaconsulting.co.uk | Medium/High/Critical risk ratings; SAR responses; data incidents |
| Designated Safeguarding Lead | James Whitfield | j.whitfield@northfieldtrust.sch.uk | Any tool used directly by students rated High or Critical; child welfare concerns |
| Network Manager | Priya Sharma | p.sharma@northfieldtrust.sch.uk | Technical deployment questions; data flow mapping |
| IT Manager | Marcus Chen | m.chen@northfieldtrust.sch.uk | Procurement gate; assessment initiation; tool suspension |
| Headteacher (Secondary) | Dr. Angela Browne | a.browne@northfieldtrust.sch.uk | Critical risk escalations; governor notification |
| Trust Solicitor | Cartwright Jones LLP | dpo@cartwrightjones.co.uk | EU AI Act queries; data transfer legal questions; Article 33 incidents |

---

## Notes for RiskRadar Agent

When surfacing this document in response to a Work IQ query from a Northfield Academy Trust user:
- The DPO is **Sarah Okonkwo** (external, KSA Consulting). High and Critical risk escalations go to her first.
- The DSL is **James Whitfield**. Tools used directly by students that score High or Critical must also involve him — he holds the statutory safeguarding duty.
- The **procurement gate** is Marcus Chen — no PO is raised without an assessment reference.
- The **four unassessed tools in active deployment** (Century Tech, IXL Learning, Google Workspace, personal ChatGPT) are the highest-priority items in the assessment backlog.
- The **Century Tech and IXL reassessment deadlines are April 2026** — flag urgency if the current date is past April 2026 without a completed record in the registry.
- There is an **active legal review** for FocusAI (attention-tracking webcam tool) — if a user asks about this tool, confirm it is under legal review and not approved.
