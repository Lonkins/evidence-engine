import { useGame } from "../../GameContext";
import "./live.css";

type Props = {
  onEnterLive: () => void;
};

/**
 * Act I strip — frames the scripted Case File desk as the training half of the
 * learning journey: the answers are authored and the verdicts pre-checked, so
 * the player can learn the challenge→verdict→citation move safely before a
 * live model takes the stand.
 */
export function TrainingBanner({ onEnterLive }: Props) {
  const { state } = useGame();
  const hasPressed = state.pressedClaimIds.length > 0;

  return (
    <aside className="training-banner" aria-label="Act one — training briefing">
      <span className="training-banner__act">Act I · The Briefing</span>
      {hasPressed ? (
        <>
          <p className="training-banner__text">
            That's the move — claim, stamp, citation. This case was scripted so you
            could learn it safely. Ready for a witness who can <em>really</em> drift?
          </p>
          <button className="training-banner__cta" onClick={onEnterLive}>
            Act II · Put the live AI on the stand →
          </button>
        </>
      ) : (
        <>
          <p className="training-banner__text">
            Training case — the answers are scripted, the verdicts pre-checked.
            Learn the move: <strong>1</strong> question a suspect ·{" "}
            <strong>2</strong> press a claim you doubt · <strong>3</strong> read the
            stamp and open its citation.
          </p>
          <button className="training-banner__skip" onClick={onEnterLive}>
            Skip training
          </button>
        </>
      )}
    </aside>
  );
}
