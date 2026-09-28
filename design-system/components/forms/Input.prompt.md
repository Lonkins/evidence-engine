A case-file form line — stencil label, typewriter value, ink-well field, brass focus.

```jsx
<Input label="Question for the witness" placeholder="When did you leave?" />
<Input as="textarea" rows={5} label="Paste your source"
       hint="Demo-safe text only — no personal or confidential material." />
```

- **as**: `input` (default) or `textarea` for the bring-your-own intake.
- **label** renders in stencil caps; **hint** in typewriter beneath the field.
- Inherits all native input/textarea attributes (placeholder, value, onChange, rows…).
