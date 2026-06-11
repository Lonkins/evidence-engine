import type { Claim } from "../../engine/types";
import "./interrogation.css";

interface ClaimChipProps {
  claim: Claim;
  pressed: boolean;
  onPress: (claim: Claim) => void;
}

const VERDICT_GLYPH: Record<Claim["verdict"], string> = {
  SUPPORTED: "✓",
  CONTRADICTED: "✗",
  UNSUPPORTED: "—",
};

/**
 * A factual claim embedded in testimony. Unpressed it reads as an assertion
 * the player can challenge; pressed it carries its verdict glyph inline.
 */
export function ClaimChip({ claim, pressed, onPress }: ClaimChipProps) {
  if (pressed) {
    return (
      <span className={`claim claim--pressed claim--${claim.verdict.toLowerCase()}`}>
        {claim.text}
        <span className="claim__glyph" aria-label={`Verdict: ${claim.verdict}`}>
          {VERDICT_GLYPH[claim.verdict]}
        </span>
      </span>
    );
  }

  return (
    <button
      className="claim claim--unpressed"
      onClick={() => onPress(claim)}
      title="Press this claim against the evidence file"
    >
      {claim.text}
      <span className="claim__press-hint" aria-hidden="true">
        press
      </span>
    </button>
  );
}
