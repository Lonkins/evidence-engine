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
import "./app.css";

function Desk() {
  const { state } = useGame();
  const [mode, setMode] = useState<DeskMode>("casefile");
  const [openDocKey, setOpenDocKey] = useState<string | null>(null);
  const [accusing, setAccusing] = useState(false);

  if (!state.caseOpened) {
    return <TitleCard />;
  }

  return (
    <div className="desk">
      <ModeSwitch mode={mode} onSwitch={setMode} />
      {mode === "live" ? (
        <LiveDesk onBackToCaseFile={() => setMode("casefile")} />
      ) : (
        <>
          <CaseHeader onAccuse={() => setAccusing(true)} />
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
