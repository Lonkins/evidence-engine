One line of the engine wiretap teletype — the live retrieval layer made visible. Render lines inside an `<ol class="ee-trace-log">`.

```jsx
<ol className="ee-trace-log">
  <TraceLine origin="azure" step="kb.retrieve(evidence)" method="POST" latencyMs={412} status={200}
             detail="…CARD_EXIT 20:47:33 HOLDER: Helena Voss" target="evidence-kb" />
  <TraceLine origin="model" step="llm.witness.turn" latencyMs={1140} status={200} />
  <TraceLine origin="azure" step="index.upload(testimony)" latencyMs={88} status={201} />
</ol>
```

- **origin**: `azure` (live Foundry IQ) · `model` (witness LLM turn) · `local` (deterministic cross-check)
- A `status` of 400+ paints the whole line oxblood. The glyph is derived from `step`.
