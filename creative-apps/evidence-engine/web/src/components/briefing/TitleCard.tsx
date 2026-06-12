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
        AI assistants hallucinate — confidently, fluently, more often than you'd like.
        In the next five minutes you'll learn to catch one in the act.
        <br />
        A gallery owner is dead. Three witnesses will answer your questions. Their
        testimony <em>sounds</em> right — your job is to check it against the record.
        Every claim can be challenged. Every verdict carries its citation.
      </p>
      <button
        className="title-card__open"
        onClick={() => dispatch({ type: "OPEN_CASE" })}
      >
        Begin the briefing
      </button>
      <p className="title-card__footnote">
        Act I · train on the scripted case — Act II · a live AI takes the stand
        <br />
        All persons and events are fictitious · Grounded by Foundry IQ retrieval
      </p>
      <div className="title-card__rule" aria-hidden="true" />
    </div>
  );
}
