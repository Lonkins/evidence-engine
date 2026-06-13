import type { ChallengeResponse, LiveClaimRef } from "../../live/types";
import { liveDocKeyToCorpusKey } from "../../live/docKeyMap";
import { Stamp } from "../ui/Stamp";
import "../interrogation/interrogation.css";
import "./live.css";

const EVIDENCE_STAMP = {
  SUPPORTED: { tone: "verified", text: "Supported" },
  CONTRADICTED: { tone: "contradicted", text: "Contradicted" },
  UNSUPPORTED: { tone: "silent", text: "Case file silent" },
} as const;

const EVIDENCE_NOTE = {
  SUPPORTED:
    "The case file is consistent with this claim. Objection overruled — that one costs you.",
  CONTRADICTED:
    "This claim conflicts with the record — the conflicting passage is cited below, verbatim. A pin, not a verdict of lying.",
  UNSUPPORTED:
    "The case file is silent on this point. Flagged as unverifiable — no collar. Silence isn't proof of fabrication.",
} as const;

interface LiveClaimChipProps {
  claim: LiveClaimRef;
  result: ChallengeResponse | undefined;
  pending: boolean;
  onChallenge: (claimId: string) => void;
}

/** A sentence of live testimony — pressable until challenged. */
export function LiveClaimChip({ claim, result, pending, onChallenge }: LiveClaimChipProps) {
  if (result) {
    const ungrounded = result.evidence.source === "ungrounded";
    const verdictClass = ungrounded
      ? "ungrounded"
      : result.evidence.verdict === "SUPPORTED"
      ? "supported"
      : result.evidence.verdict.toLowerCase();
    return (
      <span className={`claim claim--pressed claim--${verdictClass}`}>
        {claim.text}
        <span className="claim__glyph" aria-label={`Verdict: ${ungrounded ? "no grounding" : result.evidence.verdict}`}>
          {ungrounded
            ? "⌀"
            : result.evidence.verdict === "SUPPORTED"
            ? "✓"
            : result.evidence.verdict === "CONTRADICTED"
            ? "✗"
            : "—"}
        </span>
      </span>
    );
  }

  return (
    <button
      className={`claim claim--unpressed ${pending ? "claim--checking" : ""}`}
      onClick={() => onChallenge(claim.claimId)}
      disabled={pending}
      title="Challenge this claim against the live case file"
    >
      {claim.text}
      <span className="claim__press-hint" aria-hidden="true">
        {pending ? "checking…" : "challenge"}
      </span>
    </button>
  );
}

interface LiveVerdictCardProps {
  result: ChallengeResponse;
  onOpenDoc: (corpusDocKey: string) => void;
}

/**
 * Verdict for a challenged live claim: the evidence check (vs the case file)
 * and the self-consistency check (vs the speaker's own indexed testimony).
 * Both verdicts come from live Foundry IQ retrieves — evidence-relative,
 * never "true/false".
 */
export function LiveVerdictCard({ result, onOpenDoc }: LiveVerdictCardProps) {
  const ungrounded = result.evidence.source === "ungrounded";
  const stamp = ungrounded
    ? ({ tone: "silent", text: "No grounding" } as const)
    : EVIDENCE_STAMP[result.evidence.verdict];
  const verdictClass = ungrounded
    ? "ungrounded"
    : result.evidence.verdict === "SUPPORTED"
    ? "supported"
    : result.evidence.verdict.toLowerCase();
  const note = ungrounded
    ? "Foundry IQ was unplugged — nothing could check this claim, so her word stands. Plug grounding back in (engine tap) and re-challenge to watch the catch land."
    : EVIDENCE_NOTE[result.evidence.verdict];
  const isContradiction = !ungrounded && result.evidence.verdict === "CONTRADICTED";
  // Corpus-true stakes: Helena's 20:47 badge exit + "no card activity 19:48–20:47"
  // puts her alone in the gallery across the 20:30–21:15 time-of-death window.
  const showStakes = isContradiction && result.speaker === "Helena Voss";

  return (
    <aside
      className={`verdict-card verdict-card--${verdictClass} live-verdict ${
        isContradiction ? "live-verdict--pinned" : ""
      }`}
      aria-label={`Challenge verdict: ${stamp.text}`}
    >
      <header className="verdict-card__head">
        <Stamp tone={stamp.tone}>{stamp.text}</Stamp>
        <p className="verdict-card__claim">“{result.claimText}”</p>
      </header>

      <p className="verdict-card__note">{note}</p>

      {result.evidence.iq?.justification && (
        <p className="live-verdict__iq">
          <span className="live-verdict__iq-tag" aria-hidden="true">Foundry IQ</span>
          {result.evidence.iq.justification}
        </p>
      )}

      {showStakes && (
        <p className="live-verdict__stakes" role="status">
          <span className="live-verdict__stakes-mark" aria-hidden="true">⚠</span>
          The badge log puts her alone in the gallery from 19:48 to 20:47 — across the
          20:30–21:15 window the coroner gives for Victor's death. This isn't just a wrong
          time; it's the scene of the murder.
        </p>
      )}

      {result.plant?.confirmed && (
        <p className="live-verdict__plant" role="status">
          <span className="live-verdict__plant-stamp">FABRICATION CONFIRMED</span>
          This detail was planted — the witness was scripted to assert it falsely, and you
          pinned it against the record. Ground truth, not heuristic opinion.
        </p>
      )}

      {result.evidence.citations.length > 0 && (
        <ul className="verdict-card__citations">
          {result.evidence.citations.map((citation, index) => {
            const corpusKey = liveDocKeyToCorpusKey(citation.docKey);
            return (
              <li key={`${citation.docKey}-${index}`}>
                <button
                  className="citation-slip"
                  onClick={() => corpusKey && onOpenDoc(corpusKey)}
                  disabled={!corpusKey}
                  title={corpusKey ? `Open ${citation.title}` : citation.title}
                >
                  <span className="citation-slip__doc">
                    <span className="citation-slip__pin" aria-hidden="true" />
                    {citation.title}
                  </span>
                  <blockquote className="citation-slip__quote">{citation.excerpt}</blockquote>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div
        className={`live-verdict__self ${
          result.self.verdict === "SELF_CONTRADICTION" ? "live-verdict__self--conflict" : ""
        }`}
      >
        {result.self.verdict === "SELF_CONTRADICTION" ? (
          <>
            <p className="live-verdict__self-head">
              ✗ Conflicts with their own earlier testimony
            </p>
            {result.self.conflicts.map((conflict, index) => (
              <blockquote key={index} className="live-verdict__self-quote">
                “{conflict.statement}”
                {conflict.turnNo ? (
                  <cite> — their words, turn {conflict.turnNo} (indexed verbatim)</cite>
                ) : null}
              </blockquote>
            ))}
          </>
        ) : (
          <p className="live-verdict__self-head live-verdict__self-head--quiet">
            ✓ Consistent with their earlier testimony this session
          </p>
        )}
      </div>
    </aside>
  );
}
