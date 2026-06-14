---
name: evidence-engine-design
description: Use this skill to generate well-branded interfaces and assets for Evidence Engine — the citation-first noir detective game where AI witnesses lie and Foundry IQ catches them — either for production or throwaway prototypes/mocks. Contains the 1940s film-noir design guidelines, colors, type, fonts, brand assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files — `styles.css` (the single CSS entry point), the `tokens/` foundations, the `components/` primitives (each with a `.prompt.md`), the `ui_kits/evidence-engine/` interrogation desk, and the brand `assets/`.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc.), copy assets out and create static HTML files for the user to view: link `styles.css`, drop a `<div class="atmosphere" aria-hidden="true"></div>` at the root, and use the design-system CSS classes (`.ee-btn`, `.ee-stamp`, `.ee-slip`, `.ee-claim`, `.ee-suspect`, `.ee-trace`) and tokens. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

Core of the brand to honour:
- **One brass lamp.** Warm ink room, single keylight + vignette + grain. Brass is the only hero accent; oxblood is reserved for the *catch* and danger; bone paper is only for physical evidence (receipts/citations).
- **Three voices.** Playfair Display (headlines, testimony — italics carry the noir), Oswald (stencil stamps, classified labels, case numbers), Special Elite (typewriter receipts and the engine tap).
- **The stamp is the hero gesture.** The inked, rotated verdict impression. The honest grey (`unverifiable`) is sacred — never dress it up as a catch.
- **Typographic iconography** (unicode glyphs ◉ ▲ ✎ ✕ ● —), never emoji or a third-party icon set.

If the user invokes this skill without other guidance, ask them what they want to build or design, ask a few focused questions, and act as an expert designer who outputs HTML artifacts *or* production code, depending on the need.
