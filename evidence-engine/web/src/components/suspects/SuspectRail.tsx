import { useGame } from "../../GameContext";
import { SUSPECTS, CLAIMS_BY_ID, CLAIM_SUSPECT } from "../../data/caseData";
import { SuspectPortrait } from "./SuspectPortrait";
import "./suspects.css";

function pressureFor(suspectId: string, pressedClaimIds: string[]): number {
  return pressedClaimIds.filter(
    (id) =>
      CLAIM_SUSPECT[id] === suspectId &&
      CLAIMS_BY_ID[id]?.verdict === "CONTRADICTED"
  ).length;
}

export function SuspectRail() {
  const { state, dispatch } = useGame();

  return (
    <nav className="suspect-rail" aria-label="Suspects">
      <p className="micro-label suspect-rail__label">Persons of interest</p>
      {SUSPECTS.map((suspect) => {
        const contradictions = pressureFor(suspect.id, state.pressedClaimIds);
        const isActive = state.selectedSuspectId === suspect.id;
        return (
          <button
            key={suspect.id}
            className={[
              "suspect-card",
              isActive ? "suspect-card--active" : "",
              contradictions > 0 ? "suspect-card--pressured" : "",
            ].join(" ")}
            onClick={() => dispatch({ type: "SELECT_SUSPECT", suspectId: suspect.id })}
            aria-pressed={isActive}
          >
            <div className="suspect-card__portrait">
              <SuspectPortrait suspectId={suspect.id} pressure={Math.min(contradictions / 3, 1)} />
              {contradictions > 0 && (
                <span className="suspect-card__flag" aria-label={`${contradictions} contradictions caught`}>
                  {Array.from({ length: Math.min(contradictions, 4) }, () => "✗").join(" ")}
                </span>
              )}
            </div>
            <div className="suspect-card__id">
              <h3 className="suspect-card__name">{suspect.name}</h3>
              <p className="suspect-card__role">{suspect.role}</p>
              <p className="suspect-card__hook">{suspect.hook}</p>
            </div>
          </button>
        );
      })}
      <p className="suspect-rail__footer">
        One of these three killed Victor Holt.
        <br />
        The evidence already knows which.
      </p>
    </nav>
  );
}
