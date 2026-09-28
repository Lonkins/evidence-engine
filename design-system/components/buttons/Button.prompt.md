The brass control of the interrogation desk — `primary` is the lit lamp (use once per view), `secondary`/`quiet` carry everything else, `danger` is oxblood and reserved for the accusation.

```jsx
<Button variant="primary" size="lg" onClick={openCase}>Step into the interrogation</Button>
<Button variant="secondary" glyph="◉">Pull the record</Button>
<Button variant="danger">Name the killer</Button>
<Button variant="quiet" size="sm">Offline demo · no keys</Button>
```

- **variant**: `primary` (brass gradient, black ink) · `secondary` (ghost hairline) · `danger` (oxblood) · `quiet` (text-only)
- **size**: `sm` · `md` · `lg`
- **glyph**: a leading unicode mark (◉ ✕ ✎ ●) — the brand's iconography is typographic, not an icon font
- Pass `href` to render as an anchor. Labels are sentence- or stencil-case depending on weight; primary CTAs run uppercase via the stencil tracking.
