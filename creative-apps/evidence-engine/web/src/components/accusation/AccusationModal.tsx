import { useEffect, useState } from "react";
import { useGame } from "../../GameContext";
import { SUSPECTS, DOC_META_BY_KEY } from "../../data/caseData";
import { evaluateAccusation } from "../../engine/accusation";
import type { AccusationResult, SuspectId } from "../../engine/types";
import { SuspectPortrait } from "../suspects/SuspectPortrait";
import { Stamp } from "../ui/Stamp";
import "./accusation.css";

interface AccusationModalProps {
  onClose: () => void;
}

const VERDICT_TITLE = {
  correct: "Case solved",
  incorrect: "Wrong suspect",
  insufficient_evidence: "Insufficient evidence",
} as const;

const VERDICT_TONE = {
  correct: "verified",
  incorrect: "contradicted",
  insufficient_evidence: "silent",
} as const;

function verdictNarrative(result: AccusationResult): string {
  switch (result.verdict) {
    case "correct":
      return "Helena Voss remained in the gallery until 20:47 — over an hour after she claimed to have left. Victor Holt was killed between 20:30 and 21:15. She had means: the desk lamp. Opportunity: sole presence after Drummond's 19:48 exit. Motive: the forged provenance Victor had discovered that morning. His unsent draft shows he intended to confront her that evening — and did.";
    case "incorrect":
      return "The evidence does not support this accusation. Review the access records, the timeline, and the question of who had something to lose when the provenance review surfaced — then look again at who the documents contradict.";
    case "insufficient_evidence":
      return "You have named the right person — but a charge must survive a courtroom, and this one would not. Your case is missing the documents that prove presence and motive. Press harder, surface them, and accuse again.";
  }
}

export function AccusationModal({ onClose }: AccusationModalProps) {
  const { state, dispatch } = useGame();
  const [chosen, setChosen] = useState<SuspectId | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [result, setResult] = useState<AccusationResult | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !result) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, result]);

  // Beat of held breath between submission and the stamp coming down.
  useEffect(() => {
    if (!result) return;
    const timer = window.setTimeout(() => setRevealed(true), 1100);
    return () => window.clearTimeout(timer);
  }, [result]);

  const toggleDoc = (docKey: string) => {
    setSelectedDocs((current) =>
      current.includes(docKey)
        ? current.filter((key) => key !== docKey)
        : [...current, docKey]
    );
  };

  const submit = () => {
    if (!chosen) return;
    const evaluated = evaluateAccusation(chosen, selectedDocs);
    setResult(evaluated);
    dispatch({ type: "ACCUSE", result: evaluated });
  };

  const retry = () => {
    setResult(null);
    setRevealed(false);
  };

  const suspect = SUSPECTS.find((s) => s.id === chosen) ?? null;

  return (
    <div className="accusation" role="dialog" aria-modal="true" aria-label="Make your accusation">
      <div className="accusation__backdrop" />

      {!result && (
        <div className="accusation__stage">
          <p className="micro-label accusation__eyebrow">Formal accusation · Case HGA-2025-1014</p>
          <h2 className="accusation__title">Name the killer.</h2>

          <div className="accusation__suspects">
            {SUSPECTS.map((s) => (
              <button
                key={s.id}
                className={`accused-card ${chosen === s.id ? "accused-card--chosen" : ""}`}
                onClick={() => setChosen(s.id)}
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
            <p className="micro-label">Attach the evidence that convicts ({selectedDocs.length} attached)</p>
            <div className="accusation__docs">
              {state.discoveredDocKeys.map((docKey) => {
                const meta = DOC_META_BY_KEY[docKey];
                const attached = selectedDocs.includes(docKey);
                return (
                  <button
                    key={docKey}
                    className={`attach-slip ${attached ? "attach-slip--attached" : ""}`}
                    onClick={() => toggleDoc(docKey)}
                    aria-pressed={attached}
                  >
                    {meta?.title ?? docKey}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="accusation__actions">
            <button className="accusation__cancel" onClick={onClose}>
              Not yet
            </button>
            <button
              className="accusation__submit"
              onClick={submit}
              disabled={!chosen || selectedDocs.length === 0}
            >
              Submit the accusation
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="accusation__stage accusation__stage--verdict">
          {!revealed ? (
            <p className="accusation__holding">
              DI Sullivan reads your file in silence…
            </p>
          ) : (
            <div className="accusation__verdict">
              <Stamp tone={VERDICT_TONE[result.verdict]} large>
                {VERDICT_TITLE[result.verdict]}
              </Stamp>
              {suspect && (
                <p className="accusation__accused-line">
                  You accused <strong>{suspect.name}</strong> on {result.evidenceDocKeys.length}{" "}
                  exhibit{result.evidenceDocKeys.length === 1 ? "" : "s"}.
                </p>
              )}
              <p className="accusation__narrative">{verdictNarrative(result)}</p>
              {result.verdict === "insufficient_evidence" && (
                <ul className="accusation__missing">
                  {result.missingDocKeys.map((key) => (
                    <li key={key}>Missing: {DOC_META_BY_KEY[key]?.title ?? key}</li>
                  ))}
                </ul>
              )}
              <p className="accusation__stats">
                {state.pressedClaimIds.length} claims pressed ·{" "}
                {state.discoveredDocKeys.length} documents filed
              </p>
              <div className="accusation__actions">
                {result.verdict === "correct" ? (
                  <button
                    className="accusation__submit"
                    onClick={() => {
                      dispatch({ type: "RESET" });
                      onClose();
                    }}
                  >
                    Close the case file
                  </button>
                ) : (
                  <button className="accusation__submit" onClick={retry}>
                    Back to the investigation
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
