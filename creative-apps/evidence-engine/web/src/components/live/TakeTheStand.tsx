import { useState, type FormEvent } from "react";
import * as api from "../../live/api";
import type { StandAnswerResponse } from "../../live/types";
import { Stamp, type StampTone } from "../ui/Stamp";
import "./live.css";

const VERDICT_STAMP: Record<
  StandAnswerResponse["evidence"]["verdict"],
  { tone: StampTone; text: string }
> = {
  SUPPORTED: { tone: "verified", text: "Grounded" },
  CONTRADICTED: { tone: "contradicted", text: "Contradicted — caught" },
  UNSUPPORTED: { tone: "silent", text: "Unverifiable" },
};

const VERDICT_NOTE: Record<StandAnswerResponse["evidence"]["verdict"], string> = {
  SUPPORTED:
    "The record backs you up — that one holds. Grounded statements survive cross-examination.",
  CONTRADICTED:
    "Caught. The record says otherwise, cited below — verbatim. Confidence didn't save you; the receipt convicts.",
  UNSUPPORTED:
    "The record can't speak to that, so it won't be taken as fact. Unverifiable isn't false — but it isn't proof either. You'd need a receipt.",
};

interface TakeTheStandProps {
  sessionId: string;
  /** What the engine checks the player's claim against — e.g. "the case file" or the BYO source title. */
  sourceLabel: string;
  onClose: () => void;
}

/**
 * The inversion: Foundry IQ interrogates the human. The player asserts a claim,
 * and the same grounded engine that catches the witnesses now checks the player —
 * bluff and the record catches you, with the receipt.
 */
export function TakeTheStand({ sessionId, sourceLabel, onClose }: TakeTheStandProps) {
  const [draft, setDraft] = useState("");
  const [result, setResult] = useState<StandAnswerResponse | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const claim = draft.trim();
    if (!claim || pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await api.standAnswer(sessionId, claim);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  };

  const again = () => {
    setResult(null);
    setDraft("");
    setError(null);
  };

  const verdict = result ? VERDICT_STAMP[result.evidence.verdict] : null;
  const tokens = result?.evidence.reasoningTokens;

  return (
    <div className="take-stand" role="dialog" aria-modal="true" aria-label="You take the stand">
      <div className="take-stand__card">
        <header className="take-stand__head">
          <p className="micro-label">The tables turn</p>
          <h2 className="take-stand__title">You take the stand</h2>
          <button
            type="button"
            className="take-stand__close"
            onClick={onClose}
            aria-label="Step down from the stand"
          >
            ✕
          </button>
        </header>

        <p className="take-stand__brief">
          You've spent the session catching the witnesses. Now it's your turn under oath.
          Make a claim — anything you assert, <strong>Foundry IQ checks it against{" "}
          {sourceLabel}, live.</strong> Bluff, and the record catches <em>you</em>.
        </p>

        {!result ? (
          <form className="take-stand__form" onSubmit={submit}>
            <textarea
              className="take-stand__input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
              maxLength={600}
              placeholder="State it plainly — and stake your credibility on it."
              aria-label="Your statement under oath"
              disabled={pending}
            />
            <div className="take-stand__actions">
              <span className="take-stand__count">{draft.trim().length}/600</span>
              <button
                type="submit"
                className="take-stand__submit"
                disabled={pending || draft.trim().length === 0}
              >
                {pending ? "Foundry IQ is checking…" : "Swear to it"}
              </button>
            </div>
            {error && (
              <p className="take-stand__error" role="alert">
                The line dropped: {error}
              </p>
            )}
          </form>
        ) : (
          <div className={`take-stand__verdict take-stand__verdict--${result.evidence.verdict.toLowerCase()}`}>
            <header className="take-stand__verdict-head">
              {verdict && <Stamp tone={verdict.tone}>{verdict.text}</Stamp>}
              <blockquote className="take-stand__statement">“{result.answer}”</blockquote>
            </header>

            <p className="take-stand__note">{VERDICT_NOTE[result.evidence.verdict]}</p>

            {result.evidence.iq?.justification && (
              <p className="take-stand__iq">
                <span className="take-stand__iq-tag" aria-hidden="true">Foundry IQ</span>
                {result.evidence.iq.justification}
              </p>
            )}

            {result.evidence.citations.length > 0 && (
              <ul className="take-stand__citations">
                {result.evidence.citations.map((citation, index) => (
                  <li key={`${citation.docKey}-${index}`}>
                    <span className="take-stand__cite-doc">{citation.title}</span>
                    <blockquote className="take-stand__cite-quote">{citation.excerpt}</blockquote>
                  </li>
                ))}
              </ul>
            )}

            <p className="take-stand__receipt">
              {result.evidence.source === "iq"
                ? `Foundry IQ · ${result.evidence.effort ?? "medium"} effort · ${
                    typeof tokens === "number" ? tokens.toLocaleString() : "—"
                  } reasoning tokens`
                : "Deterministic cross-check · 0 reasoning tokens"}
            </p>

            <div className="take-stand__actions">
              <button type="button" className="surface-link" onClick={onClose}>
                Step down
              </button>
              <button type="button" className="take-stand__submit" onClick={again}>
                Make another claim
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
