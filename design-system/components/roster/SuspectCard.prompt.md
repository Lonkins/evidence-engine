A booking card for the witness rail — split-lit noir mug, name, role, hook.

```jsx
<SuspectCard
  name="Helena Voss" role="Head Curator" who="curator"
  hook="Seven years at Victor's right hand. First to call the solicitors."
  active pressured pressure={0.6}
  onSelect={() => select("helena")}
/>
```

- **who**: `curator` · `assessor` · `collector` (the three built-in busts). For a bring-your-own witness, omit `who` and pass `initial="K"`.
- **pressure** (0–1) warms the portrait's shadow side toward oxblood as contradictions stack up.
- `active` = selected; `pressured` = caught in a lie (oxblood edge).
