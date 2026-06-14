# The Holbrooke Gallery Affair — Web Experience

The hosted player experience for the Evidence Engine. The MCP server (../server)
remains the GitHub Copilot Chat way to play; this app is the experience the game
deserves on a screen — a noir detective desk where citations are first-class
visual objects.

> **This is the offline, no-keys fallback surface.** The hero experience is now the
> **live interrogation** (Act II + `../live-server`), where a live model plays the
> witnesses and Foundry IQ returns each verdict against the case file — plus **Bring
> your own trial**, where it checks claims against *your* pasted source. This scripted
> desk is the zero-setup path judges can play without provisioning Azure.

## The interaction model

This is deliberately **not** a chat transcript with footnotes:

- **Suspect rail** — three drawn noir portraits. Contradictions caught against a
  suspect tighten the lighting on their portrait and flag their card.
- **Testimony with pressable claims** — answers arrive laced with claim chips.
  Press one and the engine checks it against the case file and stamps a verdict
  inline: **VERIFIED**, **CONTRADICTED**, or **NO RECORD**, with the cited
  passages rendered as paper slips you can open full-page.
- **Evidence board** — fifteen slots that fill in as citations surface
  documents. Documents that contradict testimony are pinned hot (red).
- **Sealed lines of questioning** — some questions only unlock once the
  document that motivates them is on the board (you can't ask Helena about the
  20:47 badge exit until you have the access log).
- **Consult the archive** — free-text retrieval over the corpus. A miss is the
  designed fail-closed beat: a NO RECORD plate that says *"the evidence is
  silent on this point"* — a refusal to invent, not an error.
- **The accusation** — a full-screen set-piece: name the killer, attach the
  exhibits that convict, and wait for the stamp to come down. The win condition
  mirrors the MCP server exactly (right suspect + the security log + the
  provenance email).

## Mechanical consistency with the MCP server

- The fifteen-document corpus is imported **verbatim** from `../corpus` at
  build time — one source of truth shared with the Foundry IQ index.
- `src/engine/accusation.ts` mirrors `../server/src/case-store.ts`
  (same correct suspect, same required evidence keys).
- `src/engine/retrieval.ts` is the server's local retrieval model with
  IDF weighting so out-of-corpus queries fail closed.
- Every authored citation quote is verified **verbatim against the corpus** by
  `src/data/caseData.test.ts` — a citation in this game is never invented.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 42 unit tests (engine + case-data integrity)
npm run build      # static site in dist/ — typechecks first
```

The build is fully static (`base: './'`): host `dist/` on GitHub Pages, Azure
Static Web Apps, or any file server. No keys, no backend, no PII — the corpus
is synthetic and ships with the bundle.

## Structure

```
web/
├── src/
│   ├── data/          # corpus import + authored interrogation script
│   ├── engine/        # retrieval, verdicts, accusation rules, game reducer
│   ├── components/    # header / suspects / interrogation / evidence / accusation
│   └── styles/        # design tokens (noir palette, type, motion) + global
└── index.html
```
