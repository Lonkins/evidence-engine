import "./suspects.css";

interface WitnessStandProps {
  witness: { name: string; role: string } | null;
  sourceTitle: string | null;
}

/**
 * The "on the stand" rail for a bring-your-own trial — the single-witness
 * counterpart to the Holbrooke SuspectRail, so both desks share the same
 * three-column layout. The witness's whole world is the user's pasted source.
 */
export function WitnessStand({ witness, sourceTitle }: WitnessStandProps) {
  const name = witness?.name ?? "The Witness";
  const role = witness?.role ?? "Witness";
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <nav className="suspect-rail" aria-label="Witness on the stand">
      <p className="micro-label suspect-rail__label">On the stand</p>
      <div className="suspect-card suspect-card--active witness-card" aria-current="true">
        <div className="suspect-card__portrait witness-card__portrait">
          <span className="witness-avatar" aria-hidden="true">
            {initial}
          </span>
        </div>
        <div className="suspect-card__id">
          <h3 className="suspect-card__name">{name}</h3>
          <p className="suspect-card__role">{role}</p>
          <p className="suspect-card__hook">
            Knows only “{sourceTitle ?? "your source"}”.
          </p>
        </div>
      </div>
      <p className="suspect-rail__footer">
        Everything they know comes from your source.
        <br />
        Anything beyond it, they're inventing.
      </p>
    </nav>
  );
}
