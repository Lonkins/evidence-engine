# Evidence Engine — Noir Design System

> *"An AI witness lies to your face. Foundry IQ catches it live — it reads the case file, reasons over it, and hands back the verdict with a verbatim cited receipt."*

**Evidence Engine** is a citation-first detective game: you interrogate AI witnesses who drift and invent, and a knowledge base ("Foundry IQ") catches them in the act — returning `GROUNDED` / `CONTRADICTED` / `UNVERIFIABLE` with the deciding passage quoted verbatim. The flagship case is *The Holbrooke Gallery Affair*: a gallery owner found dead, three witnesses, one provable lie about when someone left.

This design system is a **1940s film-noir overhaul** of that product: an interrogation room lit by one brass lamp, aged case-file paper, typewritten receipts, and an inked verdict stamp as the signature gesture. Sleeker, less cluttered, more deliberate than the original — and built to be reused.

### Sources

- **GitHub:** [`Lonkins/evidence-engine`](https://github.com/Lonkins/evidence-engine) — the product this system reskins. The web app (`evidence-engine/web/`) and its token files (`src/styles/`) were the visual starting point; the corpus (`evidence-engine/corpus/`) supplied the case copy. Explore it to design new surfaces faithfully.

This system **evolves** the original palette and type rather than replacing it — it keeps the brass/oxblood/ink/bone bones and pushes them toward a cleaner, more cinematic noir, adding a third "stencil" voice (Oswald) for stamps and classified labels.

---

## Content fundamentals — how Evidence Engine writes

The voice is **hard-boiled detective fiction crossed with a responsible-AI disclosure**. It is confident, terse, and a little theatrical — but it never overclaims, because honesty *is* the product.

- **Person & address.** Second person to the player ("you interrogate one", "catch what it invents"). Witnesses speak first person, in scene ("It was an ordinary evening, Inspector, until it wasn't.").
- **Tone.** Noir gravity with dry wit. Short declaratives. Verbs do the work. Em-dashes for the turn. *"Pull the plug on Foundry IQ and the catch collapses — the witness's word stands."*
- **The honest grey is sacred.** Never dress up *unverifiable* as a catch. Copy says "the case file is silent", "absence is not contradiction", "you remain the judge". Verdicts are evidence-relative — "unsupported by the file", never "false" or "lying" as a finding of fact.
- **Casing.** Sentence case for prose. **Stencil UPPERCASE** (Oswald, wide tracking) for stamps, labels, case numbers, eyebrows. Titles in Playfair, with the key phrase in *italic brass* ("Put an AI *on the stand*").
- **Receipts language.** Technical lines are literal and monospaced: `20:47:33 | CARD_EXIT | HOLDER: Helena Voss (HV-0041)`. The engine tap tags every step `AZURE` / `MODEL` / `LOCAL` — the split is disclosed, not discovered.
- **No emoji.** Iconography is typographic (see below). British spelling in the case fiction (*"a quarter to eight"*, *colour*).

Specimen copy: *"Crack the witnesses: pin 2 more contradictions against the record."* · *"The evidence is silent on this point."* · *"Foundry IQ · medium effort · 10,155 reasoning tokens."*

---

## Visual foundations

**The premise:** one interrogation room, one overhead brass lamp, deep shadow, a film of grain. Every surface shares that single light source.

- **Colour.** Four disciplined pigments: **ink** (warm near-blacks, lamplit not screen-gray) for the room; **brass** (lamp-gold) as the *single* hero accent — the engine, the light, the verified verdict; **oxblood** (dried-blood crimson) reserved strictly for the *catch* and danger, used sparingly; **bone** (aged stock) only for physical evidence — receipts and citation slips. Two quiet verdict signals: **evergreen** (grounded) and **slate** (the honest unverifiable). See `tokens/colors.css`.
- **Type.** Three voices: **Playfair Display** (editorial headlines, narrator, witness testimony — italics carry the noir), **Oswald** (the stencil/poster condensed gothic — stamps, classified labels, case numbers, eyebrows), **Special Elite** (the typewriter — receipts, evidence tags, the engine-tap teletype). Body is deliberately small; headlines and stamps carry the page. See `tokens/typography.css`.
- **Backgrounds & texture.** Never flat. The `.atmosphere` layer is one radial **keylight** cone from top-centre + a deep **vignette** + low-opacity **film grain**. Aged paper carries a newsprint **halftone** dot screen. Dark surfaces can be raked by **venetian blinds** (`--blinds`, `mix-blend-mode: multiply`) — the window behind the desk. No purple gradients, no glassmorphism.
- **Lighting as state.** Surfaces are lit along the top edge (`--surface-lit-top`) like a card sitting under the lamp. The selected witness glows brass; a witness caught in a lie warms toward oxblood (the portrait's shadow side literally reddens as `pressure` rises).
- **Corners & borders.** Hard-ish. Radii are small (2–8px) — this is paper and brass, not glass. The one exception is the status dot / mode toggle (pill). Borders are brass hairlines (`--line`, `--line-strong`); the verdict accent is a 3px left edge.
- **Shadows.** Warm, lamplit, layered: `--shadow-stamped` (a pinned receipt on the desk), `--shadow-brass-glow` (the lit CTA), `--shadow-pop` (modals). A faint inset top-highlight (`rgba(255,235,190,…)`) reads as the lamp catching an edge.
- **Motion.** Restrained. A **stamp punches** (overshoot + settle, `--ease-stamp`); testimony and receipts **type on** (`type-reveal`, a left-to-right clip); everything else **rises and fades** (`rise-in`, `--ease-out`). No infinite decorative loops. All gated behind `prefers-reduced-motion`.
- **Hover / press.** Hover lifts (`translateY(-2px)`) and warms the border toward brass; primary press settles back to baseline. Danger hover floods oxblood. Quiet controls just brighten their text.
- **Imagery.** Suspects are drawn, not photographed — stylised, split-lit noir busts (one bright lamp side, one shadow side). The vibe is warm, high-contrast, single-source — chiaroscuro, not colour photography.

---

## Iconography

Evidence Engine's icon language is **typographic, not an icon font** — and the system keeps it that way deliberately, because it reads as teletype and case-file stamps.

- **Unicode glyphs as marks.** The engine tap uses a small fixed vocabulary: `◉` retrieve · `▲` index upload · `▣` lookup · `≡` scan/check · `✎` model turn · `✕` contradicted/delete · `●` grounded · `—` unverifiable · `›` press hint · `✦` pressure flag. Use these, set in the stencil or typewriter face. The `TraceLine` component derives its glyph from the step name.
- **The seal & wordmark.** `assets/logo-seal.svg` is the brand emblem: a deco octagon "case seal" holding a pendant **interrogation lamp** casting a beam onto a stamped document — the whole product in one mark (light reveals; the verdict is stamped in oxblood). `assets/logo-wordmark.svg` is the horizontal lockup: EVIDENCE in stencil caps over *Engine* in Playfair italic — the two-voice signature.
- **No emoji, no third-party icon set.** If a future surface genuinely needs UI icons (a close ✕, a chevron), prefer a unicode glyph or a hairline SVG drawn in brass at the same stroke weight as the seal. Do **not** introduce Lucide/Heroicons/etc. — they break the typewriter-and-stamp world.
- **The stamp is the hero "icon".** The inked, rotated verdict impression (`Stamp` component) is the most important mark in the system. Punch it; don't decorate around it.

---

## What's in here — index

**Foundations** (`styles.css` → `tokens/`)
- `styles.css` — the single entry point consumers link; nothing but `@import`s.
- `tokens/colors.css` · `typography.css` · `spacing.css` · `effects.css` (keylight, grain, halftone, blinds, shadows, motion) · `fonts.css` (self-hosted `@font-face`, binaries in `tokens/fonts/`) · `base.css` (reset, `.atmosphere`, utilities, keyframes).

**Components** (`components/<group>/`) — React primitives, each with `.jsx` + `.d.ts` + `.prompt.md` + a card:
- `buttons/` — **Button** (primary / secondary / danger / quiet)
- `feedback/` — **Stamp** (the verdict impression), **Badge** (stencil status chip)
- `evidence/` — **CitationSlip** (the paper receipt), **ClaimChip** (challengeable claim)
- `roster/` — **SuspectCard**, **SuspectPortrait** (the split-lit busts)
- `forms/` — **Input** (case-file field / intake textarea)
- `engine/` — **TraceLine** (the wiretap teletype line)

**UI kit** (`ui_kits/evidence-engine/`)
- `index.html` — the full interactive interrogation desk: title screen → witnesses → testimony with pressable claims → cited verdicts with stamps → engine tap → accusation. Composes the design-system classes and tokens.

**Brand** (`assets/`) — `logo-seal.svg`, `logo-wordmark.svg`, brand card.

**Specimen cards** (`guidelines/`, `assets/brand.card.html`) — every `@dsCard`-tagged HTML renders in the Design System tab (Colors · Type · Spacing · Brand · Components · Evidence Engine).

**`SKILL.md`** — makes this system usable as a downloadable Claude Code skill.

---

## Notes & substitutions

- **Fonts are self-hosted** — the three families ship as `.woff2` binaries in `tokens/fonts/` (28 files, ~805 KB: Playfair Display 400–900 + italics, Oswald 300–700, Special Elite 400), declared as local `@font-face` rules in `tokens/fonts.css` with `unicode-range` gating so `latin-ext` only downloads when an extended glyph is used. No CDN dependency — the system renders fully offline. *(Source: pulled from Google Fonts, which serves these under the SIL Open Font License.)*
- **Oswald is a deliberate addition** — the original app shipped only Playfair Display + Special Elite. The stencil/poster voice (stamps, classified labels, case numbers) is new to this noir overhaul. Drop it from `fonts.css` + `tokens/typography.css` (`--font-stencil`) if you want to stay strictly two-voiced.
