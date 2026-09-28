The inked verdict impression — the signature gesture. Punch it onto a claim or a slip when the engine returns a verdict.

```jsx
<Stamp tone="contradicted">Contradicted</Stamp>
<Stamp tone="grounded" rotate={-3}>Verified</Stamp>
<Stamp tone="silent" size="sm">No record</Stamp>
```

- **tone**: `contradicted` (oxblood) · `grounded` (evergreen) · `silent` (slate) · `brass`
- **rotate**: override the default jitter for organic variety across multiple stamps
- **animated**: the stamp overshoots and settles on mount; set `false` for static specimens
- Pair with `Badge` for the quieter inline tags (AZURE / MODEL / LOCAL, doc kinds).
