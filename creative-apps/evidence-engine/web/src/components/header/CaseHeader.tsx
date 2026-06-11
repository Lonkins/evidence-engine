import { useGame } from "../../GameContext";
import { contradictionsFound } from "../../engine/gameState";
import { CLAIMS_BY_ID } from "../../data/caseData";
import "./header.css";

interface CaseHeaderProps {
  onAccuse: () => void;
}

export function CaseHeader({ onAccuse }: CaseHeaderProps) {
  const { state } = useGame();
  const contradictions = contradictionsFound(state, CLAIMS_BY_ID);
  const canAccuse = contradictions.length > 0;

  return (
    <header className="case-header">
      <div className="case-header__id">
        <span className="case-header__badge" aria-hidden="true">
          HGA
        </span>
        <div>
          <h1 className="case-header__title">The Holbrooke Gallery Affair</h1>
          <p className="case-header__sub">Camden CID · Case HGA-2025-1014 · Evidence Engine</p>
        </div>
      </div>

      <dl className="case-header__tally" aria-label="Investigation progress">
        <div className="tally">
          <dt>Claims pressed</dt>
          <dd>{state.pressedClaimIds.length}</dd>
        </div>
        <div className="tally tally--crimson">
          <dt>Contradictions</dt>
          <dd>{contradictions.length}</dd>
        </div>
        <div className="tally">
          <dt>Documents filed</dt>
          <dd>{state.discoveredDocKeys.length}<span className="tally__of">/15</span></dd>
        </div>
      </dl>

      <button
        className="case-header__accuse"
        onClick={onAccuse}
        disabled={!canAccuse}
        title={
          canAccuse
            ? "Make your accusation"
            : "Catch at least one contradiction before accusing"
        }
      >
        {canAccuse ? "Make the accusation" : "Accusation locked"}
      </button>
    </header>
  );
}
