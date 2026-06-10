# Discord Community Vote Post — Templates

> Post in the Agents League Discord on or after June 12 (after you have a demo video link).
> Copy one of the templates below. Template A is recommended.

---

## Template A — Full post (recommended)

```
🏫 We built RiskRadar for schools — and I think it might be the most underrated problem in EdTech right now.

Teachers are adopting AI tools into classrooms every week. A new AI writing assistant, an adaptive learning platform, a homework helper. And in most schools, nobody is systematically checking whether these tools are safe for students before they're deployed.

No privacy check. No age-appropriateness review. No audit trail.

RiskRadar is a Declarative Agent in Microsoft 365 Copilot that fixes this.

Here's what it does:
→ IT admin names an AI tool to assess
→ Agent checks the existing Approved Tools Registry first (MCP read tool)
→ Runs a structured 6-step assessment conversation — NIST AI RMF × ICO Children's Code × EU AI Act
→ Scores the tool across 5 dimensions: Data Privacy, Age Appropriateness, Transparency, Bias & Fairness, Vendor Accountability
→ Calls a real-time EdTech privacy database lookup (MCP tool)
→ Saves the completed assessment to SharePoint (MCP write tool)
→ Delivers a risk rating with cited framework references — and explicitly flags that this supports human judgment, it doesn't replace DPO sign-off

The responsible AI story: any vendor privacy policy change auto-triggers a reassessment. Protection doesn't expire when the vendor rewrites their terms.

Demo video: [INSERT LINK]

Built on Microsoft 365 Agents Toolkit. Knowledge base grounded in Foundry IQ. Work IQ integration via SharePoint Approved Tools Registry.

#AgentsLeague #HackForGood #Enterprise #MicrosoftCopilot
```

---

## Template B — Short version (if character limit is tight)

```
🏫 RiskRadar — AI tool risk assessment for schools, built on M365 Copilot.

Every week, teachers adopt new AI tools into classrooms. Most schools have no systematic process to check if those tools are safe for students before they go live.

RiskRadar gives every school IT admin a 10-minute, auditable, framework-grounded assessment workflow — NIST AI RMF, ICO Children's Code, EU AI Act — with real MCP tool integrations and Foundry IQ grounding.

It also knows when a tool is prohibited outright (EU AI Act Article 5 — attention tracking, emotion recognition) and refuses to score it on a standard rubric. That's the responsible AI story.

Demo: [INSERT LINK]

#AgentsLeague #HackForGood #M365Copilot
```

---

## Template C — Technical focus (for developer-heavy Discord audiences)

```
Built for Agents League: RiskRadar, a Declarative Agent for school AI safety

The technical stack:
- Microsoft 365 Declarative Agent (Agents Toolkit, manifest v1.27)
- 3 MCP tools: getAssessment (registry read), vendorLookup (EdTech privacy DB), saveAssessment (registry write)
- TypeScript MCP server with file-persisted assessment store
- Foundry IQ knowledge base: NIST AI RMF with full sub-category codes, ICO Children's Code (all 15 standards), EU AI Act Articles 5 and 50
- Work IQ integration: SharePoint Approved Tools Registry

The workflow: 6-step structured conversation → 5-dimension scoring → cited framework references → AUP clause generation → auditable registry write.

The responsible AI angle: any tool using attention tracking or emotion recognition in an educational setting gets flagged as prohibited under EU AI Act Article 5(1)(e) — not assessed on a standard rubric.

Demo: [INSERT LINK]

#AgentsLeague #MicrosoftCopilot #MCP #EnterpriseAgents
```

---

## Posting Notes

- Post at 9–10am UK time on a weekday for maximum visibility
- Reply to your own post within the first hour to bump it ("Happy to answer questions about the responsible AI framing or MCP architecture")
- If the Discord has a #hack-for-good or #enterprise channel, post there specifically — not just #general
- React to two or three other submissions before posting yours — reciprocity increases vote likelihood
- Pin the YouTube/Vimeo link in your message, not a Google Drive link — easier for judges to open on mobile
