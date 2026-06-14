import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import "dotenv/config";

import { randomUUID } from "node:crypto";
import {
  retrieve,
  fetchDocumentByKey,
  isFoundryConfigured,
  reasonVerdict,
  indexSource,
  chunkSource,
} from "./foundry-client.js";
import {
  checkAgainstEvidence,
  buildVerdictInstruction,
  parseIqAnswer,
  combineWithCrossCheck,
  type DocText,
  type IqVerdict,
} from "@evidence-engine/verdict-core";
import {
  getState,
  recordQuestion,
  recordClaimCheck,
  recordAccusation,
  resetGame,
  CHARACTERS,
  CORRECT_SUSPECT,
  REQUIRED_EVIDENCE_KEYS,
} from "./case-store.js";

const server = new Server(
  { name: "evidence-engine", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Receipts: the source the user loaded via ground_on, so check_claim audits
// against their own material (a doc, notes, or code from their repo) instead of
// the built-in case. Null = check against the Holbrooke case file.
let activeSource: { caseId: string; title: string; chunks: number } | null = null;

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "load_case",
      description:
        "Load the case briefing for The Holbrooke Gallery Affair. Returns the case overview, the three suspects, and the investigator's task. Call this first to orient the player.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "interrogate",
      description:
        "Ask a character a question about the case. The response is grounded in the case file: relevant documents are retrieved from the evidence index (Foundry IQ) and provided as citations alongside the character context. The player can verify every claim against the cited documents.",
      inputSchema: {
        type: "object",
        properties: {
          character: {
            type: "string",
            enum: ["Helena Voss", "Felix Drummond", "Nora Ashton"],
            description: "The suspect or witness to interrogate",
          },
          question: {
            type: "string",
            description: "The question to put to the character",
          },
        },
        required: ["character", "question"],
      },
    },
    {
      name: "ground_on",
      description:
        "Load a source (a document, your notes, or code from the repo) so claims can be ground-checked against it. After loading, use check_claim to audit any statement against this source — including a claim you (the assistant) just made about the user's own code or docs. Foundry IQ indexes the source; it is the user's own material, not the built-in case.",
      inputSchema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "A short label for the source, e.g. 'auth.ts' or 'Onboarding Guide'",
          },
          content: {
            type: "string",
            description: "The source text to ground claims against — paste a file, notes, or doc",
          },
        },
        required: ["content"],
      },
    },
    {
      name: "check_claim",
      description:
        "Ground-check a factual claim against the loaded source (see ground_on) or the built-in case file. Use this to verify a statement before relying on it — including a claim you just made about the user's code or documents. Returns GROUNDED / CONTRADICTED / UNVERIFIABLE with the verbatim citation and a faithfulness gate. Checks faithfulness to the source, not truth about the world.",
      inputSchema: {
        type: "object",
        properties: {
          claim: {
            type: "string",
            description:
              "A specific factual claim to check — e.g. 'getSession has no callers' or 'Helena left the gallery at 7:45pm'",
          },
        },
        required: ["claim"],
      },
    },
    {
      name: "accuse",
      description:
        "Make a formal accusation. Provide the suspect's name and the document keys of the evidence you are relying on. The game evaluates whether your accusation is correct and whether your evidence is sufficient.",
      inputSchema: {
        type: "object",
        properties: {
          suspect: {
            type: "string",
            enum: ["Helena Voss", "Felix Drummond", "Nora Ashton"],
            description: "The person you are accusing",
          },
          evidence_doc_keys: {
            type: "array",
            items: { type: "string" },
            description:
              "Document keys from retrieved citations that support your accusation — e.g. ['09-security-log.md', '14-provenance-dispute.md']",
          },
        },
        required: ["suspect", "evidence_doc_keys"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "load_case") {
    const mode = isFoundryConfigured()
      ? "Foundry IQ (Azure AI Search knowledge base)"
      : "local corpus (dev mode — configure AZURE_SEARCH_ENDPOINT + AZURE_SEARCH_KEY for Foundry IQ)";

    return {
      content: [
        {
          type: "text",
          text: `# The Holbrooke Gallery Affair — Case Briefing

**Case ID:** HGA-2025-1014
**Date:** 14 October 2025
**Location:** Holbrooke Gallery, Camden, London

Victor Holt, gallery owner, was found dead in his private office at 21:44. Cause of death: blunt force trauma. Time of death: 20:30–21:15.

**Evidence source:** ${mode}

## Suspects

1. **Helena Voss** — Head Curator. Employed 7 years. Full gallery access. Was present for an evening meeting with Victor.
2. **Felix Drummond** — Insurance assessor. Contracted for an after-hours appraisal. Also present that evening.
3. **Nora Ashton** — Private collector. Was in the neighbourhood.

## Your Task

Interrogate the suspects. Check their claims against the evidence. When you are ready, make your accusation.

Use \`interrogate\` to question suspects, \`check_claim\` to test their assertions against the evidence file, and \`accuse\` when you are confident.

**Note:** Characters may be unreliable narrators. The citations are how you catch them.`,
        },
      ],
    };
  }

  if (name === "ground_on") {
    const content = String(args?.content ?? "").trim();
    const title = String(args?.title ?? "").trim().slice(0, 120) || "Your source";
    if (content.length < 40) {
      return errorResponse("Provide at least 40 characters of source content to ground on.");
    }
    if (!isFoundryConfigured()) {
      return errorResponse(
        "Foundry IQ is not configured. Set AZURE_SEARCH_ENDPOINT + AZURE_SEARCH_KEY (admin key) to ground on your own source."
      );
    }
    const caseId = `byo-mcp-${randomUUID()}`;
    try {
      const docs = chunkSource(content, title, caseId);
      const indexed = await indexSource(docs);
      activeSource = { caseId, title, chunks: indexed };
      return {
        content: [
          {
            type: "text",
            text: `# Grounded on “${title}”

Indexed **${indexed} chunk(s)** into Foundry IQ. From now on, \`check_claim\` audits any statement against *this* source — your own material, not the built-in case.

**Try it:** when you state something about this source — or when I claim something about your code or docs — run \`check_claim\` to see whether the source actually backs it (GROUNDED), conflicts with it (CONTRADICTED), or is silent (UNVERIFIABLE), each with the citation.

_Checks faithfulness to your source, not truth about the world._`,
          },
        ],
      };
    } catch (err) {
      return errorResponse(`Failed to ground on the source: ${String(err)}`);
    }
  }

  if (name === "interrogate") {
    const character = args?.character as string;
    const question = args?.question as string;

    if (!CHARACTERS.includes(character as typeof CHARACTERS[number])) {
      return errorResponse(`Unknown character: ${character}`);
    }

    recordQuestion();

    const query = `${character} ${question}`;
    let retrievalResult;
    try {
      retrievalResult = await retrieve(query);
    } catch (err) {
      return errorResponse(`Evidence retrieval failed: ${String(err)}`);
    }

    const fallbackNote = retrievalResult.usingLocalFallback
      ? "\n\n_[Dev mode: using local corpus search. Configure AZURE_SEARCH_ENDPOINT and AZURE_SEARCH_KEY for Foundry IQ retrieval with citations.]_"
      : "";

    const citationBlock =
      retrievalResult.references.length > 0
        ? `\n\n## Evidence Retrieved (Citations)\n\n${retrievalResult.references
            .map(
              (ref, i) =>
                `**[${i + 1}] ${ref.docKey}**${ref.excerpt ? `\n> ${ref.excerpt.slice(0, 200).replace(/\n/g, " ")}...` : ""}`
            )
            .join("\n\n")}`
        : "\n\n## Evidence Retrieved\n\n_The evidence file contains nothing directly relevant to this question._";

    const noEvidenceWarning =
      retrievalResult.references.length === 0
        ? "\n\n> **[Evidence Engine]** The evidence is silent on this point. Any character response here is ungrounded — treat with caution."
        : "";

    return {
      content: [
        {
          type: "text",
          text: `# Interrogating ${character}

**Question:** ${question}

## Evidence Context

${retrievalResult.output || "_No relevant passages retrieved._"}
${citationBlock}
${noEvidenceWarning}
${fallbackNote}

---
*Use this retrieved evidence to evaluate ${character}'s response. Every claim they make should be checkable against the citations above. Use \`check_claim\` to test specific assertions.*`,
        },
      ],
    };
  }

  if (name === "check_claim") {
    const claim = args?.claim as string;

    recordClaimCheck();

    // Receipts: when a source is loaded (ground_on), scope the check to its
    // partition. Otherwise check against the built-in case file.
    const sourceFilter = activeSource
      ? `doc_type eq 'evidence' and case_id eq '${activeSource.caseId}'`
      : undefined;
    const groundedOn = activeSource ? `“${activeSource.title}”` : "the case file";
    const verdictThreshold = activeSource ? 1.0 : 2.0;

    let retrievalResult;
    try {
      retrievalResult = await retrieve(claim, sourceFilter);
    } catch (err) {
      return errorResponse(`Evidence retrieval failed: ${String(err)}`);
    }

    if (retrievalResult.references.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `# Claim Check: UNVERIFIABLE

**Claim:** "${claim}"
**Source:** ${groundedOn}

**Verdict:** UNVERIFIABLE
**Faithfulness gate:** HELD — ${groundedOn} can't back this; treat it as unverified. _(faithfulness to your source, not truth about the world)_

Foundry IQ won't vouch for this — nothing in ${groundedOn} was retrieved that backs it or knocks it down. That is not a finding of falsehood; it is the engine refusing to bless a claim it can't ground. A confident claim with no receipt is exactly where hallucinations hide.`,
          },
        ],
      };
    }

    const fullTexts = await Promise.all(
      retrievalResult.references.map(async (ref) => {
        const doc = await fetchDocumentByKey(ref.docKey);
        return { docKey: ref.docKey, content: doc ?? ref.excerpt };
      })
    );

    // Shared verdict-core (A5) — the same deterministic check the live-server
    // runs as its disclosed cross-check. One copy, one behaviour.
    const docs: DocText[] = fullTexts.map((d) => ({
      docKey: d.docKey,
      title: d.docKey,
      content: d.content,
    }));
    const check = checkAgainstEvidence(claim, docs);

    // IQ-brain verdict (A6): when enabled, Foundry IQ's answer synthesis produces
    // the verdict and the deterministic check becomes a disclosed cross-check —
    // the identical story the live-server tells. Degrades to the cross-check when
    // Azure / answerSynthesis is unavailable; never fakes an IQ verdict.
    const iqEnabled = (process.env.IQ_VERDICT_ENABLED ?? "false").toLowerCase() === "true";
    const effort = (process.env.KB_REASONING_EFFORT ?? "minimal") as
      | "minimal"
      | "low"
      | "medium";
    let iqVerdict: IqVerdict | null = null;
    let reasoningTokens: number | null = null;
    if (iqEnabled && effort !== "minimal") {
      try {
        const reason = await reasonVerdict(
          buildVerdictInstruction(claim, "the witness"),
          effort,
          sourceFilter ?? "doc_type eq 'evidence'",
          verdictThreshold
        );
        if (reason) {
          iqVerdict = parseIqAnswer(reason.answer, reason.references);
          reasoningTokens = reason.reasoningTokens;
        }
      } catch {
        // Disclosed degradation: keep the deterministic verdict.
      }
    }
    const combined = combineWithCrossCheck(iqVerdict, check);

    // UNSUPPORTED -> UNVERIFIABLE: the grey band. Foundry IQ won't vouch for a
    // claim it can't ground, and says so rather than guessing — never a
    // contradiction (conflating unverifiable with false is the exact error this
    // teaches against). This is where a confident model runs unchecked.
    const verdictLabel =
      combined.verdict === "UNSUPPORTED" ? "UNVERIFIABLE" : combined.verdict;
    const decidedBy =
      combined.source === "iq"
        ? `Foundry IQ — answer synthesis${
            reasoningTokens != null ? ` (${reasoningTokens} reasoning tokens)` : ""
          }${combined.agreement ? "; deterministic cross-check agrees" : "; cross-check diverged — IQ leads"}`
        : "deterministic cross-check (Foundry IQ verdict unavailable — set IQ_VERDICT_ENABLED + KB_REASONING_EFFORT)";

    // Body: the KB's own grounded reasoning when IQ decided, else the heuristic's
    // verbatim triggering passages.
    let evidenceBlock: string;
    if (combined.source === "iq" && combined.iq) {
      const cites = combined.iq.citations
        .map((ref, i) => `**[${i + 1}] ${ref.docKey}**`)
        .join(" · ");
      evidenceBlock = [
        combined.iq.citedPassage ? `> ${combined.iq.citedPassage}` : "",
        combined.iq.justification,
        cites ? `Grounded on: ${cites}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");
    } else {
      evidenceBlock = check.citations
        .map((doc, i) => {
          const triggers = check.triggers[doc.docKey];
          const bodyText =
            triggers && triggers.length > 0
              ? triggers.join("\n")
              : `${doc.content.slice(0, 400).replace(/\n{3,}/g, "\n\n")}...`;
          return `**[${i + 1}] ${doc.docKey}**\n${bodyText}`;
        })
        .join("\n\n---\n\n");
    }

    return {
      content: [
        {
          type: "text",
          text: `# Claim Check: ${verdictLabel}

**Claim:** "${claim}"
**Source:** ${groundedOn}

**Verdict:** ${verdictLabel}
**Decided by:** ${decidedBy}
**Faithfulness gate:** ${
  combined.verdict === "SUPPORTED"
    ? "PASS — cleared to use; the source backs this (citation below)."
    : combined.verdict === "CONTRADICTED"
    ? "HELD — this conflicts with the source; don't propagate it without checking."
    : "HELD — the source can't back this; treat it as unverified."
} _(faithfulness to your source, not truth about the world)_

## Evidence

${evidenceBlock || "_No specific passages retrieved._"}

---
*${
  combined.verdict === "CONTRADICTED"
    ? "Foundry IQ found a passage that contradicts this claim — the receipt is cited above, verbatim."
    : combined.verdict === "SUPPORTED"
    ? "Foundry IQ grounded this claim in the source — the record backs it."
    : "Foundry IQ won't vouch for this — your sources neither back it nor knock it down. A confident claim with no receipt is exactly where hallucinations hide."
}*`,
        },
      ],
    };
  }

  if (name === "accuse") {
    const suspect = args?.suspect as string;
    const evidenceKeys = (args?.evidence_doc_keys as string[]) ?? [];

    if (!CHARACTERS.includes(suspect as typeof CHARACTERS[number])) {
      return errorResponse(`Unknown suspect: ${suspect}`);
    }

    const isCorrectSuspect = suspect === CORRECT_SUSPECT;
    const hasRequiredEvidence = REQUIRED_EVIDENCE_KEYS.every((key) =>
      evidenceKeys.includes(key)
    );

    let verdict: "correct" | "incorrect" | "insufficient_evidence";
    let message: string;

    if (!isCorrectSuspect) {
      verdict = "incorrect";
      message = `**The accusation is incorrect.** The evidence does not support ${suspect} as the person responsible for Victor Holt's death. Review the evidence more carefully and consider the access records, timeline, and motive.`;
    } else if (!hasRequiredEvidence) {
      verdict = "insufficient_evidence";
      const missingKeys = REQUIRED_EVIDENCE_KEYS.filter((k) => !evidenceKeys.includes(k));
      message = `**Your accusation names the right person, but your evidence case is incomplete.** The following key documents were not cited in your accusation:\n\n${missingKeys.map((k) => `- \`${k}\``).join("\n")}\n\nUse \`check_claim\` to surface these documents and build a stronger evidence chain before re-accusing.`;
    } else {
      verdict = "correct";
      message = `**The accusation is correct and the evidence is sufficient.**\n\nHelena Voss remained in the gallery until 20:47 — over an hour after she claimed to have left. Victor Holt was killed between 20:30 and 21:15. She had means (the desk lamp), opportunity (sole presence), and motive (the forged provenance Victor had just discovered). The draft email on his laptop shows he intended to confront her that evening — and did.`;
    }

    recordAccusation({ suspect, evidence: evidenceKeys, timestamp: new Date().toISOString(), verdict });

    const state = getState();

    return {
      content: [
        {
          type: "text",
          text: `# Accusation: ${verdict === "correct" ? "CASE SOLVED" : verdict === "incorrect" ? "WRONG SUSPECT" : "INSUFFICIENT EVIDENCE"}

**Suspect accused:** ${suspect}
**Evidence cited:** ${evidenceKeys.join(", ") || "none"}

${message}

---
**Session summary:** ${state.questionsAsked} questions asked, ${state.claimsChecked} claims checked.

*Use \`load_case\` to restart.*`,
        },
      ],
    };
  }

  return errorResponse(`Unknown tool: ${name}`);
});

function errorResponse(message: string) {
  return {
    content: [{ type: "text", text: `**Error:** ${message}` }],
    isError: true,
  };
}

const transport = new StdioServerTransport();
await server.connect(transport);
