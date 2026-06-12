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
import { ModeSwitch, type DeskMode } from "./components/live/ModeSwitch";
import { TrainingBanner } from "./components/live/TrainingBanner";
import "./app.css";

function Desk() {
  const { state } = useGame();
  const [mode, setMode] = useState<DeskMode>("casefile");
  const [openDocKey, setOpenDocKey] = useState<string | null>(null);
  const [accusing, setAccusing] = useState(false);

  if (!state.caseOpened) {
    return <TitleCard />;
  }

  const actSwitch = <ModeSwitch mode={mode} onSwitch={setMode} />;

  return (
    <div className="desk">
      {mode === "live" ? (
        <LiveDesk onBackToCaseFile={() => setMode("casefile")} actions={actSwitch} />
      ) : (
        <>
          <CaseHeader onAccuse={() => setAccusing(true)} actions={actSwitch} />
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
        </>
      )}
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
