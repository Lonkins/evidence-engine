---
name: competition-context
description: Full Creative Apps track challenge requirements, judging criteria, and allowed technologies
metadata:
  type: reference
---

## Track: Creative Apps with GitHub Copilot

**Event:** Agents League Hackathon — Battle #1  
**Challenge:** Build innovative creative applications using AI-assisted development with GitHub Copilot and VS Code.  
**232 projects** already linked to this challenge (as of June 10, 2026).

---

## Core Requirements (All Three Mandatory)

### 1. GitHub Copilot Usage
Must demonstrate meaningful use during development:
- Using Copilot suggestions to accelerate code writing
- Leveraging Copilot Chat for problem-solving, debugging, or explanation
- Documenting how Copilot assisted in the creative process

### 2. Microsoft IQ Integration
Must integrate at least one IQ layer:
- **Foundry IQ** — Agentic knowledge retrieval for AI agents. Connects enterprise sources, enforces permissions, delivers cited grounded answers.
- **Work IQ** — Intelligence layer behind M365 Copilot. Memory from emails, meetings, chats, documents.
- **Fabric IQ** — Semantic layer for Microsoft Fabric. Ontologies and knowledge graphs for business meaning over enterprise data.

### 3. Creative Application
Must be a creative application that:
- Demonstrates a unique or novel concept
- Provides value, entertainment, or utility to users
- Shows thoughtful design in user experience

---

## Project Categories (Inspiration)

| Category | Example Ideas |
|----------|--------------|
| Content Generation | Story generator, script writer, music composer |
| Visual Creativity | Design assistant, logo generator, generative art |
| Game Development | Puzzle generator, game asset creator, interactive fiction |
| Creative Productivity | Content remixer, idea brainstormer |
| Interactive Experiences | Character chatbot, educational game |

**All application types welcome:** web, CLI, game, mobile, desktop, VR/AR, embedded.

---

## High-Value Differentiators (Explicitly Called Out in Challenge Brief)

> 💡 Build for GitHub Copilot: Consider building MCP servers that integrate directly with GitHub Copilot in VS Code or Copilot CLI! Your MCP server can expose tools and data sources that Copilot can use during chat conversations, making your solution available to developers right where they work.

**Key insight:** An MCP server for GitHub Copilot in VS Code is the most differentiated submission type. It turns a standalone app into infrastructure developers use in their workflow.

---

## Copilot Modes Available to Demonstrate

| Mode | What It Does | Demo Angle |
|------|-------------|------------|
| Inline suggestions | Code autocomplete as you type | Show in coding demo |
| Copilot Chat | Natural language Q&A and code generation | Show problem-solving |
| Agent Mode | Autonomous multi-file task execution | Show complex feature build |
| Plan Mode | Break down complex tasks | Show architecture planning |
| Edit Mode | Targeted code modification | Show refactoring |

---

## Security Constraints

Same as Enterprise Agents track — see `../../CLAUDE.md`.

---

## Discord Channel

Questions and community vote: `#creative-apps` on the Agents League Discord.

---

## Resources

- GitHub Copilot docs: `https://docs.github.com/en/copilot`
- MCP in VS Code: `https://code.visualstudio.com/docs/copilot/chat/mcp-servers`
- Microsoft IQ Series: linked in challenge brief
