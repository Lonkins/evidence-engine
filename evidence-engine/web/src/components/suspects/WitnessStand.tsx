import type { Witness } from "../../live/api";
import "./suspects.css";

interface WitnessStandProps {
  witnesses: Witness[];
  selectedName: string | null;
  onSelect: (name: string) => void;
  sourceTitle: string | null;
}

/**
 * The "on the stand" rail for a bring-your-own trial — the counterpart to the
 * Holbrooke SuspectRail, so both desks share the same three-column layout. The
 * witnesses are inferred from the user's source (Entry 8) and are selectable.
 */
export function WitnessStand({ witnesses, selectedName, onSelect, sourceTitle }: WitnessStandProps) {
  return (
    <nav className="suspect-rail" aria-label="Witnesses on the stand">
      <p className="micro-label suspect-rail__label">On the stand</p>
      {witnesses.map((witness) => {
        const isActive = witness.name === selectedName;
        const initial = witness.name.trim().charAt(0).toUpperCase() || "?";
        return (
          <button
            key={witness.name}
            className={`suspect-card witness-card ${isActive ? "suspect-card--active" : ""}`}
            onClick={() => onSelect(witness.name)}
            aria-pressed={isActive}
          >
            <div className="suspect-card__portrait witness-card__portrait">
              <span className="witness-avatar" aria-hidden="true">
                {initial}
              </span>
            </div>
            <div className="suspect-card__id">
              <h3 className="suspect-card__name">{witness.name}</h3>
              <p className="suspect-card__role">{witness.role}</p>
              <p className="suspect-card__hook">{witness.hook}</p>
            </div>
          </button>
        );
      })}
      <p className="suspect-rail__footer">
        Inferred from “{sourceTitle ?? "your source"}”.
        <br />
        Anything beyond it, they're inventing.
      </p>
    </nav>
  );
}
