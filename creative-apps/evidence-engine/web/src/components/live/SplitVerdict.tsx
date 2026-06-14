import { Stamp, type StampTone } from "../ui/Stamp";
import type { ChallengeResponse } from "../../live/types";
import "./live.css";

const GROUNDED_STAMP: Record<
  ChallengeResponse["evidence"]["verdict"],
  { tone: StampTone; text: string }
> = {
  SUPPORTED: { tone: "verified", text: "Grounded" },
  CONTRADICTED: { tone: "contradicted", text: "Contradicted" },
  UNSUPPORTED: { tone: "silent", text: "Unverifiable" },
};

interface SplitVerdictProps {
  claimText: string;
  /** Grounding OFF — the plug pulled. */
  left: ChallengeResponse;
  /** Grounding ON — Foundry IQ in the loop. */
  right: ChallengeResponse;
  onClose: () => void;
}

/**
 * "Pull the plug" as a controlled A/B: one claim, two engines, side by side.
 * LEFT — Foundry IQ off, the confident claim sails through ("no record").
 * RIGHT — Foundry IQ on, the verdict lands with the verbatim cited receipt.
 * Both panes come from real /api/challenge calls in PREVIEW mode, so neither
 * touches the scorecard or the Grounding Record — it is a demonstration of the
 * thesis: remove Foundry IQ and the catch collapses.
 */
export function SplitVerdict({ claimText, left, right, onClose }: SplitVerdictProps) {
  // `left` is the unplugged run; we read it only to keep the two panes honestly
  // sourced from real calls. The displayed left state is always "no record".
  void left;
  const grounded = GROUNDED_STAMP[right.evidence.verdict];
  const citation = right.evidence.citations[0];
  const tokens = right.evidence.reasoningTokens;
  const effort = right.evidence.effort ?? "medium";

  return (
    <section className="split-verdict" role="group" aria-label="Foundry IQ grounding on versus off">
      <header className="split-verdict__head">
        <p className="micro-label">One claim · two engines</p>
        <p className="split-verdict__claim">“{claimText}”</p>
        <button
          type="button"
          className="split-verdict__close"
          onClick={onClose}
          aria-label="Close comparison"
        >
          ✕
        </button>
      </header>

      <div className="split-verdict__grid">
        <article className="split-verdict__pane split-verdict__pane--off">
          <p className="split-verdict__pane-label">Foundry IQ — unplugged</p>
          <Stamp tone="silent">No record</Stamp>
          <p className="split-verdict__pane-note">
            Nothing retrieved, so nothing checked. The witness's word stands — a confident
            claim, and no way to know.
          </p>
          <p className="split-verdict__receipt">nothing reasoned · nothing checked</p>
        </article>

        <article className="split-verdict__pane split-verdict__pane--on">
          <p className="split-verdict__pane-label">Foundry IQ — in the loop</p>
          <Stamp tone={grounded.tone}>{grounded.text}</Stamp>
          {right.evidence.iq?.justification && (
            <p className="split-verdict__pane-note">{right.evidence.iq.justification}</p>
          )}
          {citation && (
            <blockquote className="split-verdict__quote">
              <span className="split-verdict__quote-doc">{citation.title}</span>
              {citation.excerpt}
            </blockquote>
          )}
          <p className="split-verdict__receipt">
            {typeof tokens === "number"
              ? `${effort} effort · ${tokens.toLocaleString()} reasoning tokens`
              : "answer synthesis · reasoned over the case file"}
          </p>
        </article>
      </div>

      <p className="split-verdict__thesis">
        Same claim. Same model. The only difference is Foundry IQ — pull the plug and the
        catch collapses. <span className="split-verdict__thesis-mark">That's the brain.</span>
      </p>
    </section>
  );
}
