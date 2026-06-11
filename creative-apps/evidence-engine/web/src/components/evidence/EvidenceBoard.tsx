import { useGame } from "../../GameContext";
import { DOC_INDEX, CLAIMS_BY_ID } from "../../data/caseData";
import { contradictionsFound } from "../../engine/gameState";
import { ArchiveSearch } from "./ArchiveSearch";
import "./evidence.css";

interface EvidenceBoardProps {
  onOpenDoc: (docKey: string) => void;
}

/** Pin rotation per slot so the board reads hand-pinned, not grid-generated. */
const TILTS = [-1.4, 0.9, -0.6, 1.2, -1.0, 0.5, -1.6, 1.0, -0.4, 1.5, -0.9, 0.7, -1.2, 0.4, -0.7];

export function EvidenceBoard({ onOpenDoc }: EvidenceBoardProps) {
  const { state } = useGame();
  const contradictions = contradictionsFound(state, CLAIMS_BY_ID);

  return (
    <aside className="evidence" aria-label="Evidence board">
      <div className="evidence__board-wrap">
        <p className="micro-label evidence__label">
          Evidence board · {state.discoveredDocKeys.length} of {DOC_INDEX.length} filed
        </p>
        <div className="evidence__board">
          {DOC_INDEX.map((meta, index) => {
            const discovered = state.discoveredDocKeys.includes(meta.docKey);
            const isKeyContradiction = contradictions.some((claim) =>
              claim.citations.some((c) => c.docKey === meta.docKey)
            );
            if (!discovered) {
              return (
                <div
                  key={meta.docKey}
                  className="evidence-slot evidence-slot--empty"
                  style={{ transform: `rotate(${TILTS[index]}deg)` }}
                  aria-label="Undiscovered document"
                >
                  <span aria-hidden="true">?</span>
                </div>
              );
            }
            return (
              <button
                key={meta.docKey}
                className={[
                  "evidence-slot",
                  "evidence-slot--filed",
                  isKeyContradiction ? "evidence-slot--hot" : "",
                ].join(" ")}
                style={{ transform: `rotate(${TILTS[index]}deg)` }}
                onClick={() => onOpenDoc(meta.docKey)}
                title={`Open ${meta.title}`}
              >
                <span className="evidence-slot__pin" aria-hidden="true" />
                <span className="evidence-slot__kind">{meta.kind}</span>
                <span className="evidence-slot__title">{meta.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {contradictions.length > 0 && (
        <section className="casefile" aria-label="Contradictions caught">
          <p className="micro-label evidence__label">The case against</p>
          <ul className="casefile__list">
            {contradictions.map((claim) => (
              <li key={claim.id} className="casefile__item">
                <span className="casefile__x" aria-hidden="true">✗</span>
                “{claim.text}”
              </li>
            ))}
          </ul>
        </section>
      )}

      <ArchiveSearch />
    </aside>
  );
}
