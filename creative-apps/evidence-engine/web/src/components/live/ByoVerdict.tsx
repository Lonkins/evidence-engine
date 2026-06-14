import { useEffect, useState } from "react";
import {
  evaluateByoVerdict,
  exhibitsAgainst,
  type ByoVerdictResult,
} from "../../live/accusation";
import type { Witness } from "../../live/api";
import type { ChallengeResponse } from "../../live/types";
import { Stamp, type StampTone } from "../ui/Stamp";
import "../accusation/accusation.css";

interface ByoVerdictProps {
  witnesses: Witness[];
  sourceTitle?: string;
  /** Every challenge the player has resolved this session, keyed by claimId. */
  challenges: Record<string, ChallengeResponse>;
  onClose: () => void;
  /** Delivering the verdict ends the session and shows the debrief. */
  onEnd: () => void;
}

const OUTCOME_TONE: Record<ByoVerdictResult["outcome"], StampTone> = {
  CASE_MADE: "gold",
  UNPROVEN: "silent",
};

const OUTCOME_TITLE: Record<ByoVerdictResult["outcome"], string> = {
  CASE_MADE: "Case made",
  UNPROVEN: "No case to answer",
};

function narrative(result: ByoVerdictResult): string {
  const first = result.witnessName.split(" ")[0];
  const n = result.exhibits.length;
  if (result.outcome === "CASE_MADE") {
    return `You've built a cited case against ${first}: on ${n} point${
      n === 1 ? "" : "s"
    }, they said something your source contradicts — quoted in the record below. A contradiction isn't proof of intent, but the receipts are real, and they're yours to keep.`;
  }
  return `You named ${result.witnessName} with nothing pinned against them — no contradiction, no receipt. Press them until your source disagrees, then deliver your verdict again.`;
}

/**
 * The bring-your-own close — "Deliver your verdict." The same cited-receipt
 * mechanic as the Holbrooke accusation, but a user's own source has no ground
 * truth, so there is no "solved": only whether you built a cited case. Outcomes
 * stay source-relative, never findings of fact.
 */
export function ByoVerdict({ witnesses, sourceTitle, challenges, onClose, onEnd }: ByoVerdictProps) {
  const [chosen, setChosen] = useState<string | null>(witnesses.length === 1 ? witnesses[0].name : null);
  const [result, setResult] = useState<ByoVerdictResult | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !result) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, result]);

  useEffect(() => {
    if (!result) return;
    const timer = window.setTimeout(() => setRevealed(true), 1100);
    return () => window.clearTimeout(timer);
  }, [result]);

  const previewExhibits = chosen ? exhibitsAgainst(chosen, challenges) : [];

  const submit = () => {
    if (!chosen) return;
    setResult(evaluateByoVerdict(chosen, challenges));
  };

  const retry = () => {
    setResult(null);
    setRevealed(false);
  };

  return (
    <div className="accusation" role="dialog" aria-modal="true" aria-label="Deliver your verdict">
      <div className="accusation__backdrop" />

      {!result && (
        <div className="accusation__stage">
          <p className="micro-label accusation__eyebrow">The live close · your verdict</p>
          <h2 className="accusation__title">Deliver your verdict.</h2>
          <p className="accusation__deck">
            Name who you'd put on the record as least trustworthy{" "}
            {sourceTitle ? <>in <em>“{sourceTitle}”</em></> : "in your source"} — backed by the
            contradictions you pinned, not by how convincing they sounded.
          </p>

          <div className="accusation__suspects accusation__suspects--flex">
            {witnesses.map((w) => (
              <button
                key={w.name}
                className={`accused-card ${chosen === w.name ? "accused-card--chosen" : ""}`}
                onClick={() => setChosen(w.name)}
                aria-pressed={chosen === w.name}
              >
                <div className="accused-card__portrait accused-card__portrait--initial">
                  <span aria-hidden="true">{w.name.charAt(0).toUpperCase()}</span>
                </div>
                <span className="accused-card__name">{w.name}</span>
                <span className="accused-card__role">{w.role}</span>
              </button>
            ))}
          </div>

          <div className="accusation__evidence">
            <p className="micro-label">
              Contradictions you pinned against {chosen ?? "the witness"} ({previewExhibits.length})
            </p>
            <div className="accusation__docs">
              {chosen && previewExhibits.length === 0 && (
                <p className="accusation__stats">
                  Nothing pinned yet — you'd be naming a name with no receipt.
                </p>
              )}
              {previewExhibits.map((exhibit, index) => (
                <span key={index} className="attach-slip attach-slip--attached">
                  {exhibit.kind === "CONTRADICTED" ? "Source contradicts" : "Self-contradiction"}:{" "}
                  “{exhibit.claimText}”
                </span>
              ))}
            </div>
          </div>

          <div className="accusation__actions">
            <button className="accusation__cancel" onClick={onClose}>
              Keep pressing
            </button>
            <button className="accusation__submit" onClick={submit} disabled={!chosen}>
              Deliver it
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="accusation__stage accusation__stage--verdict">
          {!revealed ? (
            <p className="accusation__holding">The record is read back in silence…</p>
          ) : (
            <div className="accusation__verdict">
              <Stamp tone={OUTCOME_TONE[result.outcome]} large>
                {OUTCOME_TITLE[result.outcome]}
              </Stamp>
              <p className="accusation__accused-line">
                You named <strong>{result.witnessName}</strong> on {result.exhibits.length} pinned
                contradiction{result.exhibits.length === 1 ? "" : "s"}.
              </p>
              <p className="accusation__narrative">{narrative(result)}</p>
              <div className="accusation__actions">
                <button className="accusation__cancel" onClick={retry}>
                  Back to the interrogation
                </button>
                <button className="accusation__submit" onClick={onEnd}>
                  End &amp; debrief
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
