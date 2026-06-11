import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import "dotenv/config";

import { retrieve, fetchDocumentByKey, isFoundryConfigured } from "./foundry-client.js";
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
      name: "check_claim",
      description:
        "Check whether a specific factual claim is supported by evidence in the case file. Returns: SUPPORTED (with citations), CONTRADICTED (with citations to the contradicting evidence), or INSUFFICIENT_EVIDENCE (the evidence file is silent on this point). This is the core lie-detection mechanic.",
      inputSchema: {
        type: "object",
        properties: {
          claim: {
            type: "string",
            description:
              "A specific factual claim to check — e.g. 'Helena left the gallery at 7:45pm' or 'Felix was at dinner by 8:35pm'",
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

    let retrievalResult;
    try {
      retrievalResult = await retrieve(claim);
    } catch (err) {
      return errorResponse(`Evidence retrieval failed: ${String(err)}`);
    }

    if (retrievalResult.references.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `# Claim Check: INSUFFICIENT EVIDENCE

**Claim:** "${claim}"

**Verdict:** INSUFFICIENT EVIDENCE

The evidence file is silent on this point. No documents were retrieved that speak to this claim. This does not mean the claim is false — only that the available evidence cannot confirm or refute it.`,
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

    const claimLower = claim.toLowerCase();
    const claimTerms = claimLower.split(/\W+/).filter((t) => t.length > 3);

    // Extract HH:MM style times from a string (returns minutes since midnight for comparison)
    function extractTimes(text: string): number[] {
      const matches = text.match(/\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/gi) ?? [];
      return matches.map((t) => {
        const parts = t.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
        if (!parts) return -1;
        let hours = parseInt(parts[1], 10);
        const mins = parseInt(parts[2], 10);
        const meridiem = (parts[3] ?? "").toLowerCase();
        if (meridiem === "pm" && hours !== 12) hours += 12;
        if (meridiem === "am" && hours === 12) hours = 0;
        return hours * 60 + mins;
      }).filter((n) => n >= 0);
    }

    // Explicit contradiction phrases that genuinely negate a claim
    const EXPLICIT_CONTRADICTION_PHRASES = [
      "does not", "did not", "was not", "were not",
      "no record", "not present", "never arrived", "denied",
      "contradicts", "inconsistent with",
    ];

    const claimTimes = extractTimes(claimLower);

    const supporting: typeof fullTexts = [];
    const contradicting: typeof fullTexts = [];

    for (const doc of fullTexts) {
      const lower = doc.content.toLowerCase();
      const directMatch = claimTerms.some((term) => lower.includes(term));
      if (!directMatch) continue;

      // 1. Explicit negation phrases are reliable contradiction signals
      const hasExplicitContradiction = EXPLICIT_CONTRADICTION_PHRASES.some((s) => lower.includes(s));

      // 2. Temporal conflict: claim asserts a time, document records a different time for the same entity
      let hasTemporalConflict = false;
      if (claimTimes.length > 0) {
        const docTimes = extractTimes(lower);
        if (docTimes.length > 0) {
          // Flag a conflict only when every doc time differs from every claimed time by >5 minutes
          hasTemporalConflict = claimTimes.every((ct) =>
            docTimes.every((dt) => Math.abs(ct - dt) > 5)
          ) && docTimes.length > 0;
        }
      }

      if (hasExplicitContradiction || hasTemporalConflict) {
        contradicting.push(doc);
      } else {
        supporting.push(doc);
      }
    }

    const verdict =
      contradicting.length > 0
        ? "CONTRADICTED"
        : supporting.length > 0
        ? "SUPPORTED"
        : "INSUFFICIENT EVIDENCE";

    const relevantDocs = verdict === "CONTRADICTED" ? contradicting : supporting;

    const citationBlock = relevantDocs
      .map(
        (doc, i) =>
          `**[${i + 1}] ${doc.docKey}**\n${doc.content.slice(0, 400).replace(/\n{3,}/g, "\n\n")}...`
      )
      .join("\n\n---\n\n");

    return {
      content: [
        {
          type: "text",
          text: `# Claim Check: ${verdict}

**Claim:** "${claim}"

**Verdict:** ${verdict}

## Supporting Documents

${citationBlock || "_No specific passages retrieved._"}

---
*${
  verdict === "CONTRADICTED"
    ? "The evidence contradicts this claim. Note the specific document and passage — this may be significant."
    : verdict === "SUPPORTED"
    ? "The evidence is consistent with this claim."
    : "The evidence file cannot confirm or refute this claim."
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
