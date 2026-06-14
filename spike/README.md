# Spike — Foundry IQ Provisioning Trail

This directory is the complete, reproducible provisioning path for the Azure AI
Search (Foundry IQ) layer behind Evidence Engine — plus the **committed raw
artifacts proving every stage passed** against the live service on June 10, 2026.

## Judge in 60 seconds (nothing to run)

| What | Where |
|------|-------|
| Stage-by-stage run log, all PASS | [`SPIKE_LOG.md`](SPIKE_LOG.md) |
| Raw agentic retrieval response from the live KB (timestamped, rerankerScore 3.9889) | [`output/04-retrieve-incorpus.json`](output/04-retrieve-incorpus.json) |
| Fail-closed calibration: out-of-corpus query → `references: []` | [`output/04-retrieve-outcorpus.json`](output/04-retrieve-outcorpus.json) |
| KB's native MCP endpoint answering (SSE, protocolVersion 2024-11-05) | [`output/05-mcp-kb-scoped.json`](output/05-mcp-kb-scoped.json) |
| Headline evidence-of-pass artifact | [`evidence-of-pass.json`](evidence-of-pass.json) |
| End-to-end live game-loop trace (later, June 11) | [`../evidence-engine/docs/live-mode-proof.json`](../evidence-engine/docs/live-mode-proof.json) |

The `@odata.context` URLs inside the artifacts name the live service
(`evidence-engine-search.search.windows.net`) and API version
(`2026-05-01-preview`) — they are raw responses, not hand-written fixtures.

## Reproducing from scratch (~10 min, free tier, $0)

Each stage is one script. Run them in order; every script writes its raw
response into `output/`.

```bash
./00-check-login.sh      # az login sanity check
./01-provision.sh        # resource group + free-tier search service; admin key → .env (gitignored)
./02-create-index.sh     # 'evidence' index + smoke-test docs
./03-create-kb.sh        # knowledge source 'evidence-ks' + knowledge base 'evidence-kb'
./04-retrieve.sh         # verify agentic retrieval with citations (in- and out-of-corpus)
./05-mcp-probe.sh        # probe the KB's native MCP endpoint
./06-index-corpus.sh     # index the real 15-document gallery case corpus
./07-add-live-fields.sh  # additive schema migration for Act II live testimony partition
```

Credentials land in `spike/.env` (gitignored — never committed). Copy them into
`../evidence-engine/server/.env` and `../evidence-engine/live-server/.env` to
switch both servers from local fallback to live Foundry IQ.

## API shape discoveries

`SPIKE_LOG.md` documents every non-obvious `2026-05-01-preview` API shape we had
to discover by probing (`intents` vs `messages`, `searchIndexParameters`
discriminator, `retrievalReasoningEffort` object form, …). If you are building
against Foundry IQ knowledge bases on the free tier, that file is the map.
