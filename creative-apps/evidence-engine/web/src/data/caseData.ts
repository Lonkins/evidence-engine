import type { Claim, DocMeta, Question, Suspect } from "../engine/types";

// ---------------------------------------------------------------------------
// Suspects
// ---------------------------------------------------------------------------

export const SUSPECTS: Suspect[] = [
  {
    id: "helena",
    name: "Helena Voss",
    role: "Head Curator",
    hook: "Seven years at Victor's right hand. First to call the solicitors.",
    dossierDocKey: "03-character-helena.md",
    statementDocKey: "06-helena-statement.md",
  },
  {
    id: "felix",
    name: "Felix Drummond",
    role: "Insurance Assessor",
    hook: "Found the body. Has the cleanest timeline in the file.",
    dossierDocKey: "04-character-felix.md",
    statementDocKey: "07-felix-statement.md",
  },
  {
    id: "nora",
    name: "Nora Ashton",
    role: "Private Collector",
    hook: "Was “in the neighbourhood”. Didn’t mention stopping outside.",
    dossierDocKey: "05-character-nora.md",
    statementDocKey: "08-nora-statement.md",
  },
];

// ---------------------------------------------------------------------------
// Document index
// ---------------------------------------------------------------------------

export const DOC_INDEX: DocMeta[] = [
  { docKey: "01-case-overview.md", title: "Case Overview", kind: "case file" },
  { docKey: "02-victim-profile.md", title: "Victim Profile — Victor Holt", kind: "case file" },
  { docKey: "03-character-helena.md", title: "Character File — Helena Voss", kind: "case file" },
  { docKey: "04-character-felix.md", title: "Character File — Felix Drummond", kind: "case file" },
  { docKey: "05-character-nora.md", title: "Character File — Nora Ashton", kind: "case file" },
  { docKey: "06-helena-statement.md", title: "Witness Statement — H. Voss", kind: "statement" },
  { docKey: "07-felix-statement.md", title: "Witness Statement — F. Drummond", kind: "statement" },
  { docKey: "08-nora-statement.md", title: "Witness Statement — N. Ashton", kind: "statement" },
  { docKey: "09-security-log.md", title: "Electronic Access Log", kind: "technical record" },
  { docKey: "10-forensic-report.md", title: "Forensic Scene Examination", kind: "forensic" },
  { docKey: "11-autopsy-report.md", title: "Post-Mortem Summary", kind: "medical" },
  { docKey: "12-gallery-inventory.md", title: "Gallery Inventory Extract", kind: "business record" },
  { docKey: "13-phone-records.md", title: "Mobile Phone Records", kind: "technical record" },
  { docKey: "14-provenance-dispute.md", title: "Draft Email — Provenance Fraud", kind: "business record" },
  { docKey: "15-detective-notes.md", title: "DI Sullivan — Case Notes", kind: "investigator notes" },
];

export const DOC_META_BY_KEY: Record<string, DocMeta> = Object.fromEntries(
  DOC_INDEX.map((meta) => [meta.docKey, meta])
);

// ---------------------------------------------------------------------------
// Interrogation script
//
// Every claim verdict is anchored to verbatim passages from the shared case
// corpus — the same fifteen documents the MCP server retrieves from. The
// planted lie (Helena's departure time) is CONTRADICTED by the badge log.
// ---------------------------------------------------------------------------

const text = (t: string) => ({ kind: "text", text: t }) as const;
const claim = (c: Claim) => ({ kind: "claim", claim: c }) as const;

export const QUESTIONS: Question[] = [
  // ----- Helena Voss ------------------------------------------------------
  {
    id: "q-h1",
    suspectId: "helena",
    label: "Walk me through your movements that evening.",
    answer: [
      text(
        "Helena folds her hands. “It was an ordinary evening, Inspector, until it wasn’t. "
      ),
      claim({
        id: "c-h-felix-arrival",
        text: "Mr Drummond arrived shortly after five for his appraisal appointment.",
        verdict: "SUPPORTED",
        citations: [
          {
            docKey: "09-security-log.md",
            quote:
              "2025-10-14 17:02:08 | CARD_ENTRY | READER_01_MAIN_DOOR | HOLDER: Felix Drummond (VISITOR-014) | STATUS: VALID (temporary day pass)",
          },
        ],
        note: "The badge log records Drummond entering at 17:02 on a temporary day pass. This detail checks out.",
      }),
      text(" I showed him the collection, Victor spoke with me briefly, and "),
      claim({
        id: "c-h-departure",
        text: "I locked the gallery at a quarter to eight and handed the door key to Mr Drummond.",
        verdict: "CONTRADICTED",
        citations: [
          {
            docKey: "06-helena-statement.md",
            quote:
              "I locked the gallery at approximately a quarter to eight in the evening and handed the door key to Mr Drummond, as he had requested an additional thirty minutes to complete his paperwork.",
          },
          {
            docKey: "09-security-log.md",
            quote:
              "2025-10-14 20:47:33 | CARD_EXIT | READER_01_MAIN_DOOR | HOLDER: Helena Voss (HV-0041) | STATUS: VALID",
          },
        ],
        note: "Her signed statement repeats the 19:45 departure — but the access log records her card exiting the main door at 20:47:33, more than an hour later, inside the estimated time-of-death window (20:30–21:15).",
      }),
      text(" After that, "),
      claim({
        id: "c-h-walk-home",
        text: "I walked to the Underground and took the train home.",
        verdict: "UNSUPPORTED",
        citations: [],
        note: "The evidence file is silent on this point. No travel record for Voss — Oyster, CCTV, or otherwise — appears anywhere in the case file. Her route home can be neither confirmed nor refuted.",
      }),
      text(" and "),
      claim({
        id: "c-h-home-by",
        text: "I was at home in Belsize Avenue by approximately quarter past eight.",
        verdict: "CONTRADICTED",
        citations: [
          {
            docKey: "09-security-log.md",
            quote:
              "2025-10-14 20:47:33 | CARD_EXIT | READER_01_MAIN_DOOR | HOLDER: Helena Voss (HV-0041) | STATUS: VALID",
          },
          {
            docKey: "13-phone-records.md",
            quote:
              "However, the security log records her exit from the gallery at 20:47 — 29 minutes after the connected call ended. These two facts are irreconcilable unless Helena was at the gallery when she made those calls to Victor from her own mobile.",
          },
        ],
        note: "She cannot have been home by 20:15: her badge left the gallery at 20:47, and the telecoms analyst flags her 20:18 call to Victor as irreconcilable with her stated whereabouts.",
      }),
      text("” She holds your gaze a moment too long."),
    ],
  },
  {
    id: "q-h2",
    suspectId: "helena",
    label: "What did you and Victor discuss in his office?",
    answer: [
      text("A small, practised shrug. “"),
      claim({
        id: "c-h-admin",
        text: "The conversation was about routine gallery administration. Nothing significant was discussed.",
        verdict: "CONTRADICTED",
        citations: [
          {
            docKey: "14-provenance-dispute.md",
            quote:
              "I intend to confront Helena this evening and ask for her account before filing a formal complaint.",
          },
          {
            docKey: "14-provenance-dispute.md",
            quote:
              "FARI has confirmed that no certificate bearing the reference FARI-2025-0387 was issued by them, and that the document presented to me is a forgery.",
          },
        ],
        note: "An unsent draft on Victor's laptop, saved at 16:32 that afternoon, says he intended to confront Helena that very evening about a forged provenance certificate — and to report the fraud to the Met's Art & Antiques Unit.",
      }),
      text(
        " Victor liked to be kept abreast of the small things. That was the whole of it.”"
      ),
    ],
  },
  {
    id: "q-h3",
    suspectId: "helena",
    label: "Any contact with Victor after you left?",
    answer: [
      text("“None. "),
      claim({
        id: "c-h-no-calls",
        text: "I do not recall making or receiving any telephone calls that evening.",
        verdict: "CONTRADICTED",
        citations: [
          {
            docKey: "13-phone-records.md",
            quote:
              "20:11 | Outgoing call | 0 min 08s | Victor Holt (+44 7700 900183) — NO ANSWER",
          },
          {
            docKey: "13-phone-records.md",
            quote:
              "20:18 | Outgoing call | 3 min 41s | Victor Holt (+44 7700 900183) — CONNECTED",
          },
        ],
        note: "Her own phone records show two outgoing calls to Victor that evening — a missed call at 20:11 and a connected call of 3 minutes 41 seconds at 20:18. Twelve minutes inside the murder window.",
      }),
      text(
        " I learned of Victor’s death when the constable telephoned the next morning.”"
      ),
    ],
  },
  {
    id: "q-h4",
    suspectId: "helena",
    label: "Your badge exited the main door at 20:47. Explain that.",
    requiresDocs: ["09-security-log.md"],
    answer: [
      text(
        "For the first time, the composure flickers. “Then the system is wrong. "
      ),
      claim({
        id: "c-h-system-wrong",
        text: "The access system must be mistaken — I left at a quarter to eight, as I said.",
        verdict: "CONTRADICTED",
        citations: [
          {
            docKey: "09-security-log.md",
            quote:
              "The log shows Felix Drummond exiting the main door at 19:48. It shows Helena Voss exiting at 20:47. No card activity was recorded between 19:48 and 20:47, meaning no card entry or exit occurred during that window.",
          },
          {
            docKey: "09-security-log.md",
            quote:
              "Log exported in CSV format from the Salto server at 08:12 on 15 October 2025 by the gallery's IT manager (Ian Forsythe) at DC Mehta's request. The export was witnessed by DC Mehta via remote screen share.",
          },
        ],
        note: "The system administrator's note rules out a glitch: no card activity at all between Drummond's 19:48 exit and her 20:47 exit. The export was witnessed and preserved under chain of custody as exhibit HGA-001.",
      }),
      text(
        " These systems misread cards constantly. Ask Ian — ask anyone who works there.”"
      ),
    ],
  },
  {
    id: "q-h5",
    suspectId: "helena",
    label: "Tell me about the de Heem acquisition.",
    answer: [
      text("She brightens — comfortable ground, or it should be. “"),
      claim({
        id: "c-h-price",
        text: "We acquired it for €340,000 through a Zurich intermediary, on behalf of a private estate.",
        verdict: "SUPPORTED",
        citations: [
          {
            docKey: "12-gallery-inventory.md",
            quote:
              "Purchase price: €340,000 from a Zurich intermediary (vendor: private estate, identity not disclosed per vendor request).",
          },
        ],
        note: "The quarterly inventory — prepared by Voss herself and approved by Victor — corroborates the price and the Zurich route.",
      }),
      text(" The paperwork was immaculate. "),
      claim({
        id: "c-h-fari",
        text: "The provenance bundle included a FARI certificate of authenticity. Everything was in order.",
        verdict: "CONTRADICTED",
        citations: [
          {
            docKey: "14-provenance-dispute.md",
            quote:
              "FARI has confirmed that no certificate bearing the reference FARI-2025-0387 was issued by them, and that the document presented to me is a forgery.",
          },
          {
            docKey: "12-gallery-inventory.md",
            quote:
              "His preliminary verbal assessment, shared with Helena Voss during the appraisal visit, indicated “significant concerns requiring further investigation.”",
          },
        ],
        note: "FARI confirmed in writing that the certificate is a forgery — and Drummond's appraisal raised authenticity concerns with Voss on the night of the murder. The provenance was the opposite of in order.",
      }),
      text(" A buyer was committed at £285,000.”"),
    ],
  },
  {
    id: "q-h6",
    suspectId: "helena",
    label: "Victor knew the certificate was forged. He was going to report you.",
    requiresDocs: ["14-provenance-dispute.md"],
    answer: [
      text(
        "The room goes very quiet. When she speaks again the warmth is gone. “Victor and I built that gallery’s reputation together. "
      ),
      claim({
        id: "c-h-equity",
        text: "He trusted me completely — he had offered me an equity stake in the gallery.",
        verdict: "SUPPORTED",
        citations: [
          {
            docKey: "03-character-helena.md",
            quote:
              "Helena had been offered an equity stake in the gallery “in principle” by Victor in a letter dated February 2024, though the arrangement had not been formalised.",
          },
        ],
        note: "True — and it sharpens the motive. Everything she had been promised depended on a reputation the FARI review was about to destroy.",
      }),
      text(
        " If you intend to accuse me of something, Inspector, I suggest you do it with evidence in your hand.”"
      ),
    ],
  },

  // ----- Felix Drummond ---------------------------------------------------
  {
    id: "q-f1",
    suspectId: "felix",
    label: "Take me through your evening.",
    answer: [
      text(
        "Felix talks quickly, glad of the structure. “Assessment from half five, finished the physical work by quarter to seven, wrote up notes in the reading room. "
      ),
      claim({
        id: "c-f-exit",
        text: "I left the gallery at about a quarter to eight, locking the door behind me.",
        verdict: "SUPPORTED",
        citations: [
          {
            docKey: "09-security-log.md",
            quote:
              "2025-10-14 19:48:52 | CARD_EXIT | READER_01_MAIN_DOOR | HOLDER: Felix Drummond (VISITOR-014) | STATUS: VALID",
          },
          {
            docKey: "07-felix-statement.md",
            quote:
              "I can now confirm from my Oyster card that I tapped in at Camden Town Underground at 19:52.",
          },
        ],
        note: "Badge exit at 19:48:52, Oyster tap-in at Camden Town at 19:52. Two independent systems agree with him to the minute.",
      }),
      text(" Then dinner. "),
      claim({
        id: "c-f-dinner",
        text: "I was seated at my table at Foragers in Islington by 20:35.",
        verdict: "SUPPORTED",
        citations: [
          {
            docKey: "04-character-felix.md",
            quote:
              "Felix's dinner at Foragers Restaurant is confirmed by a card payment receipt timed at 22:14 (card present, chip-and-PIN, card ending 4471) for £87.50 (table for one).",
          },
          {
            docKey: "07-felix-statement.md",
            quote:
              "My dinner reservation was confirmed by OpenTable and the restaurant placed me at my table at 20:35.",
          },
        ],
        note: "OpenTable places him at his table at 20:35 — five minutes after the murder window opens, three miles away. The chip-and-PIN receipt requires his physical presence. The alibi holds.",
      }),
      text("”"),
    ],
  },
  {
    id: "q-f2",
    suspectId: "felix",
    label: "Did Helena leave before you?",
    answer: [
      text("“Yes — I was clear about this in my statement. "),
      claim({
        id: "c-f-helena-left",
        text: "Helena left before me. She locked the door from the outside and handed me the key.",
        verdict: "CONTRADICTED",
        citations: [
          {
            docKey: "07-felix-statement.md",
            quote:
              "Helena Voss had left before me — she locked the door from the outside and handed me the key through the door while I was still in the hallway.",
          },
          {
            docKey: "09-security-log.md",
            quote:
              "The log shows Felix Drummond exiting the main door at 19:48. It shows Helena Voss exiting at 20:47. No card activity was recorded between 19:48 and 20:47, meaning no card entry or exit occurred during that window.",
          },
        ],
        note: "Drummond believes what he saw at the door — but the badge log records no exit for Voss before his own at 19:48. Her card left at 20:47. If she staged a departure for his benefit, she never actually badged out.",
      }),
      text(
        " She said goodnight through the door. I finished my notes and let myself out perhaps ten minutes later.”"
      ),
    ],
  },
  {
    id: "q-f3",
    suspectId: "felix",
    label: "What did your appraisal find?",
    answer: [
      text(
        "He hesitates — professional discretion warring with the circumstances. “Most of the collection was exactly as documented. But the de Heem… "
      ),
      claim({
        id: "c-f-concerns",
        text: "I raised significant concerns about the de Heem with Helena during the visit.",
        verdict: "SUPPORTED",
        citations: [
          {
            docKey: "12-gallery-inventory.md",
            quote:
              "His preliminary verbal assessment, shared with Helena Voss during the appraisal visit, indicated “significant concerns requiring further investigation.”",
          },
        ],
        note: "The inventory's status note corroborates this — and it means Helena heard a second, independent voice question the painting hours before Victor died.",
      }),
      text(
        " The brushwork in the drapery was wrong for de Heem. I told her it needed proper investigation before any sale.”"
      ),
    ],
  },
  {
    id: "q-f4",
    suspectId: "felix",
    label: "Why did you go back at half past nine?",
    answer: [
      text("“The stupidest reason imaginable. "),
      claim({
        id: "c-f-laptop",
        text: "I had left my assessment laptop in the reading room and couldn't finish the report without it.",
        verdict: "SUPPORTED",
        citations: [
          {
            docKey: "01-case-overview.md",
            quote:
              "Mr Drummond stated he had returned to the gallery after a dinner appointment to collect paperwork he had left behind, and found the main door unlocked and Mr Holt unresponsive at his desk.",
          },
        ],
        note: "Consistent with his 999 account given at the scene, before he could have known what any record showed.",
      }),
      text(" And when I got there, "),
      claim({
        id: "c-f-door-unlocked",
        text: "the front door was unlocked. I had locked it when I left.",
        verdict: "SUPPORTED",
        citations: [
          {
            docKey: "09-security-log.md",
            quote:
              "2025-10-14 21:44:06 | CARD_ENTRY | READER_01_MAIN_DOOR | HOLDER: DOOR UNLOCKED (no card) | STATUS: DOOR HELD OPEN — ALARM TRIGGERED",
          },
          {
            docKey: "10-forensic-report.md",
            quote:
              "The main entrance was found unlocked when Felix Drummond arrived at 21:44. No signs of forced entry anywhere in the premises.",
          },
        ],
        note: "The 21:44 alarm event confirms he entered an already-unlocked door without a card. Someone with a key or card left that door unlocked after him — and no one badged in between.",
      }),
      text(" I knew before I reached the office that something was wrong.”"),
    ],
  },

  // ----- Nora Ashton ------------------------------------------------------
  {
    id: "q-n1",
    suspectId: "nora",
    label: "What brought you to Camden that evening?",
    answer: [
      text("“Art, Inspector. It is usually art. "),
      claim({
        id: "c-n-viewing",
        text: "I attended a private viewing at the Delancey Gallery from half past four until just after six.",
        verdict: "SUPPORTED",
        citations: [
          {
            docKey: "05-character-nora.md",
            quote:
              "She attended the viewing between 16:30 and 18:15 per the Delancey Gallery's visitor record.",
          },
        ],
        note: "The Delancey Gallery's visitor record confirms the viewing. Her afternoon is accounted for — the evening is the question.",
      }),
      text(" Afterwards I walked, as I always do in London. But "),
      claim({
        id: "c-n-no-entry",
        text: "I did not enter Holbrooke Gallery, or attempt to.",
        verdict: "SUPPORTED",
        citations: [
          {
            docKey: "15-detective-notes.md",
            quote:
              "The badge access log, which is the authoritative record of entry and exit via the card reader, shows no access events attributable to Nora Ashton. She does not have an access card to the gallery.",
          },
        ],
        note: "The authoritative access record contains no entry attributable to Ashton — and she holds no card. There is no evidence she was ever inside.",
      }),
      text("”"),
    ],
  },
  {
    id: "q-n2",
    suspectId: "nora",
    label: "Did your walk take you near the gallery?",
    answer: [
      text("A pause you could hang a coat on. “It is possible. "),
      claim({
        id: "c-n-linger",
        text: "I may have passed the gallery on my walk, but I didn't stop or linger.",
        verdict: "CONTRADICTED",
        citations: [
          {
            docKey: "05-character-nora.md",
            quote:
              "External CCTV footage from a neighbouring business on Westbourne Terrace shows an individual consistent with Nora Ashton's description (height, clothing, distinctive red coat) on the pavement outside Holbrooke Gallery at approximately 20:40. The footage shows the individual pausing briefly, looking at the gallery frontage, and continuing to walk east.",
          },
        ],
        note: "CCTV shows a figure in her distinctive red coat pausing outside the gallery at 20:40 — ten minutes into the murder window. She stopped. She looked. She didn't mention it.",
      }),
      text(" I know the street; one passes many galleries in Camden.”"),
    ],
  },
  {
    id: "q-n3",
    suspectId: "nora",
    label: "What was your interest in the de Heem?",
    answer: [
      text("“I collect Dutch still life — it would have crowned the collection. "),
      claim({
        id: "c-n-buy",
        text: "I enquired about buying it. Victor told me it was committed to another buyer.",
        verdict: "SUPPORTED",
        citations: [
          {
            docKey: "05-character-nora.md",
            quote:
              "An email exchange in September 2025 shows Nora enquiring about the de Heem acquisition (HG-2025-004) with a view to purchasing. Victor replied that the work was under a provisional commitment to another buyer and was “not currently available.”",
          },
        ],
        note: "The September email exchange matches her account. Disappointment, yes — documented anywhere as rage, no.",
      }),
      text(" Though I will say: "),
      claim({
        id: "c-n-whispers",
        text: "there were whispers in the trade about a provenance question on that painting.",
        verdict: "SUPPORTED",
        citations: [
          {
            docKey: "05-character-nora.md",
            quote:
              "A subsequent email from Nora on 3 October 2025 asks: “Is the provenance issue I've heard whispers about in the trade going to affect the sale?” Victor did not reply to this email.",
          },
        ],
        note: "Her 3 October email proves the whispers were real and reached her before the murder. If the trade knew, the question is who had everything to lose when it surfaced.",
      }),
      text(" Victor never answered that question.”"),
    ],
  },
  {
    id: "q-n4",
    suspectId: "nora",
    label: "CCTV puts you outside the gallery at 20:40. Pausing.",
    requiresDocs: ["05-character-nora.md"],
    answer: [
      text(
        "She sighs, the resistance going out of her. “Very well. I stopped. The lights were on at the back and I considered ringing the bell — I wanted an answer about the provenance. I thought better of it. "
      ),
      claim({
        id: "c-n-call",
        text: "I made a short telephone call and walked on.",
        verdict: "SUPPORTED",
        citations: [
          {
            docKey: "13-phone-records.md",
            quote: "20:44 | Outgoing call | 1 min 15s | Unknown contact (+44 7XXX XXXXXX — redacted)",
          },
        ],
        note: "A 75-second call at 20:44, made moments after the CCTV sighting — placing her outside on the pavement, not inside the gallery.",
      }),
      text(" Then "),
      claim({
        id: "c-n-train",
        text: "I took the Northern Line at about twenty past nine and caught the 21:43 to Cambridge.",
        verdict: "SUPPORTED",
        citations: [
          {
            docKey: "08-nora-statement.md",
            quote:
              "I took the Northern Line from Camden Town to King's Cross at approximately twenty past nine and caught the 21:43 to Cambridge, which I can confirm with my rail ticket.",
          },
          {
            docKey: "15-detective-notes.md",
            quote:
              "Her Oyster tap-in at Camden Town at 21:20 and the confirmed train booking at 21:43 are consistent with her statement.",
          },
        ],
        note: "Oyster and rail records corroborate her departure. Curiosity put her on that pavement; nothing puts her through the door.",
      }),
      text("”"),
    ],
  },
];

export const CLAIMS_BY_ID: Record<string, Claim> = Object.fromEntries(
  QUESTIONS.flatMap((q) =>
    q.answer
      .filter((segment): segment is { kind: "claim"; claim: Claim } => segment.kind === "claim")
      .map((segment) => [segment.claim.id, segment.claim])
  )
);

export const QUESTIONS_BY_SUSPECT: Record<string, Question[]> = {
  helena: QUESTIONS.filter((q) => q.suspectId === "helena"),
  felix: QUESTIONS.filter((q) => q.suspectId === "felix"),
  nora: QUESTIONS.filter((q) => q.suspectId === "nora"),
};

/** Which suspect a claim belongs to (for pressure meters). */
export const CLAIM_SUSPECT: Record<string, string> = Object.fromEntries(
  QUESTIONS.flatMap((q) =>
    q.answer
      .filter((segment): segment is { kind: "claim"; claim: Claim } => segment.kind === "claim")
      .map((segment) => [segment.claim.id, q.suspectId])
  )
);
