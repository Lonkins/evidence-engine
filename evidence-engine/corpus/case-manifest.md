# Case Corpus Manifest — The Holbrooke Gallery Affair

**Case ID:** HGA-2025-1014  
**Authorship:** Fully synthetic — all names, locations, incidents, and persons are fictitious. No real crimes, real people, or real locations are referenced.  
**Human-reviewed:** Yes (all documents authored and curated; no scraped or third-party content)  
**Responsible AI note:** The planted contradiction is a deliberate game mechanic. The corpus is designed so that grounded retrieval surfaces the contradiction — making citation integrity the win condition, not an afterthought.

---

## Document Index

| File | Type | Key Content |
|------|------|-------------|
| `01-case-overview.md` | Case summary | Incident description, timeline, key personnel |
| `02-victim-profile.md` | Background | Victor Holt — gallery owner, victim |
| `03-character-helena.md` | Character file | Helena Voss — curator, primary suspect |
| `04-character-felix.md` | Character file | Felix Drummond — insurance assessor, witness |
| `05-character-nora.md` | Character file | Nora Ashton — collector, peripheral witness |
| `06-helena-statement.md` | Witness statement | Helena's account of the evening ← **CONTAINS PLANTED LIE** |
| `07-felix-statement.md` | Witness statement | Felix's account of the evening |
| `08-nora-statement.md` | Witness statement | Nora's account |
| `09-security-log.md` | Technical record | Electronic badge access log ← **CONTRADICTS helena-statement** |
| `10-forensic-report.md` | Forensic analysis | Scene examination, physical evidence |
| `11-autopsy-report.md` | Medical record | Time of death, cause of death |
| `12-gallery-inventory.md` | Business record | Asset inventory including disputed painting |
| `13-phone-records.md` | Technical record | Call logs for Helena, Felix, Nora on Oct 14 |
| `14-provenance-dispute.md` | Business record | Victor's draft email re: forged provenance ← **ESTABLISHES MOTIVE** |
| `15-detective-notes.md` | Investigator notes | DI Sullivan's initial assessment (neutral framing) |

---

## The Planted Contradiction

**Source A:** `06-helena-statement.md`  
> "I locked the gallery at approximately 7:45 in the evening and handed the door key to Mr Drummond, as he had requested an additional thirty minutes to complete his paperwork."

**Source B:** `09-security-log.md`  
> `2025-10-14 20:47:33 | CARD_EXIT | READER_01_MAIN_DOOR | HOLDER: Helena Voss (HV-0041) | STATUS: VALID`

Helena states she left at 7:45pm (19:45). The badge exit log records her leaving at 20:47 — over an hour later. Victor's time of death falls between 20:30 and 21:15. Helena was physically present during that window.

---

## Responsible AI Notes for Builders

- The citation integrity check must fetch referenced documents by `docKey` and verify the passage exists — never trust LLM-emitted citation strings.
- The `check_claim` tool must surface the security log in response to queries about Helena's departure time. If it does not, the core game mechanic fails.
- Out-of-corpus queries (e.g. "who is the gallery's landlord?") should return a graceful refusal: "The evidence file is silent on this point."
- Characters may synthesise misleading dialogue even when the grounding is honest — the citations are what the player uses to catch the lie, not the dialogue itself.
