import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useGame } from "../../GameContext";
import { SuspectRail } from "../suspects/SuspectRail";
import { WitnessStand } from "../suspects/WitnessStand";
import { DocumentModal } from "../evidence/DocumentModal";
import { useLiveSession } from "../../live/useLiveSession";
import { useVerdictSpeech } from "../../live/useVerdictSpeech";
import { LiveInterrogationPanel } from "./LiveInterrogationPanel";
import { EngineTracePanel } from "./EngineTracePanel";
import { InterrogationReport } from "./InterrogationReport";
import { LiveAccusation } from "./LiveAccusation";
import { GroundingRecord } from "./GroundingRecord";
import { ObjectionCurtain } from "./ObjectionCurtain";
import { TakeTheStand } from "./TakeTheStand";
import { ByoVerdict } from "./ByoVerdict";
import type { ByoConfig } from "../../live/api";
import "./live.css";

// "Objection Cinema": stage the challenge moment as theatre (a translucent
// curtain while Foundry IQ reasons, a stamp slam when it resolves). Pure
// presentation; flip to false to demo the bare, unadorned challenge flow.
const OBJECTION_CINEMA = true;

interface LiveDeskProps {
  onBackToCaseFile: () => void;
  /** Right-aligned slot for journey controls (the act switch). */
  actions?: ReactNode;
  /** When set, put the user's own source on the stand instead of Holbrooke. */
  byo?: ByoConfig;
}

/**
 * Live Interrogation mode. Requires the live backend (which holds the search
 * admin key and the GitHub Models token). If the backend is unreachable we
 * say so plainly and point back to Case File mode — we never substitute
 * local retrieval while claiming to be live.
 */
export function LiveDesk({ onBackToCaseFile, actions, byo }: LiveDeskProps) {
  const { dispatch } = useGame();
  const { state, connect, askQuestion, challengeClaim, endSession } = useLiveSession();
  const [openDocKey, setOpenDocKey] = useState<string | null>(null);
  // "Pull the plug": grounding on = Foundry IQ checks every claim; off = the
  // engine has nothing to check against, so the witness's word stands.
  const [grounding, setGrounding] = useState(true);
  const [accusing, setAccusing] = useState(false);
  const [showRecord, setShowRecord] = useState(false);
  // "You take the stand": the inversion — Foundry IQ interrogates the player.
  const [onStand, setOnStand] = useState(false);
  // The bring-your-own close — "Deliver your verdict" against the user's source.
  const [deliveringVerdict, setDeliveringVerdict] = useState(false);
  // Voice in the box (Accessibility): read each verdict aloud. Off by default.
  const [voiceOn, setVoiceOn] = useState(false);
  // Secondary controls live behind one "Case actions" overflow so the first read
  // is just the spine + the single climax action.
  const [actionsOpen, setActionsOpen] = useState(false);
  // Which inferred witness is on the stand, in a bring-your-own trial.
  const [selectedWitness, setSelectedWitness] = useState<string | null>(null);
  const coldOpenedRef = useRef(false);
  const connectedRef = useRef(false);

  // Connect exactly once. Without this guard, React StrictMode's double-mount (dev)
  // fires connect() twice and opens two sessions — the cold-open then asks against
  // one session while the challenge targets the other ("Unknown claim"). The ref
  // persists across the StrictMode remount, so the second invocation is a no-op.
  // The offline-gate "Retry" button calls connect() directly and is unaffected.
  useEffect(() => {
    if (connectedRef.current) return;
    connectedRef.current = true;
    void connect(byo);
  }, [connect, byo]);

  // Cold open (A1): the moment the line is live, drop the player mid-interrogation.
  // Holbrooke → Helena already on the stand with her planted alibi. Bring-your-own
  // → the custom witness, asked to lay out the facts so there's something to
  // challenge in seconds. Fires exactly once per mounted session.
  useEffect(() => {
    if (state.status !== "ready" || !state.sessionId || coldOpenedRef.current) return;
    coldOpenedRef.current = true;
    if (state.mode === "byo" && state.witnesses.length > 0) {
      const first = state.witnesses[0];
      setSelectedWitness(first.name);
      void askQuestion(
        state.sessionId,
        first.name,
        "In your own words — what is this about, and what are the most important facts?",
        grounding
      );
    } else {
      dispatch({ type: "SELECT_SUSPECT", suspectId: "helena" });
      void askQuestion(
        state.sessionId,
        "Helena Voss",
        "What time did you leave the gallery that evening?",
        grounding
      );
    }
  }, [state.status, state.sessionId, state.mode, state.witnesses, dispatch, askQuestion, grounding]);

  // Derived from challenges (present in every status) so the voice hook runs
  // before the early returns, per the rules of hooks.
  const allChallenges = Object.values(state.challenges);
  const recordCount = allChallenges.filter((c) => c.evidence.source !== "ungrounded").length;
  // The most recently resolved challenge — drives Objection Cinema + voiced verdict.
  const latestChallenge =
    allChallenges.length > 0 ? allChallenges[allChallenges.length - 1] : null;
  useVerdictSpeech(latestChallenge, voiceOn);

  if (state.status === "probing" || state.status === "idle") {
    return (
      <div className="live-gate">
        <p className="live-gate__line">Opening the line…</p>
        <p className="live-gate__sub">Probing the live engine and the Foundry IQ knowledge base.</p>
      </div>
    );
  }

  if (state.status === "offline") {
    return (
      <div className="live-gate">
        <p className="live-gate__stamp">LINE DEAD</p>
        <p className="live-gate__line">The live engine is unreachable.</p>
        <p className="live-gate__sub">
          Live mode needs its backend running (it holds the Azure Search key and the
          GitHub Models token — the browser never sees either). Start it with{" "}
          <code>cd evidence-engine/live-server && npm start</code>, then retry.
          <br />
          Case File mode remains fully playable without any backend or keys.
        </p>
        <div className="live-gate__actions">
          <button className="report__action report__action--primary" onClick={() => void connect()}>
            Retry the line
          </button>
          <button className="report__action" onClick={onBackToCaseFile}>
            Back to the case file
          </button>
        </div>
      </div>
    );
  }

  if (state.status === "ended" && state.finalReport) {
    return (
      <InterrogationReport
        score={state.finalReport.score}
        deletedTestimonyDocs={state.finalReport.deletedTestimonyDocs}
        onNewSession={() => void connect()}
        onBackToCaseFile={onBackToCaseFile}
      />
    );
  }

  const sessionId = state.sessionId;
  if (!sessionId) return null;

  const isByo = state.mode === "byo";
  // The witness currently on the stand in a BYO trial (defaults to the first).
  const activeWitness =
    state.witnesses.find((w) => w.name === selectedWitness) ?? state.witnesses[0] ?? null;

  const sourceLabel = isByo
    ? state.sourceTitle ?? "your source"
    : "The Holbrooke Gallery Affair";
  // The witness the cold-open question was auto-fired at (BYO → first inferred
  // witness; Holbrooke → Helena). Mirrors the cold-open effect above so the panel
  // can frame "we opened on your behalf" only on the genuinely seeded turn.
  const coldOpenWitness = isByo ? state.witnesses[0]?.name ?? null : "Helena Voss";
  // Source noun for the desk thesis strip — keep Holbrooke's "case file" out of BYO.
  const corpusNoun = isByo ? "your source" : "the case file";

  return (
    <>
      <header className="case-header live-header">
        <div className="case-header__id">
          <span className="case-header__badge case-header__badge--live" aria-hidden="true">
            LIVE
          </span>
          <h1 className="case-header__title">The Interrogation Room</h1>
        </div>
        <div className="live-header__tools">
          {/* The one always-visible climax — everything else demotes to the overflow. */}
          <button
            type="button"
            className="surface-link surface-link--accuse"
            onClick={() => (isByo ? setDeliveringVerdict(true) : setAccusing(true))}
          >
            Deliver your verdict
          </button>
          <details
            className="case-actions"
            open={actionsOpen}
            onToggle={(event) => setActionsOpen(event.currentTarget.open)}
          >
            <summary className="surface-link case-actions__summary" aria-label="More case actions">
              Case actions
            </summary>
            {/* A native disclosure list — Tab-navigable; no ARIA menu pattern (it would
                promise arrow-key nav we don't implement). */}
            <div className="case-actions__menu">
              <button
                type="button"
                className="case-actions__item"
                onClick={() => {
                  setOnStand(true);
                  setActionsOpen(false);
                }}
              >
                Take the stand
              </button>
              <button
                type="button"
                className="case-actions__item"
                onClick={() => setVoiceOn((on) => !on)}
                aria-pressed={voiceOn}
              >
                <span aria-hidden="true">{voiceOn ? "🔊" : "🔈"}</span>{" "}
                {voiceOn ? "Voice on" : "Voice"}
              </button>
              {recordCount > 0 && (
                <button
                  type="button"
                  className="case-actions__item case-actions__item--record"
                  onClick={() => {
                    setShowRecord(true);
                    setActionsOpen(false);
                  }}
                >
                  The Record ({recordCount})
                </button>
              )}
              {actions && <div className="case-actions__extra">{actions}</div>}
            </div>
          </details>
        </div>
      </header>
      <p className="live-thesis" role="note">
        <strong>Evidence Engine</strong> puts an AI on the stand. It answers
        confidently — and invents when {corpusNoun} is silent. Challenge any line and{" "}
        <strong>Foundry IQ</strong> checks it against {corpusNoun}, live, then hands you
        the receipt.
      </p>
      <main className="desk-grid live-grid">
        {isByo ? (
          <WitnessStand
            witnesses={state.witnesses}
            selectedName={activeWitness?.name ?? null}
            onSelect={setSelectedWitness}
            sourceTitle={state.sourceTitle}
          />
        ) : (
          <SuspectRail />
        )}
        <LiveInterrogationPanel
          live={state}
          grounding={grounding}
          witness={isByo ? activeWitness ?? undefined : undefined}
          coldOpenWitness={coldOpenWitness}
          onAsk={(speaker, question) => void askQuestion(sessionId, speaker, question, grounding)}
          onChallenge={(claimId) => void challengeClaim(sessionId, claimId, grounding)}
          onOpenDoc={setOpenDocKey}
        />
        <EngineTracePanel
          trace={state.trace}
          score={state.score}
          grounding={grounding}
          onToggleGrounding={() => setGrounding((on) => !on)}
          canEnd={state.score !== null || Object.keys(state.transcripts).length > 0}
          onEndSession={() => void endSession(sessionId)}
        />
        {openDocKey && <DocumentModal docKey={openDocKey} onClose={() => setOpenDocKey(null)} />}
      </main>
      {accusing && !isByo && (
        <LiveAccusation
          challenges={state.challenges}
          onClose={() => setAccusing(false)}
          onSolved={() => {
            setAccusing(false);
            void endSession(sessionId);
          }}
        />
      )}
      {deliveringVerdict && isByo && (
        <ByoVerdict
          witnesses={state.witnesses}
          sourceTitle={state.sourceTitle ?? undefined}
          challenges={state.challenges}
          onClose={() => setDeliveringVerdict(false)}
          onEnd={() => {
            setDeliveringVerdict(false);
            void endSession(sessionId);
          }}
        />
      )}
      {showRecord && (
        <GroundingRecord
          challenges={state.challenges}
          sourceLabel={sourceLabel}
          onClose={() => setShowRecord(false)}
        />
      )}
      {onStand && (
        <TakeTheStand
          sessionId={sessionId}
          sourceLabel={isByo ? state.sourceTitle ?? "your source" : "the case file"}
          onClose={() => setOnStand(false)}
        />
      )}
      {OBJECTION_CINEMA && (
        <ObjectionCurtain
          cinema={allChallenges.length < 3}
          pending={Boolean(state.challengePending)}
          latest={latestChallenge}
        />
      )}
    </>
  );
}
