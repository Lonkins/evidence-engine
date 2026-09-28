A challengeable claim inside witness testimony. Unpressed, it's a dashed brass underline; pressed, it takes the verdict colour.

```jsx
{/* before challenge */}
<ClaimChip onPress={check}>I locked the gallery at a quarter to eight.</ClaimChip>

{/* after the engine returns a verdict */}
<ClaimChip pressed verdict="contradicted" glyph="✕">
  I locked the gallery at a quarter to eight.
</ClaimChip>
```

- **verdict**: `supported` (evergreen) · `contradicted` (oxblood, struck through) · `unsupported` (slate, dotted)
- Wrap claims inline within a paragraph of testimony — they flow with the text, they are not block buttons.
