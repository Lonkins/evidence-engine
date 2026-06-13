import { useState } from "react";
import { GameProvider, useGame } from "./GameContext";
import { CaseHeader } from "./components/header/CaseHeader";
import { SuspectRail } from "./components/suspects/SuspectRail";
import { InterrogationPanel } from "./components/interrogation/InterrogationPanel";
import { CaseBriefing } from "./components/briefing/CaseBriefing";
import { TitleCard } from "./components/briefing/TitleCard";
import { EvidenceBoard } from "./components/evidence/EvidenceBoard";
import { DocumentModal } from "./components/evidence/DocumentModal";
import { AccusationModal } from "./components/accusation/AccusationModal";
import { LiveDesk } from "./components/live/LiveDesk";
import type { DeskMode } from "./components/live/ModeSwitch";
import { TrainingBanner } from "./components/live/TrainingBanner";
import "./app.css";

function Desk() {
  const { state } = useGame();
  // The live interrogation is THE product (A1) — it is the default surface. The
  // scripted Case File is demoted to an offline, no-keys fallback reachable from
  // a corner link, never the front door.
  const [mode, setMode] = useState<DeskMode>("live");
  const [openDocKey, setOpenDocKey] = useState<string | null>(null);
  const [accusing, setAccusing] = useState(false);

  if (!state.caseOpened) {
    return <TitleCard />;
  }

  if (mode === "live") {
    return (
      <div className="desk">
        <LiveDesk
          onBackToCaseFile={() => setMode("casefile")}
          actions={
            <button
              type="button"
              className="surface-link"
              onClick={() => setMode("casefile")}
            >
              Offline demo · no keys
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="desk">
      <CaseHeader
        onAccuse={() => setAccusing(true)}
        actions={
          <button
            type="button"
            className="surface-link surface-link--live"
            onClick={() => setMode("live")}
          >
            <span className="surface-link__dot" aria-hidden="true" /> Back to the live interrogation
          </button>
        }
      />
      <TrainingBanner onEnterLive={() => setMode("live")} />
      <main className="desk-grid">
        <SuspectRail />
        {state.selectedSuspectId ? (
          <InterrogationPanel onOpenDoc={setOpenDocKey} />
        ) : (
          <CaseBriefing />
        )}
        <EvidenceBoard onOpenDoc={setOpenDocKey} />
      </main>
      {openDocKey && (
        <DocumentModal docKey={openDocKey} onClose={() => setOpenDocKey(null)} />
      )}
      {accusing && <AccusationModal onClose={() => setAccusing(false)} />}
    </div>
  );
}

export function App() {
  return (
    <GameProvider>
      <div className="atmosphere" aria-hidden="true" />
      <Desk />
    </GameProvider>
  );
}
