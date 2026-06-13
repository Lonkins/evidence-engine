import { useEffect, useState } from "react";
import { SUSPECTS } from "../../data/caseData";
import {
  evaluateLiveAccusation,
  exhibitsAgainst,
  type LiveAccusationResult,
  type SuspectId,
} from "../../live/accusation";
import type { ChallengeResponse } from "../../live/types";
import { SuspectPortrait } from "../suspects/SuspectPortrait";
import { Stamp, type StampTone } from "../ui/Stamp";
import "../accusation/accusation.css";

interface LiveAccusationProps {
  /** Every challenge the player has resolved this session, keyed by claimId. */
  challenges: Record<string, ChallengeResponse>;
  onClose: () => void;
  /** A correct accusation closes the case → end the session and show the report. */
  onSolved: () => void;
}

const OUTCOME_TONE: Record<LiveAccusationResult["outcome"], StampTone> = {
  SOLVED: "verified",
  OVERRULED: "contradicted",
  UNPROVEN: "silent",
};

const OUTCOME_TITLE: Record<LiveAccusationResult["outcome"], string> = {
  SOLVED: "Case solved",
  OVERRULED: "Overruled",
  UNPROVEN: "No case to answer",
};

function narrative(result: LiveAccusationResult): string {
  const first = result.accusedName.split(" ")[0];
  switch (result.outcome) {
    case "SOLVED":
      return "Helena Voss stayed in the gallery until 20:47 — over an hour after she swore she had left. Victor Holt died between 20:30 and 21:15, and the badge log puts her alone with him across that window. The contradiction you pinned is the case.";
    case "OVERRULED":
      return `You did catch ${first} in a contradiction — that part was real. But a contradiction is not a confession. Lying to an investigator is not the same as killing Victor Holt, and nothing you pinned places ${first} in the gallery when he died.`;
    case "UNPROVEN":
      return `You have named ${result.accusedName} with no contradiction pinned against them. An accusation needs the receipt — press them until the record disagrees, then accuse again.`;
  }
}

/**
 * The live close (A2). The player names the killer; the verdict is driven by the
 * contradictions they actually pinned. Accusing someone they caught lying but who
 * didn't do it returns OVERRULED — a contradiction is not a confession.
 */
export function LiveAccusation({ challenges, onClose, onSolved }: LiveAccusationProps) {
  const [chosen, setChosen] = useState<SuspectId | null>(null);
  const [result, setResult] = useState<LiveAccusationResult | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !result) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, result]);

  // A held beat between naming them and the stamp coming down.
  useEffect(() => {
    if (!result) return;
    const timer = window.setTimeout(() => setRevealed(true), 1100);
    return () => window.clearTimeout(timer);
  }, [result]);

  const chosenSuspect = SUSPECTS.find((s) => s.id === chosen) ?? null;
  const previewExhibits = chosenSuspect ? exhibitsAgainst(chosenSuspect.name, challenges) : [];

  const submit = () => {
    if (!chosenSuspect) return;
    setResult(
      evaluateLiveAccusation(chosenSuspect.id as SuspectId, chosenSuspect.name, challenges)
    );
  };

  const retry = () => {
    setResult(null);
    setRevealed(false);
  };

  return (
    <div className="accusation" role="dialog" aria-modal="true" aria-label="Name the killer">
      <div className="accusation__backdrop" />

      {!result && (
        <div className="accusation__stage">
          <p className="micro-label accusation__eyebrow">Formal accusation · the live close</p>
          <h2 className="accusation__title">Name the killer.</h2>

          <div className="accusation__suspects">
            {SUSPECTS.map((s) => (
              <button
                key={s.id}
                className={`accused-card ${chosen === s.id ? "accused-card--chosen" : ""}`}
                onClick={() => setChosen(s.id as SuspectId)}
                aria-pressed={chosen === s.id}
              >
                <div className="accused-card__portrait">
                  <SuspectPortrait suspectId={s.id} pressure={chosen === s.id ? 0.8 : 0} />
                </div>
                <span className="accused-card__name">{s.name}</span>
                <span className="accused-card__role">{s.role}</span>
              </button>
            ))}
          </div>

          <div className="accusation__evidence">
            <p className="micro-label">
              Contradictions you pinned against{" "}
              {chosenSuspect ? chosenSuspect.name : "the accused"} ({previewExhibits.length})
            </p>
            <div className="accusation__docs">
              {chosenSuspect && previewExhibits.length === 0 && (
                <p className="accusation__stats">
                  Nothing pinned yet — you'd be naming a name with no receipt.
                </p>
              )}
              {previewExhibits.map((exhibit, index) => (
                <span key={index} className="attach-slip attach-slip--attached">
                  {exhibit.kind === "CONTRADICTED" ? "Record contradicts" : "Self-contradiction"}:{" "}
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
              Name them
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="accusation__stage accusation__stage--verdict">
          {!revealed ? (
            <p className="accusation__holding">DI Sullivan reads your file in silence…</p>
          ) : (
            <div className="accusation__verdict">
              <Stamp tone={OUTCOME_TONE[result.outcome]} large>
                {OUTCOME_TITLE[result.outcome]}
              </Stamp>
              <p className="accusation__accused-line">
                You named <strong>{result.accusedName}</strong> on {result.exhibits.length} pinned
                contradiction{result.exhibits.length === 1 ? "" : "s"}.
              </p>
              <p className="accusation__narrative">{narrative(result)}</p>
              <div className="accusation__actions">
                {result.outcome === "SOLVED" ? (
                  <button className="accusation__submit" onClick={onSolved}>
                    Close the case
                  </button>
                ) : (
                  <button className="accusation__submit" onClick={retry}>
                    Back to the interrogation
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
