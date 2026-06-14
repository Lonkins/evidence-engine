import { useEffect, useRef } from "react";
import { useGame } from "../../GameContext";
import {
  QUESTIONS_BY_SUSPECT,
  SUSPECTS,
  DOC_META_BY_KEY,
} from "../../data/caseData";
import { isQuestionAvailable } from "../../engine/gameState";
import type { Claim, Question } from "../../engine/types";
import { ClaimChip } from "./ClaimChip";
import { VerdictCard } from "./VerdictCard";
import "./interrogation.css";

interface InterrogationPanelProps {
  onOpenDoc: (docKey: string) => void;
}

export function InterrogationPanel({ onOpenDoc }: InterrogationPanelProps) {
  const { state, dispatch } = useGame();
  const threadRef = useRef<HTMLDivElement>(null);

  const suspect = SUSPECTS.find((s) => s.id === state.selectedSuspectId);
  const questions = suspect ? QUESTIONS_BY_SUSPECT[suspect.id] : [];
  const asked = questions.filter((q) => state.askedQuestionIds.includes(q.id));
  const unasked = questions.filter((q) => !state.askedQuestionIds.includes(q.id));

  const askedCount = asked.length;
  useEffect(() => {
    // Bring newly delivered testimony into view.
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [askedCount]);

  if (!suspect) return null;

  const pressClaim = (claim: Claim) => dispatch({ type: "PRESS_CLAIM", claim });
  const ask = (question: Question) => dispatch({ type: "ASK_QUESTION", question });

  return (
    <section className="interrogation" aria-labelledby="interrogation-heading">
      <header className="interrogation__head">
        <div>
          <p className="micro-label">Interrogation room</p>
          <h2 id="interrogation-heading" className="interrogation__name">
            {suspect.name}
            <span className="interrogation__role"> · {suspect.role}</span>
          </h2>
        </div>
        <div className="interrogation__dossier-links">
          <button className="dossier-link" onClick={() => onOpenDoc(suspect.dossierDocKey)}>
            Dossier
          </button>
          <button className="dossier-link" onClick={() => onOpenDoc(suspect.statementDocKey)}>
            Signed statement
          </button>
        </div>
      </header>

      <div className="interrogation__thread" ref={threadRef}>
        {asked.length === 0 && (
          <p className="interrogation__empty">
            {suspect.name} waits across the table. The lamp hums. Put a question to
            them — then press every claim they offer.
          </p>
        )}
        {asked.map((question) => (
          <article key={question.id} className="testimony">
            <p className="testimony__question">
              <span className="testimony__q-mark" aria-hidden="true">Q.</span>
              {question.label}
            </p>
            <div className="testimony__answer">
              {question.answer.map((segment, index) =>
                segment.kind === "text" ? (
                  <span key={index}>{segment.text}</span>
                ) : (
                  <ClaimChip
                    key={segment.claim.id}
                    claim={segment.claim}
                    pressed={state.pressedClaimIds.includes(segment.claim.id)}
                    onPress={pressClaim}
                  />
                )
              )}
            </div>
            {question.answer
              .filter(
                (segment): segment is { kind: "claim"; claim: Claim } =>
                  segment.kind === "claim" &&
                  state.pressedClaimIds.includes(segment.claim.id)
              )
              .map((segment) => (
                <VerdictCard
                  key={segment.claim.id}
                  claim={segment.claim}
                  onOpenDoc={onOpenDoc}
                />
              ))}
          </article>
        ))}
      </div>

      <footer className="interrogation__dock" aria-label="Available questions">
        {unasked.map((question) => {
          const available = isQuestionAvailable(question, state.discoveredDocKeys);
          if (!available) {
            const missing = (question.requiresDocs ?? [])
              .filter((key) => !state.discoveredDocKeys.includes(key))
              .map((key) => DOC_META_BY_KEY[key]?.title ?? key)
              .join(", ");
            return (
              <div key={question.id} className="question-card question-card--locked">
                <span className="question-card__lock" aria-hidden="true">⊘</span>
                Line of questioning sealed — surface: {missing}
              </div>
            );
          }
          return (
            <button
              key={question.id}
              className="question-card"
              onClick={() => ask(question)}
            >
              {question.label}
            </button>
          );
        })}
        {unasked.length === 0 && (
          <p className="interrogation__exhausted">
            You have nothing further for {suspect.name} — for now. The evidence
            board may open new lines.
          </p>
        )}
      </footer>
    </section>
  );
}
