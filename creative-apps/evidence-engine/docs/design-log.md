# Design Log — Evidence Engine

Iterative design decisions, with the reasoning that produced them. Each entry
follows the mandatory four-persona protocol from the track `CLAUDE.md`:
decisions are made after reading all four critical analyses; the Prize
Strategist breaks ties.

---

## Entry 2 — June 12, 2026: Judging-led redesign of Live Wire

### Problem statement

The Live Wire flow was unintuitive: players chatted with suspects and clicked
sentence chips "almost at random" hoping something would happen. The thesis of
the entry — *people increasingly rely on LLMs that hallucinate; live
retrieval-grounded verification makes the drift catchable* — did not land
without explanation. With ~2 days to the deadline, we needed the changes that
maximize judging score (Technical Excellence · Creative Innovation · GitHub
Copilot Integration · Microsoft IQ Integration · User Experience · ~10%
community vote), not the most complete redesign.

### Persona findings (June 12)

**P1 — Skeptical Microsoft Engineer** (read the actual code):
- *Blocking:* every UNSUPPORTED challenge scored as `hallucinationsCaught`.
  Fail-closed retrieval means off-script claims usually retrieve nothing, so
  the dominant strategy is "challenge everything" — the planned objective
  system would make this exploit the objective. Fix scoring before any UX.
- Verdicts are local heuristics presented beside Azure calls; tag the
  pipeline honestly (`azure` vs `heuristic`) or judges write it up as
  "IQ-adjacent, not IQ-driven".
- Make hallucinations ground-truthed: plant known fabrications via the
  witness prompt, log them server-side, score against planted truth —
  converts "our regex thinks it's wrong" into "it provably was fabricated".
- Demo resilience: no retry on GitHub Models 429; witnesses sometimes say
  "around eight in the evening" which the HH:MM temporal engine can't parse.
- Least-privilege: retrieves use the admin key; a query key would do.

**P2 — Competing Team:**
- The biggest exposure is not UX — it's that 90% of judging is a 3-minute
  video + README skim, and the kill-shot moment (live CONTRADICTED stamp with
  verbatim passage) is buried behind a free-chat mode.
- Replace the planned tutorial with a **scripted/guided opening
  interrogation** (~6h) instead of a general onboarding redesign (~2 days).
- Copilot-usage receipts in the README (required category), a 2-minute judge
  path (hosted link first line), verify MCP surface parity, engineered
  Discord drop.

**P3 — Conservative Responsible AI Judge:**
- *Blocking (independently matches P1):* UNSUPPORTED must never score as a
  caught hallucination — that conflates *unverifiable* with *false*, the
  exact error the entry teaches against. Score it separately as "flagged
  unverifiable".
- Tutorial must scope the claim: the engine detects *contradictions against
  this case file*, not hallucinations in general.
- Grounding indicators must show retrieval state (passage counts), never an
  aggregate trust meter.
- The final report must carry verbatim citations per finding and an explicit
  miss-rate caveat (paraphrased and time-free contradictions go undetected).
- Strongest available credibility signal: demo a deliberate fail-closed on a
  TRUE claim.

**P4 — Prize Strategist (tiebreaker):**
- Highest-risk gap: **no demo video** (+15–20pp). Then public hosting
  (+5–8pp), COPILOT_USAGE update (+3–5pp), README hero GIF (+3–4pp),
  *minimum* UX fix = objective system + scorecard only (+3–5pp, do BEFORE
  recording), Discord post (+2–3pp).
- CUT: full onboarding narrative, confront mechanic, grounding meters, any
  engine refactoring, further HANDOFF polish.
- Non-negotiable: submit complete by mid-afternoon June 14 even if rough.

### Decision (consensus + tiebreak)

Build order for the remaining time:

1. **Scoring semantics fix** (P1+P3 convergent, prerequisite): catches =
   CONTRADICTED / SELF_CONTRADICTION only; UNSUPPORTED → separate
   `flaggedUnverifiable` tally ("the file is silent — no collar"); false
   objections remain a visible cost.
2. **Ground-truthed planted fabrications** (P1): each suspect's prompt plants
   specific fabricated details carrying HH:MM times; the server logs the
   plants per session and the final report reveals "plants caught N/M" —
   un-gameable scoring with provable fabrications.
3. **Demo resilience** (P1): witnesses instructed to state times in HH:MM;
   retry/backoff on GitHub Models 429/5xx.
4. **Guided first beat + objective** (P2 scoped by P4): objective banner
   ("crack the witness"), first-reply challenge hint, scorecard relabel.
   NOT a full tutorial.
5. **Wiretap honesty tags** (P1+P3): every trace line tagged
   `azure` / `model` / `heuristic`; the verdict-heuristic step appears as its
   own disclosed line.
6. **Honest framing copy** (P3): scope line in the Live Wire disclosure;
   miss-rate caveat in the interrogation report.
7. **Submission surfaces** (P2+P4): README judge quickstart, COPILOT_USAGE
   Live Wire log, demo-script rewritten around the kill shot, Discord draft.
   Video recording, public hosting, and posting are human-gated.

**Cut** (P4 ruling): full onboarding narrative, player-driven confront
mechanic, per-turn trust meters, admin→query key split (logged in HANDOFF as
a known improvement), threshold recalibration, refactors.

### Why this maximizes score

- *Microsoft IQ Integration:* the wiretap origin tags + ground-truthed plants
  make the live Foundry IQ role checkable and honestly bounded — the
  difference between "IQ-driven" and "IQ-adjacent" in a reviewer's writeup.
- *User Experience:* the guided first beat + objective converts random
  clicking into a legible loop (ask → suspect drifts → challenge → stamped
  proof) within the first minute of play.
- *Technical Excellence:* un-gameable scoring closes the exploit a hands-on
  judge finds in 30 seconds.
- *Creative Innovation:* "the witnesses provably lied — you caught 2 of 3
  plants" is a stronger story than "the heuristic disagreed".
- *Copilot Integration / community vote:* receipts + engineered Discord drop
  are cheap, required-category points.

### Implementation outcome (same day)

All seven build-order items shipped and verified against the live KB + in-browser
at 1440px:

- Scoring: `contradictionsPinned` / `selfContradictionsExposed` are the only
  catches; `flaggedUnverifiable` tracked separately; false objections cost.
  Verified the "challenge everything" exploit is dead (an ungrounded claim now
  reads "file silent — no collar").
- Plants: 3 planted fabrications (one per suspect, each with an HH:MM time).
  Live run pinned Helena's 19:45 plant → FABRICATION CONFIRMED ribbon + report
  "plants pinned 1 of 3".
- Found + fixed during verification: a generic stopword ("that") could link a
  claim to an unrelated negation sentence and manufacture a CONTRADICTED —
  added a stopword set to the claim-term gate (verdict.ts). This is exactly
  the class of brittleness P1 predicted; the fix is logged here for honesty.
- Engine tap now tags every line AZURE / MODEL / LOCAL, and the two verdict
  heuristic steps appear as their own disclosed LOCAL lines.
- Guided first beat: coach line + breathing chips until the first challenge
  lands; objective banner counts down "pin 3 contradictions".
- Report carries plants line, six honest tiles, and the bounded-checks caveat.

Remaining human-gated items: record v2 kill-shot video (docs/demo-script.md),
host web build, post Discord Template 4, capture real Copilot receipts
(COPILOT_USAGE.md checklist), git push.

---

## Entry 1 — June 11, 2026: WP9 Live Interrogation (retrospective)

Decision: add an open free-form chat mode ("Live Wire") where Foundry IQ is
in the loop on every turn, with drift allowed by design; keep the static
Case File mode untouched as the offline judge path. Architecture: one shared
index partitioned by `doc_type`/`case_id`/`session_id` filters; thin Node
backend holding the two secrets; claim-calibrated fail-closed thresholds
(question 3.5 / declarative claim 2.0 / testimony 1.0, measured live);
sentence-level verdict gating. Verified end-to-end against the live KB;
sanitized proof in `live-mode-proof.json`. Rationale and calibration tables:
see `HANDOFF.md` (WP9) and `README.md`.
