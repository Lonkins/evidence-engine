import type { ChallengeResponse, LiveClaimRef } from "../../live/types";
import { liveDocKeyToCorpusKey } from "../../live/docKeyMap";
import { Stamp } from "../ui/Stamp";
import "../interrogation/interrogation.css";
import "./live.css";

const EVIDENCE_STAMP = {
  SUPPORTED: { tone: "verified", text: "Grounded" },
  CONTRADICTED: { tone: "contradicted", text: "Contradicted" },
  UNSUPPORTED: { tone: "silent", text: "Unverifiable" },
} as const;

const EVIDENCE_NOTE = {
  SUPPORTED:
    "Foundry IQ found this in the source and backs it — the record is consistent with the claim. (Objecting to a grounded statement costs you.)",
  CONTRADICTED:
    "Foundry IQ found a passage that conflicts with this claim — cited below, verbatim. A grounded receipt, not an opinion of lying.",
  // The grey band — the honest heart of the whole thing. Foundry IQ refuses to
  // vouch for what it can't ground, and says so instead of guessing.
  UNSUPPORTED:
    "Foundry IQ won't vouch for this: the source neither backs it nor knocks it down. That's not a miss — it's the engine refusing to bless a claim it can't ground. And it's the dangerous band: a confident claim with no receipt is exactly where hallucinations hide.",
} as const;

/**
 * The "receipt": how hard Foundry IQ worked for this verdict. Turns the
 * invisible multi-step-reasoning axis into something on screen — reasoned
 * (answer synthesis, with the KB's own token count) vs the deterministic
 * cross-check (zero model reasoning) vs unplugged (nothing reasoned at all).
 */
function receiptLine(result: ChallengeResponse): string {
  const { source, reasoningTokens, effort } = result.evidence;
  if (source === "ungrounded") {
    return "Foundry IQ unplugged · nothing reasoned, nothing checked";
  }
  if (source === "iq") {
    const tier = effort ? `${effort} effort` : "answer synthesis";
    const tokens =
      typeof reasoningTokens === "number"
        ? `${reasoningTokens.toLocaleString()} reasoning tokens`
        : "reasoned over the case file";
    return `Foundry IQ · ${tier} · ${tokens}`;
  }
  return "Deterministic cross-check · 0 reasoning tokens (Foundry IQ verdict unavailable)";
}

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

      <p className={`live-verdict__receipt live-verdict__receipt--${result.evidence.source ?? "iq"}`}>
        <span className="live-verdict__receipt-tag" aria-hidden="true">Receipt</span>
        {receiptLine(result)}
      </p>

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
