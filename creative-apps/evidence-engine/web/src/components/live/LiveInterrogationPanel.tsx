import { useEffect, useRef, useState, type FormEvent } from "react";
import { useGame } from "../../GameContext";
import { SUSPECTS } from "../../data/caseData";
import type { LiveSessionState } from "../../live/useLiveSession";
import * as api from "../../live/api";
import type { ChallengeResponse } from "../../live/types";
import { LiveClaimChip, LiveVerdictCard } from "./LiveClaim";
import { SplitVerdict } from "./SplitVerdict";
import "../interrogation/interrogation.css";
import "./live.css";

interface SplitState {
  claimId: string;
  claimText: string;
  /** Grounding off (plug pulled). */
  left: ChallengeResponse;
  /** Grounding on (Foundry IQ in the loop). */
  right: ChallengeResponse;
}

interface LiveInterrogationPanelProps {
  live: LiveSessionState;
  /** Whether Foundry IQ grounding is currently on (the "pull the plug" switch). */
  grounding: boolean;
  /** In a bring-your-own trial, the single witness — overrides the Holbrooke suspect rail. */
  witness?: { name: string; role: string };
  onAsk: (speaker: string, question: string) => void;
  onChallenge: (claimId: string) => void;
  onOpenDoc: (docKey: string) => void;
}

// Scenario-specific openers. The Holbrooke prompts name the gallery and the badge
// log; they must NOT leak into a bring-your-own trial about the user's own source
// (that reads as a faked/scripted integration — the opposite of the whole pitch).
const HOLBROOKE_OPENERS = [
  "Walk me through your movements that evening.",
  "What time exactly did you leave the gallery?",
  "The badge log tells a different story. When did you really leave?",
];

const BYO_OPENERS = [
  "In your own words — what is this about?",
  "Walk me through the most important facts.",
  "Is there anything you're leaving out?",
];

/**
 * Free-form live interrogation. Every reply is grounded through a live
 * Foundry IQ retrieve — and deliberately allowed to drift beyond it. Each
 * sentence becomes a challengeable claim, indexed as testimony the moment
 * it is spoken.
 */
export function LiveInterrogationPanel({
  live,
  grounding,
  witness,
  onAsk,
  onChallenge,
  onOpenDoc,
}: LiveInterrogationPanelProps) {
  const { state } = useGame();
  const [draft, setDraft] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);
  // "See the difference": one claim challenged twice (grounding off + on) in
  // PREVIEW mode, shown side by side. Preview never touches the score or the
  // Grounding Record — it is a demonstration of the thesis.
  const [split, setSplit] = useState<SplitState | null>(null);
  const [splitPending, setSplitPending] = useState<string | null>(null);

  const runSplit = async (claimId: string, claimText: string) => {
    if (!live.sessionId || splitPending) return;
    setSplitPending(claimId);
    try {
      const [left, right] = await Promise.all([
        api.challenge(live.sessionId, claimId, false, true),
        api.challenge(live.sessionId, claimId, true, true),
      ]);
      // Reveal both only when both resolve, so the latency asymmetry between the
      // instant unplugged path and the live IQ reason never leaks on screen.
      setSplit({ claimId, claimText, left, right });
    } catch {
      // The normal challenge path is unaffected; swallow preview errors quietly.
    } finally {
      setSplitPending(null);
    }
  };

  // The person on the stand: the BYO witness if supplied, else the selected
  // Holbrooke suspect.
  const suspect = SUSPECTS.find((s) => s.id === state.selectedSuspectId);
  const person = witness ?? (suspect ? { name: suspect.name, role: suspect.role } : null);
  const corpusNoun = witness ? "your source" : "the case file";
  const turns = person ? live.transcripts[person.name] ?? [] : [];
  const turnCount = turns.length;
  const challengeCount = Object.keys(live.challenges).length;
  // Guided first beat: until the player lands their first challenge anywhere,
  // coach the move and pulse the chips so the loop teaches itself.
  const isFirstChallengePending = challengeCount === 0 && turnCount > 0;

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turnCount, challengeCount, live.askPending]);

  if (!person) {
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
    onAsk(person.name, question);
  };

  return (
    <section className="interrogation live-panel" aria-labelledby="live-heading">
      <header className="interrogation__head">
        <div>
          <p className="micro-label">
            Live interrogation <span className="live-dot" aria-hidden="true" />
          </p>
          <h2 id="live-heading" className="interrogation__name">
            {person.name}
            <span className="interrogation__role"> · {person.role}</span>
          </h2>
        </div>
      </header>

      {!grounding && (
        <p className="live-panel__unplugged" role="status">
          <strong>Foundry IQ is unplugged.</strong> Nothing checks the witness now — her
          claims can't be verified or caught. This is the case <em>without</em> grounding:
          a fluent liar and no way to know. Plug it back in (engine tap, right) and
          re-challenge to watch the catch land.
        </p>
      )}

      <p className="live-panel__disclosure">
        {person.name} is played by a live model, grounded in {corpusNoun} through
        Foundry IQ on every turn — but free to drift beyond it. The drift is the game:
        challenge any sentence and the engine checks it against {corpusNoun}, live.
        <span className="live-panel__scope">
          The engine can only check claims against {corpusNoun} — like real grounding,
          it can't see what isn't indexed.
        </span>
      </p>

      <div className="interrogation__thread" ref={threadRef}>
        {turns.length === 0 && !live.askPending && (
          <p className="interrogation__empty">
            {person.name} waits on the line. Ask anything — then challenge every
            sentence you don't believe.
          </p>
        )}

        {turns.map((turn) => (
          <article key={turn.turnNo} className="testimony">
            <p className="testimony__question">
              <span className="testimony__q-mark" aria-hidden="true">Q.</span>
              {turn.question}
            </p>
            <div
              className={`testimony__answer live-answer ${
                isFirstChallengePending ? "live-answer--coached" : ""
              }`}
            >
              {turn.claims.length > 0 ? (
                turn.claims.map((claim) => (
                  <span key={claim.claimId} className="live-claim-wrap">
                    <LiveClaimChip
                      claim={claim}
                      result={live.challenges[claim.claimId]}
                      pending={live.challengePending === claim.claimId}
                      onChallenge={onChallenge}
                    />
                    {!live.challenges[claim.claimId] && live.sessionId && (
                      <button
                        type="button"
                        className="live-split-trigger"
                        onClick={() => runSplit(claim.claimId, claim.text)}
                        disabled={splitPending !== null}
                        title="See this claim with Foundry IQ on vs off"
                      >
                        {splitPending === claim.claimId ? "comparing…" : "⚖ on/off"}
                      </button>
                    )}{" "}
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
            {isFirstChallengePending && turn.turnNo === turns[turns.length - 1].turnNo && (
              <p className="live-panel__coach" role="status">
                ↑ Every sentence is a claim. Challenge one you don't believe — exact
                times are a good place to start. The engine will check it against the
                case file, live.
              </p>
            )}
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
            {person.name} is answering — Foundry IQ retrieve in flight…
          </p>
        )}

        {live.error && (
          <p className="live-panel__error" role="alert">
            The live wire dropped: {live.error}
          </p>
        )}
      </div>

      {split && (
        <SplitVerdict
          claimText={split.claimText}
          left={split.left}
          right={split.right}
          onClose={() => setSplit(null)}
        />
      )}

      <form className="live-panel__composer" onSubmit={submit}>
        <input
          className="live-panel__input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={`Put a question to ${person.name}…`}
          maxLength={600}
          disabled={live.askPending}
          aria-label={`Question for ${person.name}`}
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
          {(witness ? BYO_OPENERS : HOLBROOKE_OPENERS).map((opener) => (
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
