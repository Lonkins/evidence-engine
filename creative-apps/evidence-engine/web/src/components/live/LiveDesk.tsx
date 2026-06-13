import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useGame } from "../../GameContext";
import { SuspectRail } from "../suspects/SuspectRail";
import { WitnessStand } from "../suspects/WitnessStand";
import { DocumentModal } from "../evidence/DocumentModal";
import { useLiveSession } from "../../live/useLiveSession";
import { LiveInterrogationPanel } from "./LiveInterrogationPanel";
import { EngineTracePanel } from "./EngineTracePanel";
import { InterrogationReport } from "./InterrogationReport";
import { LiveAccusation } from "./LiveAccusation";
import type { ByoConfig } from "../../live/api";
import "./live.css";

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
    if (state.mode === "byo" && state.witness) {
      void askQuestion(
        state.sessionId,
        state.witness.name,
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
  }, [state.status, state.sessionId, state.mode, state.witness, dispatch, askQuestion, grounding]);

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

  return (
    <>
      <header className="case-header live-header">
        <div className="case-header__id">
          <span className="case-header__badge case-header__badge--live" aria-hidden="true">
            LIVE
          </span>
          <div>
            <h1 className="case-header__title">The Interrogation Room</h1>
            <p className="case-header__sub">
              {isByo ? (
                <>
                  {state.witness?.name ?? "The witness"} is grounded in{" "}
                  <em>“{state.sourceTitle ?? "your source"}”</em> · Foundry IQ checks every
                  claim against it, live — catch what it can't back up
                </>
              ) : (
                <>
                  A real AI plays the witnesses · Foundry IQ checks every claim against the
                  case file, live · they will lie — catch them with the receipt
                </>
              )}
            </p>
          </div>
        </div>
        <div className="live-header__tools">
          {isByo ? (
            <button
              type="button"
              className="surface-link"
              onClick={() => void endSession(sessionId)}
            >
              End &amp; debrief
            </button>
          ) : (
            <button
              type="button"
              className="surface-link surface-link--accuse"
              onClick={() => setAccusing(true)}
            >
              Name the killer
            </button>
          )}
          {actions}
        </div>
      </header>
      <main className="desk-grid live-grid">
        {isByo ? (
          <WitnessStand witness={state.witness} sourceTitle={state.sourceTitle} />
        ) : (
          <SuspectRail />
        )}
        <LiveInterrogationPanel
          live={state}
          grounding={grounding}
          witness={isByo ? state.witness ?? undefined : undefined}
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
    </>
  );
}
