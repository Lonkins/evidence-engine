import { useGame } from "../../GameContext";
import "./briefing.css";

interface TitleCardProps {
  /** Open the "bring your own trial" intake instead of the built-in case. */
  onBringYourOwn: () => void;
}

export function TitleCard({ onBringYourOwn }: TitleCardProps) {
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
        You're about to interrogate one that will lie straight to your face.
        <br />
        A gallery owner is dead. A live AI witness takes the stand. Her testimony
        <em> sounds</em> right — but every claim can be challenged, and Foundry IQ
        checks it against the case file and hands you the receipt, live.
      </p>
      <div className="title-card__cta-row">
        <button
          className="title-card__open"
          onClick={() => dispatch({ type: "OPEN_CASE" })}
        >
          Step into the interrogation
        </button>
        <button type="button" className="title-card__byo" onClick={onBringYourOwn}>
          …or put <em>your own</em> source on trial →
        </button>
      </div>
      <p className="title-card__footnote">
        A live AI takes the stand · Foundry IQ catches the lie with its citation
        <br />
        Bring your own document, notes, or code — or take the built-in case · All
        persons and events are fictitious
      </p>
      <div className="title-card__rule" aria-hidden="true" />
    </div>
  );
}
