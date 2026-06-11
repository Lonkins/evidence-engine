import { useEffect, useRef, useState, type FormEvent } from "react";
import { useGame } from "../../GameContext";
import { SUSPECTS } from "../../data/caseData";
import type { LiveSessionState } from "../../live/useLiveSession";
import { LiveClaimChip, LiveVerdictCard } from "./LiveClaim";
import "../interrogation/interrogation.css";
import "./live.css";

interface LiveInterrogationPanelProps {
  live: LiveSessionState;
  onAsk: (speaker: string, question: string) => void;
  onChallenge: (claimId: string) => void;
  onOpenDoc: (docKey: string) => void;
}

const SUGGESTED_OPENERS = [
  "Walk me through your movements that evening.",
  "What time exactly did you leave the gallery?",
  "The badge log tells a different story. When did you really leave?",
];

/**
 * Free-form live interrogation. Every reply is grounded through a live
 * Foundry IQ retrieve — and deliberately allowed to drift beyond it. Each
 * sentence becomes a challengeable claim, indexed as testimony the moment
 * it is spoken.
 */
export function LiveInterrogationPanel({
  live,
  onAsk,
  onChallenge,
  onOpenDoc,
}: LiveInterrogationPanelProps) {
  const { state } = useGame();
  const [draft, setDraft] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

  const suspect = SUSPECTS.find((s) => s.id === state.selectedSuspectId);
  const turns = suspect ? live.transcripts[suspect.name] ?? [] : [];
  const turnCount = turns.length;
  const challengeCount = Object.keys(live.challenges).length;

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turnCount, challengeCount, live.askPending]);

  if (!suspect) {
    return (
      <section className="interrogation live-panel">
        <p className="interrogation__empty">
          The line is open. Choose a person of interest to begin the live interrogation.
        </p>
      </section>
    );
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const question = draft.trim();
    if (!question || live.askPending) return;
    setDraft("");
    onAsk(suspect.name, question);
  };

  return (
    <section className="interrogation live-panel" aria-labelledby="live-heading">
      <header className="interrogation__head">
        <div>
          <p className="micro-label">
            Live interrogation <span className="live-dot" aria-hidden="true" />
          </p>
          <h2 id="live-heading" className="interrogation__name">
            {suspect.name}
            <span className="interrogation__role"> · {suspect.role}</span>
          </h2>
        </div>
      </header>

      <p className="live-panel__disclosure">
        {suspect.name} is played by a live model, grounded in the case file through
        Foundry IQ on every turn — but free to drift beyond it. The drift is the game:
        challenge any sentence and the engine checks it against the evidence, live.
      </p>

      <div className="interrogation__thread" ref={threadRef}>
        {turns.length === 0 && !live.askPending && (
          <p className="interrogation__empty">
            {suspect.name} waits on the line. Ask anything — then challenge every
            sentence you don't believe.
          </p>
        )}

        {turns.map((turn) => (
          <article key={turn.turnNo} className="testimony">
            <p className="testimony__question">
              <span className="testimony__q-mark" aria-hidden="true">Q.</span>
              {turn.question}
            </p>
            <div className="testimony__answer live-answer">
              {turn.claims.length > 0 ? (
                turn.claims.map((claim) => (
                  <span key={claim.claimId}>
                    <LiveClaimChip
                      claim={claim}
                      result={live.challenges[claim.claimId]}
                      pending={live.challengePending === claim.claimId}
                      onChallenge={onChallenge}
                    />{" "}
                  </span>
                ))
              ) : (
                <span>{turn.reply}</span>
              )}
            </div>
            <p className="live-answer__grounding">
              {turn.retrievedDocs.length > 0
                ? `Grounded on ${turn.retrievedDocs.length} retrieved document(s): ${turn.retrievedDocs
                    .map((doc) => doc.docKey)
                    .join(", ")}`
                : "No case-file passage cleared the retrieval threshold for this turn — the witness is on their own."}
            </p>
            {turn.claims
              .map((claim) => live.challenges[claim.claimId])
              .filter((result): result is NonNullable<typeof result> => Boolean(result))
              .map((result) => (
                <LiveVerdictCard key={result.claimId} result={result} onOpenDoc={onOpenDoc} />
              ))}
          </article>
        ))}

        {live.askPending && (
          <p className="live-panel__typing" role="status">
            <span className="live-dot live-dot--pulse" aria-hidden="true" />
            {suspect.name} is answering — Foundry IQ retrieve in flight…
          </p>
        )}

        {live.error && (
          <p className="live-panel__error" role="alert">
            The live wire dropped: {live.error}
          </p>
        )}
      </div>

      <form className="live-panel__composer" onSubmit={submit}>
        <input
          className="live-panel__input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={`Put a question to ${suspect.name}…`}
          maxLength={600}
          disabled={live.askPending}
          aria-label={`Question for ${suspect.name}`}
        />
        <button
          type="submit"
          className="live-panel__send"
          disabled={live.askPending || draft.trim().length === 0}
        >
          Ask
        </button>
      </form>
      {turns.length === 0 && (
        <div className="live-panel__openers">
          {SUGGESTED_OPENERS.map((opener) => (
            <button
              key={opener}
              type="button"
              className="live-panel__opener"
              onClick={() => setDraft(opener)}
            >
              {opener}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
