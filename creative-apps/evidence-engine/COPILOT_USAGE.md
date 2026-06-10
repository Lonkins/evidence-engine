# GitHub Copilot Usage — Evidence Engine

This document records every significant Copilot interaction during the development of Evidence Engine, as required by the Creative Apps judging criteria.

---

## Summary

GitHub Copilot was used throughout development across all four modes available: inline suggestions, Copilot Chat, Agent mode, and Plan mode. The MCP server itself is designed to be played inside Copilot Chat — making Copilot both the development tool and the runtime environment.

---

## Specific Uses

### 1. MCP Server Architecture Planning (Copilot Chat)

**Prompt used:**  
> "I'm building an MCP server for GitHub Copilot in VS Code for a detective game. The game mechanic is: every claim a character makes is grounded by Azure AI Search agentic retrieval, and the player wins by catching lies using citations. What tools should the MCP server expose?"

**Copilot's response** guided the 4-tool design: `load_case`, `interrogate`, `check_claim`, `accuse`. Copilot correctly identified that the citation integrity check should be structural (fetch by document key) rather than prompt-based, which became the responsible AI guardrail.

---

### 2. Foundry IQ API Integration (Copilot Inline + Chat)

**Inline:** When typing the `retrieveFromFoundry` function, Copilot auto-completed the fetch call body including the correct `messages` input shape for the preview API version, and suggested the `retrievalReasoningEffort: "minimal"` parameter.

**Chat prompt:**  
> "The Azure AI Search knowledge base retrieve endpoint returns references with docKey. How do I verify a citation is genuine without trusting the LLM's paraphrase?"

Copilot suggested fetching the document by key from the index (`/indexes/{name}/docs/{key}`) and checking whether the cited passage actually appears in the document. This became the `fetchDocumentByKey` pattern in `foundry-client.ts`.

---

### 3. Case Corpus Structure (Copilot Chat)

**Prompt used:**  
> "I'm designing a detective case where the player must catch a lie by comparing a witness statement against an electronic access log. What makes a believable planted contradiction in a document corpus? What documents do I need?"

Copilot outlined the document types needed (witness statements, security logs, forensic report, autopsy, phone records, motive document) and suggested the phone records should independently corroborate the security log contradiction — which led to the 20:18 call from Helena to Victor (while she was still in the gallery, per badge log) becoming a second corroborating evidence thread.

---

### 4. TypeScript MCP SDK Usage (Copilot Inline)

When scaffolding `server/src/index.ts`, Copilot inline suggestions completed:
- The `ListToolsRequestSchema` handler pattern
- The `CallToolRequestSchema` dispatch pattern
- The `StdioServerTransport` connection setup
- The tool `inputSchema` with `enum` constraint for character names

---

### 5. Responsible AI Framing (Copilot Chat)

**Prompt used:**  
> "My detective game uses an LLM to generate character dialogue after retrieval. What's the responsible way to frame the game so I don't claim it's 'hallucination-proof'?"

Copilot's response introduced the framing distinction: "characters may be unreliable narrators — the citations let you catch them." This phrase appears verbatim in the game's README and `load_case` tool description. Copilot also suggested the `INSUFFICIENT_EVIDENCE` state as the fail-closed response when retrieval returns nothing.

---

### 6. `.vscode/mcp.json` Configuration (Copilot Chat)

**Prompt used:**  
> "How do I register my local MCP server with GitHub Copilot in VS Code so it shows up in Copilot Chat agent mode?"

Copilot provided the correct `.vscode/mcp.json` structure including the `type: "stdio"` transport and the `inputs` array for user-provided env vars (Azure endpoint and key).

---

## Copilot Modes Used

| Mode | Used for |
|------|----------|
| Inline suggestions | Function bodies, TypeScript types, API call patterns |
| Copilot Chat | Architecture decisions, API research, responsible AI framing |
| Agent mode | _(planned for Day 2 — polishing and multi-file refactoring)_ |
| Plan mode | _(planned for Day 2 — breaking down web UI implementation)_ |
