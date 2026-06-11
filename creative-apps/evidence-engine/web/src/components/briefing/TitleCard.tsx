import { useGame } from "../../GameContext";
import "./briefing.css";

export function TitleCard() {
  const { dispatch } = useGame();

  return (
    <div className="title-card" role="main">
      <div className="title-card__rule" aria-hidden="true" />
      <p className="micro-label title-card__eyebrow">Evidence Engine · Case HGA-2025-1014</p>
      <h1 className="title-card__title">
        The Holbrooke
        <br />
        <em>Gallery Affair</em>
      </h1>
      <p className="title-card__deck">
        A gallery owner is dead. Three people were near the scene. One of them is
        lying — and the lie is buried in fifteen documents of evidence.
        <br />
        Every claim can be pressed. Every verdict carries its citation.
      </p>
      <button
        className="title-card__open"
        onClick={() => dispatch({ type: "OPEN_CASE" })}
      >
        Open the case file
      </button>
      <p className="title-card__footnote">
        All persons and events are fictitious · Grounded by Foundry IQ retrieval
      </p>
      <div className="title-card__rule" aria-hidden="true" />
    </div>
  );
}
