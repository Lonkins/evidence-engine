import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { SuspectRail } from "../suspects/SuspectRail";
import { DocumentModal } from "../evidence/DocumentModal";
import { useLiveSession } from "../../live/useLiveSession";
import { LiveInterrogationPanel } from "./LiveInterrogationPanel";
import { EngineTracePanel } from "./EngineTracePanel";
import { InterrogationReport } from "./InterrogationReport";
import "./live.css";

interface LiveDeskProps {
  onBackToCaseFile: () => void;
  /** Right-aligned slot for journey controls (the act switch). */
  actions?: ReactNode;
}

/**
 * Live Interrogation mode. Requires the live backend (which holds the search
 * admin key and the GitHub Models token). If the backend is unreachable we
 * say so plainly and point back to Case File mode — we never substitute
 * local retrieval while claiming to be live.
 */
export function LiveDesk({ onBackToCaseFile, actions }: LiveDeskProps) {
  const { state, connect, askQuestion, challengeClaim, endSession } = useLiveSession();
  const [openDocKey, setOpenDocKey] = useState<string | null>(null);

  useEffect(() => {
    void connect();
  }, [connect]);

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

  return (
    <>
      <header className="case-header live-header">
        <div className="case-header__id">
          <span className="case-header__badge case-header__badge--live" aria-hidden="true">
            LIVE
          </span>
          <div>
            <h1 className="case-header__title">Act II — The Live Interrogation</h1>
            <p className="case-header__sub">
              A real AI plays the witnesses · Foundry IQ checks every turn · they will
              drift — use what the briefing taught you
            </p>
          </div>
        </div>
        {actions}
      </header>
      <main className="desk-grid live-grid">
        <SuspectRail />
        <LiveInterrogationPanel
          live={state}
          onAsk={(speaker, question) => void askQuestion(sessionId, speaker, question)}
          onChallenge={(claimId) => void challengeClaim(sessionId, claimId)}
          onOpenDoc={setOpenDocKey}
        />
        <EngineTracePanel
          trace={state.trace}
          score={state.score}
          canEnd={state.score !== null || Object.keys(state.transcripts).length > 0}
          onEndSession={() => void endSession(sessionId)}
        />
        {openDocKey && <DocumentModal docKey={openDocKey} onClose={() => setOpenDocKey(null)} />}
      </main>
    </>
  );
}
