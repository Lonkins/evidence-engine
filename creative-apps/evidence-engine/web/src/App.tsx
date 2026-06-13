import { useState } from "react";
import { GameProvider, useGame } from "./GameContext";
import { CaseHeader } from "./components/header/CaseHeader";
import { SuspectRail } from "./components/suspects/SuspectRail";
import { InterrogationPanel } from "./components/interrogation/InterrogationPanel";
import { CaseBriefing } from "./components/briefing/CaseBriefing";
import { TitleCard } from "./components/briefing/TitleCard";
import { ByoIntake } from "./components/briefing/ByoIntake";
import type { ByoConfig } from "./live/api";
import { EvidenceBoard } from "./components/evidence/EvidenceBoard";
import { DocumentModal } from "./components/evidence/DocumentModal";
import { AccusationModal } from "./components/accusation/AccusationModal";
import { LiveDesk } from "./components/live/LiveDesk";
import type { DeskMode } from "./components/live/ModeSwitch";
import { TrainingBanner } from "./components/live/TrainingBanner";
import "./app.css";

function Desk() {
  const { state, dispatch } = useGame();
  // The live interrogation is THE product (A1) — it is the default surface. The
  // scripted Case File is demoted to an offline, no-keys fallback reachable from
  // a corner link, never the front door.
  const [mode, setMode] = useState<DeskMode>("live");
  const [openDocKey, setOpenDocKey] = useState<string | null>(null);
  const [accusing, setAccusing] = useState(false);
  // "Bring your own trial" (Part 2): the user's own source on the stand.
  const [byoConfig, setByoConfig] = useState<ByoConfig | null>(null);
  const [byoIntake, setByoIntake] = useState(false);

  if (!state.caseOpened) {
    if (byoIntake) {
      return (
        <ByoIntake
          onCancel={() => setByoIntake(false)}
          onSubmit={(config) => {
            setByoConfig(config);
            setByoIntake(false);
            setMode("live");
            dispatch({ type: "OPEN_CASE" });
          }}
        />
      );
    }
    return (
      <TitleCard
        onBringYourOwn={() => {
          setByoConfig(null);
          setByoIntake(true);
        }}
      />
    );
  }

  if (mode === "live") {
    const startNewTrial = () => {
      setByoConfig(null);
      setByoIntake(true);
      dispatch({ type: "CLOSE_CASE" });
    };
    return (
      <div className="desk">
        <LiveDesk
          key={byoConfig ? "byo" : "holbrooke"}
          byo={byoConfig ?? undefined}
          onBackToCaseFile={() => setMode("casefile")}
          actions={
            byoConfig ? (
              <button type="button" className="surface-link" onClick={startNewTrial}>
                ↩ New trial
              </button>
            ) : (
              <button
                type="button"
                className="surface-link"
                onClick={() => setMode("casefile")}
              >
                Offline demo · no keys
              </button>
            )
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
