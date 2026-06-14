import { useGame } from "../../GameContext";
import "./briefing.css";

interface TitleCardProps {
  /** Open the "bring your own trial" intake instead of the built-in case. */
  onBringYourOwn: () => void;
}

export function TitleCard({ onBringYourOwn }: TitleCardProps) {
  const { dispatch } = useGame();

  return (
    <div className="title-card title-card--choose" role="main">
      <div className="title-card__rule" aria-hidden="true" />
      <p className="micro-label title-card__eyebrow">Evidence Engine</p>
      <h1 className="title-card__title">
        Put an AI
        <br />
        <em>on the stand</em>
      </h1>
      <p className="title-card__deck">
        AI assistants hallucinate — confidently, fluently, more often than you'd like.
        Here you interrogate one. It answers in character and lies; Foundry IQ checks
        every claim against the source and hands you the receipt — or says, honestly,
        when it can't be sure.
      </p>

      <div className="scenario-choice">
        <button type="button" className="scenario-card scenario-card--byo" onClick={onBringYourOwn}>
          <span className="scenario-card__tag">Bring your own</span>
          <span className="scenario-card__title">Put your own source on the stand</span>
          <span className="scenario-card__desc">
            Paste a document, your notes, a story, or code. A witness takes the stand who
            only knows what you pasted — catch what it invents.
          </span>
          <span className="scenario-card__go">Paste a source →</span>
        </button>

        <button type="button" className="scenario-card" onClick={() => dispatch({ type: "OPEN_CASE" })}>
          <span className="scenario-card__tag">No setup · ready to play</span>
          <span className="scenario-card__title">Use our example case</span>
          <span className="scenario-card__desc">
            The Holbrooke Gallery Affair — a murder, three AI witnesses, and at least one
            liar to catch against the record.
          </span>
          <span className="scenario-card__go">Step into the interrogation →</span>
        </button>
      </div>

      <p className="title-card__footnote">
        A live AI takes the stand · Foundry IQ catches the lie with its citation
        <br />
        All persons and events are fictitious
      </p>
      <div className="title-card__rule" aria-hidden="true" />
    </div>
  );
}
