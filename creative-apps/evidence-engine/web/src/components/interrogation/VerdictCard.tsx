import type { Claim } from "../../engine/types";
import { DOC_META_BY_KEY } from "../../data/caseData";
import { Stamp } from "../ui/Stamp";
import "./interrogation.css";

interface VerdictCardProps {
  claim: Claim;
  onOpenDoc: (docKey: string) => void;
}

const STAMP_TONE = {
  SUPPORTED: "verified",
  CONTRADICTED: "contradicted",
  UNSUPPORTED: "silent",
} as const;

const STAMP_TEXT = {
  SUPPORTED: "Verified",
  CONTRADICTED: "Contradicted",
  UNSUPPORTED: "No record",
} as const;

/**
 * The verdict for a pressed claim: stamp, engine annotation, and the cited
 * passages as paper slips. The UNSUPPORTED case is the designed fail-closed
 * beat — the evidence is silent, and the card says so without apology.
 */
export function VerdictCard({ claim, onOpenDoc }: VerdictCardProps) {
  const verdict = claim.verdict;

  return (
    <aside
      className={`verdict-card verdict-card--${verdict.toLowerCase()}`}
      aria-label={`Claim check verdict: ${STAMP_TEXT[verdict]}`}
    >
      <header className="verdict-card__head">
        <Stamp tone={STAMP_TONE[verdict]}>{STAMP_TEXT[verdict]}</Stamp>
        <p className="verdict-card__claim">“{claim.text}”</p>
      </header>

      {verdict === "UNSUPPORTED" ? (
        <div className="verdict-card__silence">
          <p className="verdict-card__silence-line">The evidence is silent on this point.</p>
          <p className="verdict-card__note">{claim.note}</p>
        </div>
      ) : (
        <>
          <p className="verdict-card__note">{claim.note}</p>
          <ul className="verdict-card__citations">
            {claim.citations.map((citation, index) => {
              const meta = DOC_META_BY_KEY[citation.docKey];
              return (
                <li key={`${citation.docKey}-${index}`}>
                  <button
                    className="citation-slip"
                    onClick={() => onOpenDoc(citation.docKey)}
                    title={`Open ${meta?.title ?? citation.docKey}`}
                  >
                    <span className="citation-slip__doc">
                      <span className="citation-slip__pin" aria-hidden="true" />
                      {meta?.title ?? citation.docKey}
                      <span className="citation-slip__kind">{meta?.kind}</span>
                    </span>
                    <blockquote className="citation-slip__quote">{citation.quote}</blockquote>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </aside>
  );
}
